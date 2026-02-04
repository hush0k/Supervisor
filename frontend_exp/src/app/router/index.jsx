import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/entities/user/model/store'
import LoginPage from '@/pages/login/LoginPage'
import RegisterPage from '@/pages/register/RegisterPage.jsx'
import {HomePage} from "@/pages/home/homePage.jsx";
import {DashboardPage} from "@/pages/dashboard/dashboardPage.jsx";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
    const { isAuthenticated } = useAuthStore()
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function RootRoute() {
    const { isAuthenticated } = useAuthStore()
    return <Navigate to={isAuthenticated ? "/dashboard" : "/home"} replace />
}

export function AppRouter() {
    const { isInitialized } = useAuthStore()

    if (!isInitialized) {
        return <div>Loading...</div>
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/home"
                    element={
                        <HomePage />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <LoginPage />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <RegisterPage />
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<RootRoute />} />
            </Routes>
        </BrowserRouter>
    )
}