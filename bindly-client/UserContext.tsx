import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  UserContextType, 
  UserProviderProps, 
  ApiResponse 
} from './types';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  email: '',
  setEmail: () => {},
  loading: false,
  setLoading: () => {}
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [email, setEmail] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log(email, 'from email');
    const getUserByEmail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users/email/${email}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        
        if (response.status === 200) {
          console.log('set user here', data);
          setUser(data);
        } else {
          console.log('Error received:', data.error);
          setUser(null);
        }
      } catch (error) {
        console.error('Network or server error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      getUserByEmail();
    } else {
      setUser(null);
    }
  }, [email]);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        email, 
        setEmail, 
        loading, 
        setLoading 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};