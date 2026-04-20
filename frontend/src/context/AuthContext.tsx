import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  roleCode: string;
  roleId: string;
  companyId?: string;
  company?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, userData: any) => {
    const formattedUser: User = {
      id: userData.user_id,
      email: userData.email,
      role: userData.user_role_name,
      roleCode: userData.user_role_code,
      roleId: userData.user_role_id,
      companyId: userData.company_id,
      company: userData.company
    };
    
    setToken(newToken);
    setUser(formattedUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(formattedUser));
    localStorage.setItem('isAuthenticated', 'true'); // Keep for backward compatibility if needed
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAuthenticated: !!token,
      isLoading 
    }}>
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
