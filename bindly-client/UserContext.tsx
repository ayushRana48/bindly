import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  UserContextType,
  UserProviderProps,
  ApiResponse
} from './types';
import { checkToken } from './utils/checkToken';

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => { },
  email: '',
  setEmail: () => { },
  loading: false,
  setLoading: () => { },
  refreshUser: () => { }
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [email, setEmail] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  const getUserByEmail = async () => {
    setLoading(true);
    try {
      console.log('checking token in UserContext');
      const token = await checkToken();
      console.log('token in UserContext', token);
      // Make the fetch request with the Bearer token
      const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users/email/${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add the Bearer token
        },
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


  // useEffect(() => {
  //   console.log(email, 'from email');

  //   if (email) {
  //     getUserByEmail();
  //   } else {
  //     setUser(null);
  //   }
  // }, [email]);

  useEffect(() => {
    console.log("refreshUser", email)
    refreshUser()
  }, [email])

  const refreshUser = async () => {
    if (email) {
      await getUserByEmail();
    }
    else {
      setUser(null);
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        email,
        setEmail,
        loading,
        setLoading,
        refreshUser
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