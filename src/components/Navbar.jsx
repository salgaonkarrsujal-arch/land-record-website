import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navLinks } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { isAdmin, isAuthenticated, logout, profile } = useAuth();
  const visibleLinks = isAdmin
    ? navLinks.filter((link) => link.to === "/bookings")
    : navLinks.filter((link) => !(link.to === "/bookings" && !isAdmin));

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link className="brand" to={isAdmin ? "/bookings" : "/"}>
          <img className="brand-logo" src="/academy-seal.png" alt="Land Records Training Academy seal" />
          <span className="brand-text">
            <strong>Land Records</strong>
            <small>Training Academy</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated && !isAdmin ? (
            <NavLink to="/my-bookings" onClick={() => setMenuOpen(false)}>
              My Bookings
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <div className="profile-menu">
              <button
                type="button"
                className={`profile-menu-trigger ${profileMenuOpen ? "open" : ""}`}
                onClick={() => setProfileMenuOpen((value) => !value)}
              >
                <span className="profile-avatar">
                  {(profile?.displayName || profile?.email || "U").charAt(0).toUpperCase()}
                </span>
              </button>

              {profileMenuOpen ? (
                <div className="profile-popup">
                  <div className="profile-popup-head">
                    <span className="profile-avatar profile-popup-avatar">
                      {(profile?.displayName || profile?.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <div className="profile-popup-copy">
                      <strong>{isAdmin ? "Admin Panel" : profile?.displayName || "Signed in"}</strong>
                      <small>{profile?.email || "Land Records Training Academy"}</small>
                    </div>
                  </div>

                  <NavLink
                    className="profile-popup-link"
                    to="/profile"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setMenuOpen(false);
                    }}
                  >
                    Profile Settings
                  </NavLink>

                  {!isAdmin ? (
                    <NavLink
                      className="profile-popup-link"
                      to="/my-bookings"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      My Bookings
                    </NavLink>
                  ) : null}

                  <button
                    type="button"
                    className="profile-popup-logout"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link className="auth-button secondary" to="/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
