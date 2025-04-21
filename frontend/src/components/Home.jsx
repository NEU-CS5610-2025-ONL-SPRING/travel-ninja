
import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";

export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthUser();

    return (
        <div className="home-container">
            <div className="home-card">
                <h1 className="home-title">TravelNinja</h1>
                <div className="home-description">
                    Your ultimate travel planning companion
                </div>

                <div className="action-cards">
                    <div className="action-card">
                        <h2>{isAuthenticated ? "Ready to go?" : "Welcome back"}</h2>
                        <p>{isAuthenticated ? "Continue planning your next adventure" : "Sign in to access your trips"}</p>
                        <button
                            className="btn-primary"
                            onClick={() => navigate(isAuthenticated ? "/app" : "/login")}
                        >
                            {isAuthenticated ? "Enter App" : "Login"}
                        </button>
                    </div>

                    {!isAuthenticated && (
                        <div className="action-card">
                            <h2>New here?</h2>
                            <p>Create an account to start planning</p>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate("/register")}
                            >
                                Create Account
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}