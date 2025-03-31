import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import LoadingPage from '../components/LoadingPage';

// User interface definition
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'client' | 'lawyer';
  roles: string[];
  barNumber?: string;
}

// Auth context interface
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRoles: string[];
  isLoading: boolean;
  api: AxiosInstance;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<any>;
  logout: () => Promise<void>;
}

// Signup data interface
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'client' | 'lawyer';
  barNumber?: string;
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

// Create context with null default value
const AuthContext = createContext<AuthContextType | null>(null);

// Base API URL
const API_BASE_URL = 'http://192.168.0.101:5000/api';

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State declarations
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Create axios instance
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor for adding auth token
  api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response interceptor for handling token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== '/auth/refresh' &&
        originalRequest.url !== '/auth/login'
      ) {
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          console.log('Attempting to refresh token');
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } }
          );
          
          const { access_token } = response.data;
          localStorage.setItem('accessToken', access_token);
          
          // Update the authorization header
          const newAuthHeader = `Bearer ${access_token}`;
          api.defaults.headers.common.Authorization = newAuthHeader;
          
          // Also update the original request header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = newAuthHeader;
          }
          
          console.log('Token refreshed successfully');
          
          // Retry the original request with the new token
          return axios(originalRequest);
        } catch (refreshError) {
          // Handle refresh token failure
          console.error('Token refresh failed:', refreshError);
          
          // Clear authentication state
          setIsAuthenticated(false);
          setUser(null);
          setUserRoles([]);
          
          // Clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          // Redirect to login
          navigate('/login');
          
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');
        
        if (!accessToken || !refreshToken || !storedUser) {
          console.log('No stored authentication data found');
          throw new Error('Missing authentication data');
        }
        
        // Set the token in API headers
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        
        // Parse user data
        const userData: User = JSON.parse(storedUser);
        console.log('Found stored user data:', { email: userData.email, type: userData.userType });
        
        try {
          // Verify token by making a request to the /me endpoint
          console.log('Verifying token with /me endpoint');
          const meResponse = await api.get('/auth/me');
          const updatedUserData = meResponse.data;
          
          // Set authentication state with potentially updated user data
          setIsAuthenticated(true);
          setUser(updatedUserData);
          setUserRoles(updatedUserData.roles || []);
          
          // Update stored user data if it's different
          if (JSON.stringify(updatedUserData) !== storedUser) {
            localStorage.setItem('user', JSON.stringify(updatedUserData));
          }
          
          console.log('Token verified successfully');
          
          // Redirect if on authentication pages
          if (['/login', '/signup', '/'].includes(location.pathname)) {
            const defaultRoute = updatedUserData.userType === 'lawyer' ? '/lawyer' : '/client';
            navigate(defaultRoute);
          }
        } catch (verifyError) {
          console.log('Token verification failed, attempting refresh');
          // Try to refresh the token
          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${refreshToken}` } }
            );
            
            const { access_token } = response.data;
            localStorage.setItem('accessToken', access_token);
            
            // Update the API headers with the new token
            api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
            
            console.log('Token refreshed successfully');
            
            // Set authentication state
            setIsAuthenticated(true);
            setUser(userData);
            setUserRoles(userData.roles || []);
          } catch (refreshError) {
            console.log('Token refresh failed, logging out');
            // If token refresh fails, clear auth state
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            setIsAuthenticated(false);
            setUser(null);
            setUserRoles([]);
          }
        }
      } catch (error) {
        console.log('Authentication initialization error:', error);
        // Reset auth state on error
        setIsAuthenticated(false);
        setUser(null);
        setUserRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { access_token, refresh_token, user: userData } = response.data;
      
      // Save tokens and user data
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set the token in the API headers for future requests
      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      
      // Update state
      setIsAuthenticated(true);
      setUser(userData);
      setUserRoles(userData.roles || []);
      
      // Redirect to appropriate dashboard
      const defaultRoute = userData.userType === 'lawyer' ? '/lawyer' : '/client';
      const from = (location.state as { from?: string })?.from || defaultRoute;
      
      navigate(from, { replace: true });
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (userData: SignupData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Use axios directly to avoid potential interceptor loops
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if the API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear authorization header
      delete api.defaults.headers.common.Authorization;
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      setUserRoles([]);
      
      // Navigate to login page
      navigate('/login');
      setIsLoading(false);
    }
  };

  // Show loading page while authentication is being initialized
  if (isLoading) {
    return <LoadingPage />;
  }

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userRoles,
        isLoading,
        api,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};