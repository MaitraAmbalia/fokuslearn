import { createContext, useState, useEffect, useContext } from "react"; // ✅ Added useContext
import api from "../services/api";

const AuthContext = createContext();

// Custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in on page load
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUserLoggedIn();
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed"
      };
    }
  };

  // 3. Google Login
  const loginWithGoogle = () => {
    // Redirect to backend Google Auth endpoint
    window.location.href = `${api.defaults.baseURL}/auth/google`;
  };

  // 4. Refresh User Function
  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (error) {
      setUser(null);
    }
  };

  // 5. Register Function
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error.response?.data?.message);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed"
      };
    }
  };

  // 6. Logout Function
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error", err);
    }
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshUser, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
