import api from '@/lib/api'
import type { Onboarding } from '@convio/types'

export async function getOnboarding(): Promise<Onboarding> {
  const res = await api.get('/auth/onboarding')
  return res.data.data
}

export async function setOnboardingGoal(goal: string): Promise<Onboarding> {
  const res = await api.patch('/auth/onboarding', { goal, status: 'in_progress' })
  return res.data.data
}

export async function completeOnboarding(): Promise<Onboarding> {
  const res = await api.patch('/auth/onboarding', { status: 'completed' })
  return res.data.data
}

export async function skipOnboarding(): Promise<Onboarding> {
  const res = await api.patch('/auth/onboarding', { status: 'skipped' })
  return res.data.data
}

export async function resetOnboarding(): Promise<Onboarding> {
  const res = await api.patch('/auth/onboarding', { status: 'not_started', goal: null })
  return res.data.data
}
