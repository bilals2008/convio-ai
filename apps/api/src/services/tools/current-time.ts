export function getCurrentTime(timezone?: string): string {
  const now = new Date()

  try {
    if (timezone) {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }
      return new Intl.DateTimeFormat('en-US', options).format(now)
    }
  } catch {
    // Invalid timezone provided — fall through to default
  }

  return now.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })
}
