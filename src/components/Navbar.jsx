import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { navLinks } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { isAdmin, isAuthenticated, logout, profile } = useAuth();
  const hasAdminSession = isAuthenticated && isAdmin;
  const hasUserSession = isAuthenticated && !isAdmin;
  const visibleLinks = hasAdminSession
    ? navLinks
    : hasUserSession
    ? [
        { label: "Home", to: "/" },
        { label: "Profile", to: "/profile" }
      ]
    : [];

  return (
    <header className="site-header">
      <div className="header-banner">
        <div className="container header-banner-inner">
          <Link className="banner-logo banner-logo-left" to={isAuthenticated ? "/" : "/login"}>
            <img src="mahabhulekh-logo.png" alt="Land Records Maharashtra logo" />
          </Link>

          <div className="header-banner-copy">
            <p className="banner-line banner-line-top">भूमी अभिलेख प्रशिक्षण प्रबोधिनी</p>
            <h1>Chhatrapati Sambhajinagar</h1>
            <p>टाउन हॉल, पंचायत समितीच्या बाजूला, छत्रपती संभाजीनगर पिन 431001</p>
            <p>फोन (ऑ): 0240-2991387</p>
            <p>ई-मेल (ऑ): landrecord12020@gmail.com</p>
          </div>

          <Link className="banner-logo banner-logo-right" to={isAuthenticated ? "/" : "/login"}>
            <img src="academy-seal.png" alt="Land Records Training Academy seal" />
          </Link>
        </div>
      </div>

      <div className="header-nav-bar">
        <div className="container navbar">
          <Link className="brand brand-compact" to={isAuthenticated ? "/" : "/login"}>
            <img className="brand-logo" src="academy-seal.png" alt="Land Records Training Academy seal" />
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
            {!isAuthenticated ? (
              <Link className="auth-button secondary" to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
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
                        <strong>{hasAdminSession ? "Admin Panel" : profile?.displayName || "User Profile"}</strong>
                        <small>{profile?.email || "Land Records Training Academy"}</small>
                      </div>
                    </div>

                    {hasUserSession ? (
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
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
