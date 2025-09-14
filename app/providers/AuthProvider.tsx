"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export type UserRole = 'Officer' | 'Chief' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  badge: string;
  department: string;
  station: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  canDelete: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - In production, this would be replaced with actual API calls
const mockUsers: Record<UserRole, User> = {
  Officer: {
    id: 'off-001',
    name: 'Officer Adaeze Musa',
    role: 'Officer',
    badge: 'NPF-12345',
    department: 'Criminal Investigation',
    station: 'Lagos Central'
  },
  Chief: {
    id: 'chi-001', 
    name: 'Chief Inspector Bola Adebayo',
    role: 'Chief',
    badge: 'NPF-67890',
    department: 'Operations',
    station: 'Lagos Central'
  },
  Admin: {
    id: 'adm-001',
    name: 'Admin Chinedu Okafor',
    role: 'Admin',
    badge: 'NPF-99999',
    department: 'System Administration',
    station: 'Headquarters'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('frontalminds-drs-user');
        const storedSession = localStorage.getItem('frontalminds-drs-session');
        
        if (storedUser && storedSession) {
          const userData = JSON.parse(storedUser);
          const sessionData = JSON.parse(storedSession);
          
          // Check if session is still valid (24 hours)
          const sessionAge = Date.now() - sessionData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge) {
            setUser(userData);
          } else {
            // Session expired
            localStorage.removeItem('frontalminds-drs-user');
            localStorage.removeItem('frontalminds-drs-session');
            toast.error('Session expired. Please login again.');
          }
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('frontalminds-drs-user');
        localStorage.removeItem('frontalminds-drs-session');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Auto-detect role from email if not provided
      let userRole: UserRole = role || 'Officer';
      if (!role) {
        const emailLower = email.toLowerCase();
        if (emailLower.includes('admin')) {
          userRole = 'Admin';
        } else if (emailLower.includes('chief')) {
          userRole = 'Chief';
        } else {
          userRole = 'Officer';
        }
      }
      
      // Mock authentication logic - In production, replace with actual API call
      // Accept demo123 as universal password
      const validCredentials = password === 'demo123';
      
      if (validCredentials) {
        const userData = mockUsers[userRole];
        
        // Store user data
        localStorage.setItem('frontalminds-drs-user', JSON.stringify(userData));
        localStorage.setItem('frontalminds-drs-session', JSON.stringify({
          timestamp: Date.now(),
          role: userRole
        }));
        
        setUser(userData);
        
        toast.success(`Welcome, ${userData.name}`);
        return true;
      } else {
        toast.error('Invalid password. Use "demo123" to login. Use admin@, chief@, or officer@ in email for different roles.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('frontalminds-drs-user');
    localStorage.removeItem('frontalminds-drs-session');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const canDelete = (): boolean => {
    if (!user) return false;
    return user.role === 'Chief' || user.role === 'Admin';
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    canDelete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[]
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push('/login');
          return;
        }

        if (requiredRoles && !requiredRoles.includes(user.role)) {
          toast.error(`Access denied. ${requiredRoles.join(' or ')} role required.`);
          router.push('/dashboard');
          return;
        }
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-mono text-sm">AUTHENTICATING...</span>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}
