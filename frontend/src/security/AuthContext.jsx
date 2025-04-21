import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const API_URL = process.env.REACT_APP_API_URL;
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
  }, []);

  const login = async (email, password) => {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
            const userData = await res.json();
            setIsAuthenticated(true);
            setUser(userData);
            return true; // Return success
        } else {
            const errorData = await res.json();
            setIsAuthenticated(false);
            setUser(null);
            throw new Error(errorData.error || "Invalid credentials"); // Throw error with message
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error; // Re-throw to be caught in the component
    }
};

const register = async (email, password, name) => {
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        if (res.ok) {
            const userData = await res.json();
            setIsAuthenticated(true);
            setUser(userData);
            return true; // Return success
        } else {
            const errorData = await res.json();
            setIsAuthenticated(false);
            setUser(null);
            throw new Error(errorData.error || "Registration failed"); // Throw error with message
        }
    } catch (error) {
        console.error("Registration error:", error);
        throw error; // Re-throw to be caught in the component
    }
};

  const logout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsAuthenticated(false);
  };

  // const register = async (email, password, name) => {
  //   const res = await fetch(`${API_URL}/register`, {
  //     method: "POST",
  //     credentials: "include",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password, name }),
  //   });

  //   if (res.ok) {
  //     const userData = await res.json();
  //     setIsAuthenticated(true);
  //     setUser(userData);
  //   } else {
  //     setIsAuthenticated(false);
  //     setUser(null);
  //   }
  // };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthUser = () => useContext(AuthContext);
