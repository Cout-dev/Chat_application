import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css"; // Import the CSS for styling

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    navigate("/"); 
  };

  return (
    <nav className="navbar">
      <h2 className="logo">💬 Chat App</h2>
      <div className="nav-links">
        {location.pathname === "/chat" && (
          <>
            <Link to="/chat" className="nav-link">Chat</Link>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
