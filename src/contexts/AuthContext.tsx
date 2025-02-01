import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  authTrigger: number;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({ authTrigger: 0, refreshAuth: () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authTrigger, setAuthTrigger] = useState(0);

  const refreshAuth = () => {
    setAuthTrigger(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ authTrigger, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
