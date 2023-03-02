import {
  AuthApi,
  AuthStatusResponseStatusEnum as AuthStatus,
  CurrentUserApi,
  PublicUser,
  TierType,
} from '@codecharacter-2023/client';
import { CompatClient } from '@stomp/stompjs';
import { createContext, useContext, useEffect, useState } from 'react';
import { apiConfig } from '../api/ApiConfig';

const AuthContext = createContext<{
  isAuthLoading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  authStatus?: AuthStatus;
  setAuthStatus: (authStatus?: AuthStatus) => void;
  user?: PublicUser;
  userId?: string;
  setUser: (user?: PublicUser) => void;
}>({
  isAuthLoading: true,
  isLoggedIn: false,
  setIsLoggedIn: () => undefined,
  authStatus: undefined,
  setAuthStatus: () => undefined,
  user: undefined,
  setUser: () => undefined,
});

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>();
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<PublicUser>();
  const [userId, setUserId] = useState<string>();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token'),
  );

  useEffect(() => {
    setIsAuthLoading(true);
    let wsClient: CompatClient;
    if (token) {
      const authApi = new AuthApi(apiConfig);
      authApi
        .getAuthStatus()
        .then(response => {
          setIsLoggedIn(true);
          setAuthStatus(response.status);
          if (response.status === AuthStatus.Authenticated) {
            const currrentUserApi = new CurrentUserApi(apiConfig);
            currrentUserApi
              .getCurrentUser()
              .then(response => {
                setUser({
                  name: response.name,
                  username: response.username,
                  college: response.college,
                  country: response.country,
                  avatarId: response.avatarId,
                  tier: response.tier || TierType.Tier1,
                });
                setUserId(response.id);
                setIsAuthLoading(false);
              })
              .catch(() => {
                setIsLoggedIn(false);
                setAuthStatus(undefined);
                setIsAuthLoading(false);
              });
          } else {
            setIsAuthLoading(false);
          }
        })
        .catch(() => {
          setIsLoggedIn(false);
          setAuthStatus(undefined);
          setIsAuthLoading(false);
        });
    } else {
      setIsLoggedIn(false);
      setAuthStatus(undefined);
      setIsAuthLoading(false);
    }

    return () => {
      if (wsClient) {
        wsClient.deactivate();
      }
    };
  }, [token]);

  useEffect(() => {
    const checkToken = () => {
      const item = localStorage.getItem('token');
      if (!item) {
        setToken(null);
        setIsLoggedIn(false);
        setAuthStatus(undefined);
        setUser(undefined);
      } else {
        setToken(item);
      }
    };
    window.addEventListener('storage', checkToken);
    return () => {
      window.removeEventListener('storage', checkToken);
    };
  }, []);

  useEffect(() => {
    const cookieValue = document.cookie;
    const bearerToken = cookieValue.split(';');
    bearerToken.map(cookie => {
      if (cookie.trim().startsWith('bearer-token') != false) {
        const index = cookie.indexOf('=') + 1;
        const token = cookie.slice(index);
        localStorage.setItem('token', token);
        window.dispatchEvent(new StorageEvent('storage'));
      }
    });
  }, [document.cookie]);

  return (
    <AuthContext.Provider
      value={{
        isAuthLoading,
        setIsLoggedIn,
        isLoggedIn,
        setAuthStatus,
        authStatus,
        setUser,
        user,
        userId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
