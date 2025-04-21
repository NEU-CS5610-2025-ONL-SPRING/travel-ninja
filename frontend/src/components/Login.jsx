import { useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Auth.css"; // We'll create this file

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuthUser();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateField = (name, value) => {
        let newErrors = { ...errors };
        
        switch (name) {
            case "email":
                if (!value) {
                    newErrors.email = "Email is required";
                } else if (!validateEmail(value)) {
                    newErrors.email = "Please enter a valid email address";
                } else {
                    delete newErrors.email;
                }
                break;
            case "password":
                if (!value) {
                    newErrors.password = "Password is required";
                } else {
                    delete newErrors.password;
                }
                break;
            default:
                break;
        }
        
        setErrors(newErrors);
        return !newErrors[name]; // Return true if no error for this field
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "email") {
            setEmail(value);
        } else if (name === "password") {
            setPassword(value);
        }
        
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        setTouched({
            email: true,
            password: true
        });
        
        // Validate all fields
        const isEmailValid = validateField("email", email);
        const isPasswordValid = validateField("password", password);
        
        // Only proceed if all validations pass
        if (isEmailValid && isPasswordValid) {
            setIsSubmitting(true);
            try {
                await login(email, password);
                navigate("/app");
            } catch (error) {
                console.error("Login error:", error);
                
                if (!navigator.onLine || (error.name === "TypeError" && error.message === "Failed to fetch")) {
                    setErrors(prev => ({
                        ...prev,
                        form: "Network error. Please check your connection and try again."
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        form: "Invalid email or password. Please try again."
                    }));
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Login</h1>
                {errors.form && <div className="error-message">{errors.form}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.email && errors.email ? "input-error" : ""}
                            disabled={isSubmitting}
                        />
                        {touched.email && errors.email && (
                            <div className="error-message">{errors.email}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.password && errors.password ? "input-error" : ""}
                            disabled={isSubmitting}
                        />
                        {touched.password && errors.password && (
                            <div className="error-message">{errors.password}</div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Login"}
                    </button>
                </form>
                <div className="auth-link">
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </div>
            </div>
        </div>
    );
}

export default Login;