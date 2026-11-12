import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../api/client';

export type UserRole = 'FARMER' | 'GOVERNMENT_OFFICIAL' | 'ADMIN';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  email: string | null;
  mobile_number: string | null;
  role: UserRole;
  account_status: AccountStatus;
  is_mobile_verified: boolean;
  is_email_verified: boolean;
  created_at: string;
  display_name: string;
  profile?: Record<string, any>;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<UserProfile>;
  registerFarmer: (data: any) => Promise<UserProfile>;
  registerOfficial: (data: any) => Promise<{ status: string; message: string }>;
  logout: () => Promise<void>;
  verifyMobileOtp: (mobileNumber: string, otpCode: string) => Promise<boolean>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('agrisentinel_token') || sessionStorage.getItem('agrisentinel_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user details on boot
  const refreshCurrentUser = async () => {
    const currentToken = localStorage.getItem('agrisentinel_token') || sessionStorage.getItem('agrisentinel_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await apiRequest<UserProfile>('/auth/me');
      setUser(userData);
    } catch {
      // Token invalid or expired
      localStorage.removeItem('agrisentinel_token');
      sessionStorage.removeItem('agrisentinel_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCurrentUser();
  }, []);

  const login = async (identifier: string, password: string, rememberMe: boolean = false): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{
        access_token: string;
        refresh_token: string;
        role: UserRole;
        account_status: AccountStatus;
        user_id: string;
        display_name: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, remember_me: rememberMe }),
      });

      if (rememberMe) {
        localStorage.setItem('agrisentinel_token', data.access_token);
      } else {
        sessionStorage.setItem('agrisentinel_token', data.access_token);
      }
      setToken(data.access_token);

      // Fetch full profile
      const userData = await apiRequest<UserProfile>('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const registerFarmer = async (payload: any): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{
        access_token: string;
        refresh_token: string;
        role: UserRole;
        account_status: AccountStatus;
        user_id: string;
        display_name: string;
      }>('/auth/register/farmer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('agrisentinel_token', data.access_token);
      setToken(data.access_token);

      const userData = await apiRequest<UserProfile>('/auth/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setUser(userData);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const registerOfficial = async (payload: any) => {
    return apiRequest<{ status: string; message: string }>('/auth/register/official-request', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  const verifyMobileOtp = async (mobileNumber: string, otpCode: string): Promise<boolean> => {
    const res = await apiRequest<{ verified: boolean; message: string }>('/auth/verify-mobile', {
      method: 'POST',
      body: JSON.stringify({ mobile_number: mobileNumber, otp_code: otpCode }),
    });
    if (res.verified && user) {
      setUser({ ...user, is_mobile_verified: true });
    }
    return res.verified;
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('agrisentinel_token');
      sessionStorage.removeItem('agrisentinel_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && user.account_status === 'APPROVED',
        login,
        registerFarmer,
        registerOfficial,
        logout,
        verifyMobileOtp,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
