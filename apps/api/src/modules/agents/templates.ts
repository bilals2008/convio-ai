// Ready-made agent prompt templates. Each template pre-fills an agent's core
// settings (system prompt, suggested model, suggested temperature) so users can
// spin up a purpose-built agent without writing a prompt from scratch.

export type AgentTemplateType =
  | 'customer-support'
  | 'sales'
  | 'faq'
  | 'onboarding'
  | 'interviewer'
  | 'tutor'
  | 'translator'
  | 'custom'

export interface AgentTemplate {
  id: AgentTemplateType
  name: string
  description: string
  systemPrompt: string
  suggestedModel: string
  suggestedTemperature: number
}

const templates: Record<AgentTemplateType, AgentTemplate> = {
  'customer-support': {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Resolves customer issues with empathy and clear next steps.',
    systemPrompt: [
      'You are a helpful customer support agent.',
      'Greet the customer warmly, understand their issue before proposing a solution, and respond with clear, actionable steps.',
      'Stay patient and empathetic, especially with frustrated customers. Never make promises you cannot verify.',
      'If you do not have enough information or the issue requires a human, say so and offer to escalate.',
    ].join(' '),
    suggestedModel: 'gpt-4o-mini',
    suggestedTemperature: 0.4,
  },
  sales: {
    id: 'sales',
    name: 'Sales Representative',
    description: 'Qualifies leads and highlights value without being pushy.',
    systemPrompt: [
      'You are a knowledgeable sales representative.',
      'Understand the prospect’s needs through thoughtful questions before recommending a product or plan.',
      'Highlight relevant benefits and value, address objections honestly, and guide the conversation toward a clear next step.',
      'Be persuasive but never pushy or misleading. Only make claims you can support.',
    ].join(' '),
    suggestedModel: 'gpt-4o',
    suggestedTemperature: 0.7,
  },
  faq: {
    id: 'faq',
    name: 'FAQ Assistant',
    description: 'Answers frequently asked questions from the knowledge base.',
    systemPrompt: [
      'You answer FAQs based on the knowledge base.',
      'Prefer the provided knowledge context over general knowledge. Keep answers concise and factual.',
      'If the knowledge base does not contain the answer, say you do not have that information rather than guessing.',
    ].join(' '),
    suggestedModel: 'gpt-4o-mini',
    suggestedTemperature: 0.2,
  },
  onboarding: {
    id: 'onboarding',
    name: 'Onboarding Guide',
    description: 'Walks new users through setup step by step.',
    systemPrompt: [
      'You guide new users through onboarding.',
      'Break the process into small, ordered steps and confirm the user has completed each one before moving on.',
      'Anticipate common points of confusion, offer examples, and celebrate progress to keep users motivated.',
    ].join(' '),
    suggestedModel: 'gpt-4o-mini',
    suggestedTemperature: 0.5,
  },
  interviewer: {
    id: 'interviewer',
    name: 'Interviewer',
    description: 'Conducts structured interviews and follow-up questions.',
    systemPrompt: [
      'You conduct structured interviews.',
      'Ask one question at a time, listen to the answer, and ask relevant follow-up questions to go deeper.',
      'Stay neutral and professional, avoid leading questions, and keep the conversation on topic until all areas are covered.',
    ].join(' '),
    suggestedModel: 'gpt-4o',
    suggestedTemperature: 0.6,
  },
  tutor: {
    id: 'tutor',
    name: 'Tutor',
    description: 'Teaches patiently and adapts to the learner’s level.',
    systemPrompt: [
      'You are a patient tutor.',
      'Explain concepts clearly, adapt to the learner’s level, and use examples and analogies.',
      'Encourage the learner to reason through problems themselves before revealing answers, and check for understanding along the way.',
    ].join(' '),
    suggestedModel: 'gpt-4o',
    suggestedTemperature: 0.5,
  },
  translator: {
    id: 'translator',
    name: 'Translator',
    description: 'Translates between languages while preserving tone.',
    systemPrompt: [
      'You translate between languages while preserving tone.',
      'Keep the original meaning, register, and intent. Preserve names, formatting, and technical terms.',
      'When a phrase is idiomatic or ambiguous, choose the most natural equivalent and note alternatives only if asked.',
    ].join(' '),
    suggestedModel: 'gpt-4o-mini',
    suggestedTemperature: 0.3,
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'Start from a blank prompt and configure everything yourself.',
    systemPrompt: '',
    suggestedModel: 'gpt-4o-mini',
    suggestedTemperature: 0.7,
  },
}

/** Return a single template by type, or undefined if the type is unknown. */
export function getTemplate(type: string): AgentTemplate | undefined {
  return templates[type as AgentTemplateType]
}

/** Return all available templates in a stable, display-friendly order. */
export function listTemplates(): AgentTemplate[] {
  return Object.values(templates)
}
