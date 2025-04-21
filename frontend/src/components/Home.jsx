import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Home.css"; // We'll create this file

export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthUser();

    return (
        <div className="home-container">
            <div className="home-content">
                <h1 className="home-title">TravelNinja</h1>
                <div className="home-buttons">
                    {!isAuthenticated ? (
                        <button className="btn-primary" onClick={() => navigate("/login")}>
                            Login
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={() => navigate("/app")}>
                            Enter App
                        </button>
                    )}
                    
                    <button className="btn-secondary" onClick={() => navigate("/register")}>
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
}