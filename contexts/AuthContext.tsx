import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  username: string;
  email: string;
  user_type: 'general' | 'pwd' | 'indigenous' | 'employer' | 'admin';
  first_name: string;
  last_name: string;
};

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      // Only restore user if both user data and token exist
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        // Clear any partial data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
    } catch (error) {
      console.error('Error restoring user from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logout called - clearing user state and localStorage');
    
    // Clear localStorage first
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    
    // Then clear state
    setUser(null);
    setLoading(false); // Ensure loading is false after logout
    
    console.log('Logout completed - localStorage cleared');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 