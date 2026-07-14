// Content moderation service. Runs user-supplied text through a set of checks
// (profanity, PII, prompt injection, and org-defined custom rules) and reports
// any flags without throwing. Callers decide what to do with the result.

import { prisma } from '@convio/database'

export type ModerationSeverity = 'low' | 'medium' | 'high'

export type ModerationFlagType =
  | 'profanity'
  | 'pii'
  | 'injection'
  | 'custom'

export interface ModerationFlag {
  type: ModerationFlagType
  severity: ModerationSeverity
  match: string
  /** Human-readable label describing what was matched (e.g. "email", "credit_card"). */
  label?: string
}

export interface ModerationCustomRule {
  name: string
  /** A literal keyword (case-insensitive) or, when isRegex is true, a regex source string. */
  pattern: string
  isRegex?: boolean
  severity?: ModerationSeverity
}

export interface ModerationRules {
  enabled?: boolean
  profanityEnabled?: boolean
  piiEnabled?: boolean
  injectionEnabled?: boolean
  customRules?: ModerationCustomRule[]
}

export interface ModerationResult {
  passed: boolean
  flags: ModerationFlag[]
}

// A compact profanity blocklist. Kept intentionally small and dependency-free;
// swap in leo-profanity or a managed list if broader coverage is needed.
const PROFANITY_BLOCKLIST = [
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'bastard',
  'cunt',
  'dick',
  'piss',
  'slut',
  'whore',
  'nigger',
  'faggot',
  'retard',
]

// PII detectors. Each returns matches with a fixed severity. Ordered from most
// to least sensitive so higher-severity matches surface first.
const PII_DETECTORS: { label: string; severity: ModerationSeverity; regex: RegExp }[] = [
  {
    label: 'credit_card',
    severity: 'high',
    // 13-16 digit sequences, optionally separated by spaces or hyphens.
    regex: /\b(?:\d[ -]*?){13,16}\b/g,
  },
  {
    label: 'ssn',
    severity: 'high',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
  },
  {
    label: 'email',
    severity: 'medium',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    label: 'phone',
    severity: 'low',
    // International and North-American style numbers with common separators.
    regex: /(?:\+?\d{1,3}[ .-]?)?(?:\(\d{2,4}\)[ .-]?)?\d{3}[ .-]?\d{3,4}[ .-]?\d{0,4}/g,
  },
]

// Prompt-injection / jailbreak heuristics. Matches common attempts to override
// system instructions or extract the hidden prompt.
const INJECTION_PATTERNS: { label: string; regex: RegExp }[] = [
  { label: 'ignore_instructions', regex: /ignore\s+(?:all\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\s+(?:instructions|prompts?|messages?|rules?)/i },
  { label: 'disregard_instructions', regex: /disregard\s+(?:all\s+)?(?:the\s+)?(?:previous|prior|above|system)\s+(?:instructions|prompts?|rules?)/i },
  { label: 'reveal_system_prompt', regex: /(?:reveal|show|print|repeat|tell me)\s+(?:your\s+|the\s+)?(?:system\s+)?(?:prompt|instructions|initial message)/i },
  { label: 'developer_mode', regex: /(?:developer|dev|debug|god)\s+mode/i },
  { label: 'jailbreak', regex: /\b(?:jailbreak|DAN mode|do anything now)\b/i },
  { label: 'role_override', regex: /you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new)\s+(?:ai|assistant|agent|model|persona)/i },
  { label: 'forget_rules', regex: /forget\s+(?:everything|all|your)\s+(?:instructions|rules|training|guidelines)/i },
]

function truncate(match: string, max = 120): string {
  const trimmed = match.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed
}

function checkProfanity(text: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  const lower = text.toLowerCase()
  for (const word of PROFANITY_BLOCKLIST) {
    // Word-boundary match so "class" doesn't trip on "ass".
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    const found = lower.match(regex)
    if (found) {
      flags.push({ type: 'profanity', severity: 'medium', match: word })
    }
  }
  return flags
}

function checkPii(text: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  for (const detector of PII_DETECTORS) {
    const matches = text.match(detector.regex)
    if (!matches) continue
    for (const m of matches) {
      const cleaned = m.trim()
      // Guard the loose numeric detectors against short/false matches.
      const digitCount = (cleaned.match(/\d/g) ?? []).length
      if (detector.label === 'credit_card' && digitCount < 13) continue
      if (detector.label === 'phone' && digitCount < 7) continue
      flags.push({
        type: 'pii',
        severity: detector.severity,
        match: truncate(cleaned),
        label: detector.label,
      })
    }
  }
  return flags
}

function checkInjection(text: string): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  for (const pattern of INJECTION_PATTERNS) {
    const found = text.match(pattern.regex)
    if (found) {
      flags.push({
        type: 'injection',
        severity: 'high',
        match: truncate(found[0]),
        label: pattern.label,
      })
    }
  }
  return flags
}

function checkCustom(text: string, rules: ModerationCustomRule[]): ModerationFlag[] {
  const flags: ModerationFlag[] = []
  for (const rule of rules) {
    if (!rule?.pattern) continue
    try {
      let matched: string | null = null
      if (rule.isRegex) {
        const regex = new RegExp(rule.pattern, 'i')
        const found = text.match(regex)
        matched = found ? found[0] : null
      } else {
        const idx = text.toLowerCase().indexOf(rule.pattern.toLowerCase())
        matched = idx >= 0 ? text.slice(idx, idx + rule.pattern.length) : null
      }
      if (matched !== null) {
        flags.push({
          type: 'custom',
          severity: rule.severity ?? 'medium',
          match: truncate(matched),
          label: rule.name,
        })
      }
    } catch {
      // Invalid regex in a custom rule — skip it rather than failing the whole check.
      continue
    }
  }
  return flags
}

/**
 * Run `text` through the configured moderation checks.
 * Returns { passed, flags }; `passed` is false when any flag is raised.
 * Never throws on bad input — invalid custom rules are skipped.
 */
export function checkContent(text: string, rules: ModerationRules = {}): ModerationResult {
  const flags: ModerationFlag[] = []

  if (!text || typeof text !== 'string') {
    return { passed: true, flags: [] }
  }

  // A disabled config short-circuits all checks.
  if (rules.enabled === false) {
    return { passed: true, flags: [] }
  }

  if (rules.profanityEnabled !== false) {
    flags.push(...checkProfanity(text))
  }
  if (rules.piiEnabled !== false) {
    flags.push(...checkPii(text))
  }
  if (rules.injectionEnabled !== false) {
    flags.push(...checkInjection(text))
  }
  if (rules.customRules && rules.customRules.length > 0) {
    flags.push(...checkCustom(text, rules.customRules))
  }

  return { passed: flags.length === 0, flags }
}

export interface OrgModerationResult extends ModerationResult {
  /** Whether moderation is enabled for the org (checks were actually applied). */
  enabled: boolean
  /** Whether a violation should block the message (vs. flag-and-continue). */
  blockOnViolation: boolean
}

/**
 * Load an organization's stored moderation config and run `text` through it.
 * When moderation is disabled or not configured, returns passed=true with
 * enabled=false so callers can skip enforcement without special-casing.
 */
export async function moderateForOrg(organizationId: string, text: string): Promise<OrgModerationResult> {
  const config = await prisma.moderationConfig.findUnique({
    where: { organizationId },
  })

  if (!config || !config.enabled) {
    return { passed: true, flags: [], enabled: false, blockOnViolation: false }
  }

  const rules: ModerationRules = {
    enabled: true,
    profanityEnabled: config.profanityEnabled,
    piiEnabled: config.piiEnabled,
    injectionEnabled: config.injectionEnabled,
    customRules: Array.isArray(config.customRules)
      ? (config.customRules as unknown as ModerationRules['customRules'])
      : [],
  }

  const result = checkContent(text, rules)
  return { ...result, enabled: true, blockOnViolation: config.blockOnViolation }
}

