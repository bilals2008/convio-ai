import { toast as sonnerToast } from 'sonner'

type ToastMessage = string | (() => string)

function normalize(msg: ToastMessage): string {
  return typeof msg === 'function' ? msg() : msg
}

export const toast = {
  success: (msg: ToastMessage) => sonnerToast.success(normalize(msg)),
  error: (msg: ToastMessage) => sonnerToast.error(normalize(msg)),
  warning: (msg: ToastMessage) => sonnerToast.warning(normalize(msg)),
  info: (msg: ToastMessage) => sonnerToast.info(normalize(msg)),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => sonnerToast.promise(promise, messages),
}
