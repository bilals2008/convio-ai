export function passwordStrength(password: string): { label: string; color: string; width: string; segments: number } {
  if (!password) return { label: '', color: '', width: '0%', segments: 0 }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  const segments = Math.min(score, 4)
  if (segments <= 1) return { label: 'Weak', color: 'bg-destructive', width: '25%', segments: 1 }
  if (segments === 2) return { label: 'Fair', color: 'bg-warning', width: '50%', segments: 2 }
  if (segments === 3) return { label: 'Good', color: 'bg-info', width: '75%', segments: 3 }
  return { label: 'Strong', color: 'bg-success', width: '100%', segments: 4 }
}

export function isStrongPassword(password: string): boolean {
  return passwordStrength(password).segments === 4
}
