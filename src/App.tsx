import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage'
import { RestaurantsPage } from './pages/RestaurantsPage'
import { OrdersPage } from './pages/OrdersPage'
import { Layout } from './components/Layout'
import { CategoriesPage } from './pages/CategoriesPage'
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="restaurants" element={<RestaurantsPage />} />
            <Route path="orders" element={<OrdersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}