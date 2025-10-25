// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { tokenStore } from "./tokenStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => tokenStore.getAccess());
  const [isLoggedIn, setIsLoggedIn] = useState(!!tokenStore.getAccess());

  // tokenStore 변경 구독 → 상태 동기화
  useEffect(() => {
    const unsubscribe = tokenStore.subscribe(({ accessToken }) => {
      setAccessToken(accessToken);
      setIsLoggedIn(!!accessToken);
    });
    return unsubscribe;
  }, []);

  // 앱 첫 로드 시 동기화(로컬스토리지 복원)
  useEffect(() => {
    const t = tokenStore.getAccess();
    if (t) {
      setAccessToken(t);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (token) => {
    tokenStore.setAccess(token);
  };

  const logout = () => {
    tokenStore.clear();
  };

  return (
      <AuthContext.Provider value={{ isLoggedIn, accessToken, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
