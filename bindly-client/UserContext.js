import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {

    const getUserByEmail = async () => {
      try {
        const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users/email/${email}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (response.status === 200) {
          setUser(data);
        } else if (data.error) {
          console.log('Error received:', data.error);
          setUser(null); // Reset user on error
        }
      } catch (error) {
        console.error('Network or server error:', error);
        setUser(null); // Reset user on error
      }
    };

    if (email) {
      getUserByEmail();
    } else {
      setUser(null);
    }
  }, [email]);



  return (
    <UserContext.Provider value={{ user, setUser, email, setEmail }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
