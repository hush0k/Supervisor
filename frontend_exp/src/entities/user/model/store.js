import { create } from 'zustand'
import axiosInstance from '@/shared/api/axios'


const translateError = (msg) => {
    if (!msg) return msg
    return msg
        .replace('String should have at least', 'Минимум')
        .replace('String should have at most', 'Максимум')
        .replace('characters', 'символов')
        .replace('Field required', 'Обязательное поле')
        .replace('Value error,', '')
        .replace('Input should be a valid', 'Должно быть')
        .replace('integer', 'целым числом')
        .replace('string', 'строкой')
        .replace('date', 'датой')
        .replace('greater than 0', 'больше 0')
        .replace('Input should be greater than', 'Значение должно быть больше')
        .trim()
}

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    isLoggingOut: false,


    login: async (login, password) => {
        set({ isLoading: true })
        try {
            const { data } = await axiosInstance.post('/auth/login', { login, password })

            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)

            const userResponse = await axiosInstance.get('/auth/me')
            set({ user: userResponse.data, isAuthenticated: true, isLoading: false })

            return { success: true }
        } catch (error) {
            set({ isLoading: false })

            console.error('Login error', error)

            let errorMessage = 'Ошибка входа'

            if (error.response) {
                errorMessage = error.response.data?.detail || 'Неверный логин или пароль'
            } else if (error.request) {
                errorMessage = 'Сервер не отвечает'
            }

            console.log('Returning error:', errorMessage)
            return { success: false, error: error.response?.data?.detail || 'Login failed' }
        }
    },

    logout: () => {
        set({ isLoadingOut: true })
        localStorage.clear()
        set({ user: null, isAuthenticated: false, isLoadingOut: false })

    },

    checkAuth: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            set({ isInitialized: true })
            return
        }

        try {
            const { data } = await axiosInstance.get('/auth/me')
            set({ user: data, isAuthenticated: true, isInitialized: true })
        } catch {
            localStorage.clear()
            set({ user: null, isAuthenticated: false, isInitialized: true })
        }
    },

    registerCompany: async (formData) => {
        set({isLoading: true})
        try {
            const { data } = await axiosInstance.post('/auth/register-company', formData)

            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)

            const userResponse = await axiosInstance.get('/auth/me')
            set({ user: userResponse.data, isAuthenticated: true, isLoading: false })

            return { success: true }
        } catch (error) {
            set({ isLoading: false })

            console.error('Register error', error)

            const fieldErrors = {}
            let generalError = 'Ошибка регистрации'

            if (error.response) {
                const detail = error.response.data?.detail

                if (Array.isArray(detail)) {
                    // Pydantic validation errors - парсим по loc
                    detail.forEach(err => {
                        const field = err.loc?.[err.loc.length - 1] // последний элемент loc - имя поля
                        const msg = translateError(err.msg)
                        if (field) {
                            fieldErrors[field] = msg
                        }
                    })
                    generalError = Object.values(fieldErrors).join('; ') || generalError
                } else {
                    generalError = detail || 'Не удалось зарегистрироваться'
                }
            } else if (error.request) {
                generalError = 'Сервер не отвечает'
            }

            return { success: false, error: generalError, fieldErrors }
        }
    }
}))