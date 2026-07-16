import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  loginGoogle: (credentials?: { email: string; firstName: string; lastName: string; workspaceName?: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const cachedUser = localStorage.getItem('user');
          if (cachedUser) {
            setUser(JSON.parse(cachedUser));
          }
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: any) => {
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user: loggedInUser, workspace, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      if (workspace) {
        localStorage.setItem('activeWorkspaceId', workspace.id);
        localStorage.setItem('activeWorkspaceName', workspace.name);
      }
      setUser(loggedInUser);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const loginGoogle = async (credentials?: { email: string; firstName: string; lastName: string; workspaceName?: string }) => {
    setError(null);
    try {
      const response = await apiClient.post('/auth/google-simulated', credentials);
      const { user: loggedInUser, workspace, accessToken } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      if (workspace) {
        localStorage.setItem('activeWorkspaceId', workspace.id);
        localStorage.setItem('activeWorkspaceName', workspace.name);
      }
      setUser(loggedInUser);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Google Sign In failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const register = async (data: any) => {
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('activeWorkspaceId');
    localStorage.removeItem('activeWorkspaceName');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginGoogle,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
