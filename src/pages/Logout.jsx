import { useNavigate } from "react-router-dom";
import "./Logout.css";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("registeredUser");
    navigate("/auth", { replace: true });
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      🚪 Logout
    </button>
  );
}

export default Logout;