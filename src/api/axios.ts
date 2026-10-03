import axios from 'axios'

const api = axios.create({
  baseURL: 'https://delivery-backend-alichan25.amvera.io/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    if (error.response?.status === 403) {
      console.error('Доступ запрещён:', error.response?.data?.message)
    }
    return Promise.reject(error)
  }
)

export default api