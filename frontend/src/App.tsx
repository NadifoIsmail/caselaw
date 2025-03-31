import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import { Contact } from "./pages/Contact";
import { Login } from "./pages/authpage/Login";
import { SignUp } from "./pages/authpage/SignUp";
import { Layout } from "./pages/Layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ForgotPasswordPage } from "./pages/authpage/ForgotPassword";
import { LawyerDashboard } from "./pages/dashboard/lawyer/LawyerDashboard";
import { ClientDashboard } from "./pages/dashboard/client/ClientDashboard";
import { ReportCasePage } from "./pages/dashboard/client/ReportCasePage";
import { ActiveCasesPage } from "./pages/dashboard/client/ActiveCasesPage";
import { FindLawyerPage } from "./pages/dashboard/client/FindLawyerPage";
import { AvailableCasesPage } from "./pages/dashboard/lawyer/AvailableCasesPage";
import { AssignedCasesPage } from "./pages/dashboard/lawyer/AssingnedCases";
import LoadingPage from "./components/LoadingPage";

const queryClient = new QueryClient();

// Protected Route component that uses the auth context
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRoles, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingPage />;
  }

  // Check if user is authenticated and has the required role
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has at least one of the allowed roles
  const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role));
  if (!hasAllowedRole) {
    // Redirect to the appropriate dashboard based on their role
    const defaultRoute = userRoles.includes("lawyer") ? "/lawyer" : "/client";
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

// Public Route component that redirects authenticated users
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userRoles, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingPage />;
  }

  // If authenticated, redirect to the appropriate dashboard
  if (isAuthenticated) {
    const defaultRoute = userRoles.includes("lawyer") ? "/lawyer" : "/client";
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

// Component to handle catch-all routes
const NotFoundRedirect: React.FC = () => {
  const { isAuthenticated, userRoles } = useAuth();
  
  if (isAuthenticated && userRoles.length > 0) {
    // If authenticated, redirect to their dashboard
    const defaultRoute = userRoles.includes("lawyer") ? "/lawyer" : "/client";
    return <Navigate to={defaultRoute} replace />;
  }
  
  // If not authenticated, redirect to signup
  return <Navigate to="/signup" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
        <Route path="/services" element={<PublicRoute><Services /></PublicRoute>} />
        <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
      </Route>
      
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      
      {/* Protected client routes */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<ReportCasePage />} />
        <Route path="cases" element={<ActiveCasesPage />} />
        <Route path="report" element={<ReportCasePage />} />
        <Route path="find-lawyer" element={<FindLawyerPage />} />
      </Route>
      
      {/* Protected lawyer routes */}
      <Route
        path="/lawyer"
        element={
          <ProtectedRoute allowedRoles={["lawyer"]}>
            <LawyerDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProtectedRoute allowedRoles={["lawyer"]}><AssignedCasesPage /></ProtectedRoute>} />
        <Route path="/lawyer/assigned" element={<ProtectedRoute allowedRoles={["lawyer"]}><AssignedCasesPage /></ProtectedRoute>} />
        <Route path="/lawyer/available" element={<ProtectedRoute allowedRoles={["lawyer"]}><AvailableCasesPage /></ProtectedRoute>} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}