/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// AuthContext.jsx
"use client";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  register: (formData: Record<string, any>) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => boolean;
  refreshUser: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<any>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check token expiration
  const checkTokenExpiration = (token: string | null) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };

  // Logout function (without navigation)
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    return true; // Indicate logout was successful
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          if (checkTokenExpiration(token)) {
            logout();
            return;
          }

          const user = JSON.parse(storedUser);
          const res = await axios.get(`${API_URL}/user/${user.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(res.data.user);
          setIsAuthenticated(true);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as any).response?.status === "number" &&
          (err as any).response.status === 401
        ) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Add response interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Register function
  const register = async (formData: Record<string, any>) => {
    try {
      const res = await axios.post(`${API_URL}/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        setError((err as any).response?.data?.error || "Registration failed");
        throw (err as any).response?.data;
      } else {
        setError("Registration failed");
        throw err;
      }
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      throw err.response?.data;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        if (checkTokenExpiration(token)) {
          logout();
          return;
        }

        const user = JSON.parse(storedUser);
        const res = await axios.get(`${API_URL}/user/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        register,
        login,
        logout,
        refreshUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  return useContext(AuthContext);
};
