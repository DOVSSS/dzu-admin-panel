type AxiosLikeError = {
  message?: string
  response?: {
    status?: number
    data?: { message?: string | string[] }
  }
}

function translate(message: string): string {
  const lower = message.trim().toLowerCase()
  if (lower === 'internal server error') {
    return 'Не удалось сохранить данные. Попробуйте ещё раз.'
  }
  if (lower === 'category not found') return 'Категория не найдена'
  if (lower.startsWith('request failed with status code')) {
    return 'Не удалось выполнить запрос. Попробуйте ещё раз.'
  }
  return message.trim()
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as AxiosLikeError
  const serverMessage = err.response?.data?.message

  if (typeof serverMessage === 'string' && serverMessage.trim()) {
    return translate(serverMessage)
  }
  if (Array.isArray(serverMessage) && serverMessage[0]) {
    return translate(String(serverMessage[0]))
  }

  if (err.response?.status === 409) {
    return 'Запись с таким названием уже существует'
  }
  if (err.response?.status && err.response.status >= 500) {
    return 'Внутренняя ошибка сервера. Попробуйте ещё раз.'
  }

  return fallback
}
