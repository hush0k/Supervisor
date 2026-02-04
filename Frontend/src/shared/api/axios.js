import axios from 'axios'

const API_URL = 'http://localhost:8000/api/v1'

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
                try {
                    const { data } = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    })

                    localStorage.setItem('access_token', data.access_token)
                    localStorage.setItem('refresh_token', data.refresh_token)

                    originalRequest.headers.Authorization = `Bearer ${data.access_token}`
                    return axiosInstance(originalRequest)
                } catch (refreshError) {
                    localStorage.clear()
                    window.location.href = '/'
                    return Promise.reject(refreshError)
                }
            }
        }

        return Promise.reject(error)
    }
)


export default axiosInstance