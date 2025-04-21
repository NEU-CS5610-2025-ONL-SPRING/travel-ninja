import { useState } from "react";
import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Auth.css"; // We'll create this file

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuthUser();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        // Require at least 8 characters, 1 uppercase, 1 lowercase, and 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
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
                } else if (!validatePassword(value)) {
                    newErrors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
                } else {
                    delete newErrors.password;
                }
                break;
            case "name":
                if (!value) {
                    newErrors.name = "Name is required";
                } else {
                    delete newErrors.name;
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
        } else if (name === "name") {
            setName(value);
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
            password: true,
            name: true
        });
        
        // Validate all fields
        const isEmailValid = validateField("email", email);
        const isPasswordValid = validateField("password", password);
        const isNameValid = validateField("name", name);
        
        // Only proceed if all validations pass
        if (isEmailValid && isPasswordValid && isNameValid) {
            setIsSubmitting(true);
            try {
                await register(email, password, name);
                navigate("/app");
            } catch (error) {
                console.error("Registration error:", error);
                
                // Handle backend errors, including email already exists
                if (error.response?.data?.error === "User already exists") {
                    setErrors(prev => ({
                        ...prev,
                        email: "This email is already registered"
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        form: "Registration failed. Please try again."
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
                <h1>Register</h1>
                {errors.form && <div className="error-message">{errors.form}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.name && errors.name ? "input-error" : ""}
                            disabled={isSubmitting}
                        />
                        {touched.name && errors.name && (
                            <div className="error-message">{errors.name}</div>
                        )}
                    </div>
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
                            autoComplete="new-password"
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
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>
                <div className="auth-link">
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
}