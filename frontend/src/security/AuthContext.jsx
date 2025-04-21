import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Remove any trailing slashes from the API URL
  // const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  // const API_URL = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const API_URL = process.env.REACT_APP_API_URL;
  
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data from:", `${API_URL}/me`);
        const res = await fetch(`${API_URL}/me`, {
          credentials: "include",
        });

        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          setUser(data);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const loginUrl = `${API_URL}/login`;
      console.log("Login request to:", loginUrl);
      
      const res = await fetch(loginUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const userData = await res.json();
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        
        // Check if response is JSON before trying to parse it
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Login failed");
        } else {
          throw new Error(`Login failed with status: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const register = async (email, password, name) => {
    try {
      const registerUrl = `${API_URL}/register`;
      console.log("Registering at URL:", registerUrl);
      
      const res = await fetch(registerUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (res.ok) {
        const userData = await res.json();
        setIsAuthenticated(true);
        setUser(userData);
        return { success: true };
      } else {
        setIsAuthenticated(false);
        setUser(null);
        
        // Check if response is JSON before trying to parse it
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Registration failed");
        } else {
          throw new Error(`Registration failed with status: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, login, register, logout, API_URL }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthUser = () => useContext(AuthContext);