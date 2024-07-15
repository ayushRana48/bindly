import React, { createContext, useContext, useEffect, useState } from 'react';
import { BASEROOT_URL } from "@env";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [loading,setLoading]=useState(false)

  useEffect(() => {
    const getUserByEmail = async () => {
      console.log('call up here')
      setLoading(true)
      try {
        const response = await fetch(`https://pdr2y6st9i.execute-api.us-east-1.amazonaws.com/prod/bindly/users/email/${email}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (response.status === 200) {
          setUser(data);
          setLoading(false)

        } else if (data.error) {
          console.log('Error received:', data.error);
          setUser(null); // Reset user on error
          setLoading(false)

        }
        setLoading(false)


      } catch (error) {
        setLoading(false)
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
    <UserContext.Provider value={{ user, setUser, email, setEmail, loading, setLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
