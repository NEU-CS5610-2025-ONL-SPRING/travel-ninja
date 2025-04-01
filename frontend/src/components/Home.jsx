import { useAuthUser } from "../security/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthUser();

    return (
        <div className="home">
            <h1>TravelNinja</h1>
            <div>
                {!isAuthenticated ? (
                    <button className="btn-primary" onClick={() => navigate("/login")}>
                        Login
                    </button>
                ) : (
                    <button className="btn-primary" onClick={() => navigate("/app")}>
                        Enter App
                    </button>
                )}
            </div>
            <div>
                <button className="btn-secondary" onClick={() => navigate("/register")}>
                    Create Account
                </button>
            </div>
        </div>
    );
}
