import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/entities/user/model/store'
import LoginPage from '@/pages/login/LoginPage'
import RegisterPage from '@/pages/register/RegisterPage.jsx'
import {HomePage} from "@/pages/home/HomePage.jsx";
import {DashboardPage} from "@/pages/dashboard/DashboardPage.jsx";
import {TeamPage} from "@/pages/team/TeamPage.jsx";
import {TasksPage} from "@/pages/tasks/TasksPage.jsx";
import {TasksArchivePage} from "@/pages/tasks-archive/TasksArchivePage.jsx";
import {TaskCheckPage} from "@/pages/task-check/TaskCheckPage.jsx"
import {LeaderboardPage} from "@/pages/leaderboard/LeaderboardPage.jsx";
import {CompanyPage} from "@/pages/company/CompanyPage.jsx";
import {UserTasksPage} from "@/pages/user-tasks/UserTasksPage.jsx";
import {ActiveTasksPage} from "@/pages/active-tasks/ActiveTasksPage.jsx";
import {ProfilePage} from "@/pages/profile/ProfilePage.jsx";
import { TaskPointsHistoryPage } from '@/pages/task-points-history/TaskPointsHistoryPage.jsx'

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RoleProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, user } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return allowedRoles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />
}

function PublicRoute({ children }) {
    const { isAuthenticated } = useAuthStore()
    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

function RootRoute() {
    const { isAuthenticated } = useAuthStore()
    return <Navigate to={isAuthenticated ? "/dashboard" : "/home"} replace />
}

function EmployeeToProfileRedirect() {
    const { userId } = useParams()
    return <Navigate to={`/profile/${userId}`} replace />
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

                <Route
                    path="/team"
                    element={
                        <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                            <TeamPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/tasks"
                    element={
                        <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                            <TasksPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/tasks-archive"
                    element={
                        <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                            <TasksArchivePage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/my-tasks"
                    element={
                        <RoleProtectedRoute allowedRoles={['user', 'head']}>
                            <UserTasksPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/active-tasks"
                    element={
                        <RoleProtectedRoute allowedRoles={['user', 'head']}>
                            <ActiveTasksPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/task-check"
                    element={
                        <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                            <TaskCheckPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/leaderboard"
                    element={
                        <ProtectedRoute>
                            <LeaderboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/company"
                    element={
                        <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                            <CompanyPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/task-points-history"
                    element={
                        <RoleProtectedRoute allowedRoles={['admin', 'supervisor']}>
                            <TaskPointsHistoryPage />
                        </RoleProtectedRoute>
                    }
                />

                <Route
                    path="/employee/:userId"
                    element={
                        <ProtectedRoute>
                            <EmployeeToProfileRedirect />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:userId"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route path="/" element={<RootRoute />} />
            </Routes>
        </BrowserRouter>
    )
}
