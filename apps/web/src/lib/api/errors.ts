const STATUS_MESSAGES: Record<number, string> = {
  400: 'Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  422: 'The request could not be processed. Please check your input.',
  429: 'Too many requests. Please try again shortly.',
}

const DEFAULT_ERROR = 'Something went wrong on our side. Please try again later.'
const NETWORK_ERROR = 'Connection issue detected. Check your internet connection and try again.'
const TIMEOUT_ERROR = 'The request took too long. Please try again.'

export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return DEFAULT_ERROR

  const err = error as { response?: { status?: number; data?: { message?: string } }; message?: string; code?: string }

  if (err.response?.status) {
    return STATUS_MESSAGES[err.response.status] || err.response.data?.message || DEFAULT_ERROR
  }

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return TIMEOUT_ERROR
  }

  if (err.message === 'Network Error') {
    return NETWORK_ERROR
  }

  return DEFAULT_ERROR
}
