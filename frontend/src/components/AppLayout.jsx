import { useAuthUser } from "../security/AuthContext";
import { useNavigate, Outlet, Link } from "react-router-dom";

// import "../style/appLayout.css";

export default function AppLayout() {
  const { user, logout } = useAuthUser();
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="title">
        <h1>Travel Ninja</h1>
      </div>
      <div className="header">
        <nav className="menu">
          <ul className="menu-list">
            <li>
              <button
                className="exit-button"
                onClick={async () => {
                  await logout();
                }}
              >
                LogOut
              </button>
            </li>
          </ul>
        </nav>
        <div>Welcome 👋 {user?.name} </div>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
