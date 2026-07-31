import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOnboarding, setOnboardingGoal, completeOnboarding, skipOnboarding, resetOnboarding } from '@/lib/api/onboarding'
import type { OnboardingGoal } from '@convio/types'

export function useOnboarding() {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboarding,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useSetOnboardingGoal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (goal: OnboardingGoal) => setOnboardingGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}

export function useSkipOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: skipOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}

export function useResetOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resetOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] })
    },
  })
}
