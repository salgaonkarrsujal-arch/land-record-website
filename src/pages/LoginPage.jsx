import { useEffect, useMemo, useState } from "react";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from || "/", [location.state]);
  const {
    isAdmin,
    isAuthenticated,
    isProfileComplete,
    signInAdmin,
    signInUser,
    signUpUser,
    resetUserPassword,
    signInWithGoogleUser
  } = useAuth();
  const [mode, setMode] = useState("user");
  const [selectionMade, setSelectionMade] = useState(false);
  const [userAuthMode, setUserAuthMode] = useState("login");
  const [userForm, setUserForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: false
  });
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (isAdmin) {
      navigate("/", { replace: true });
      return;
    }

    navigate(isProfileComplete ? "/my-bookings" : "/profile", { replace: true });
  }, [from, isAdmin, isAuthenticated, isProfileComplete, navigate]);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    clearFeedback();
    setLoadingAdmin(true);

    try {
      await signInAdmin(adminForm.email, adminForm.password);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (!userForm.email || !userForm.password) {
      setError("Enter your email and password.");
      return;
    }

    if (userAuthMode === "signup") {
      if (!userForm.displayName) {
        setError("Enter your name to create the account.");
        return;
      }

      if (userForm.password !== userForm.confirmPassword) {
        setError("Password and confirm password must match.");
        return;
      }
    }

    setLoadingUser(true);

    try {
      const methods = auth ? await fetchSignInMethodsForEmail(auth, userForm.email.trim()) : [];

      if (userAuthMode === "signup") {
        if (methods.includes("password")) {
          setError("This email already has an account. Use Login on any device.");
          setLoadingUser(false);
          return;
        }

        if (methods.includes("google.com")) {
          setError("This email is already registered with Google. Use the Google button on every device.");
          setLoadingUser(false);
          return;
        }

        await signUpUser({
          email: userForm.email,
          password: userForm.password,
          displayName: userForm.displayName
        });
      } else {
        if (!methods.includes("password") && methods.includes("google.com")) {
          setError("This account uses Google sign-in. Use the Google button on this device too.");
          setLoadingUser(false);
          return;
        }

        await signInUser(userForm.email, userForm.password);
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleForgotPassword = async () => {
    clearFeedback();

    if (!userForm.email) {
      setError("Enter your email first to reset password.");
      return;
    }

    try {
      await resetUserPassword(userForm.email);
      setMessage("Password reset email sent successfully.");
    } catch (authError) {
      setError(authError.message);
    }
  };

  const handleGoogleLogin = async () => {
    clearFeedback();
    setLoadingUser(true);

    try {
      const methods =
        auth && userForm.email.trim()
          ? await fetchSignInMethodsForEmail(auth, userForm.email.trim())
          : [];

      if (userForm.email.trim() && methods.includes("password") && !methods.includes("google.com")) {
        setError("This account uses email and password. Use the normal login form on this device.");
        setLoadingUser(false);
        return;
      }

      const result = await signInWithGoogleUser();

      if (result) {
        navigate("/profile", { replace: true });
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoadingUser(false);
    }
  };

  return (
    <section className="auth-page container">
      <div className="auth-shell auth-shell-single">
        <div className="auth-card auth-card-wide">
          <div className="auth-head">
            <h1>Academy Access</h1>
            <p>Sign in to continue with registration or allotment management.</p>
          </div>

          <div className="access-choice-grid">
            <button
              type="button"
              className={`access-choice-card ${mode === "user" ? "active" : ""}`}
              onClick={() => {
                clearFeedback();
                setMode("user");
                setSelectionMade(true);
              }}
            >
              <strong>User Login</strong>
              <span>Login or create your registration account</span>
            </button>
            <button
              type="button"
              className={`access-choice-card admin ${mode === "admin" ? "active" : ""}`}
              onClick={() => {
                clearFeedback();
                setMode("admin");
                setSelectionMade(true);
              }}
            >
              <strong>Admin Login</strong>
              <span>Search registered users and allot rooms</span>
            </button>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}
          {message ? <p className="auth-success">{message}</p> : null}

          {!selectionMade ? null : mode === "admin" ? (
            <>
              <div className="user-auth-inline-head">
                <p className="auth-eyebrow">Admin Login</p>
                <button
                  type="button"
                  className="auth-inline-switch"
                  onClick={() => {
                    clearFeedback();
                    setSelectionMade(false);
                  }}
                >
                  Back
                </button>
              </div>
              <form className="auth-form auth-form-wide" onSubmit={handleAdminLogin}>
                <label>
                  Admin Email
                  <input
                    value={adminForm.email}
                    onChange={(event) =>
                      setAdminForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="admin@example.com"
                    autoComplete="email"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={adminForm.password}
                    onChange={(event) =>
                      setAdminForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </label>

                <button type="submit" className="auth-primary-button">
                  {loadingAdmin ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <div className="user-access-panel">
              <div className="user-auth-inline-head">
                <p className="auth-eyebrow">User Login</p>
                <div className="auth-inline-actions">
                  <button
                    type="button"
                    className="auth-inline-switch"
                    onClick={() => {
                      clearFeedback();
                      setUserAuthMode((current) => (current === "login" ? "signup" : "login"));
                    }}
                  >
                    {userAuthMode === "login" ? "Sign up" : "Back to login"}
                  </button>
                  <button
                    type="button"
                    className="auth-inline-switch"
                    onClick={() => {
                      clearFeedback();
                      setSelectionMade(false);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="user-access-copy user-access-copy-clean">
                <strong>{userAuthMode === "signup" ? "Create your account" : "Welcome back"}</strong>
                <p>
                  {userAuthMode === "signup"
                    ? "Create your account to complete your registration profile."
                    : "Please enter your details"}
                </p>
              </div>

              <form className="auth-form auth-form-wide auth-form-clean" onSubmit={handleUserSubmit}>
                {userAuthMode === "signup" ? (
                  <label>
                    Full name
                    <input
                      value={userForm.displayName}
                      onChange={(event) =>
                        setUserForm((current) => ({ ...current, displayName: event.target.value }))
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </label>
                ) : null}
                <label>
                  Email address
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="name@office.gov.in"
                    autoComplete="email"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Enter password"
                    autoComplete={userAuthMode === "signup" ? "new-password" : "current-password"}
                  />
                </label>
                {userAuthMode === "signup" ? (
                  <label>
                    Confirm password
                    <input
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={(event) =>
                        setUserForm((current) => ({ ...current, confirmPassword: event.target.value }))
                      }
                      placeholder="Confirm password"
                      autoComplete="new-password"
                    />
                  </label>
                ) : null}

                {userAuthMode === "login" ? (
                  <div className="auth-login-options">
                    <label className="auth-check-row">
                      <input
                        type="checkbox"
                        checked={userForm.remember}
                        onChange={(event) =>
                          setUserForm((current) => ({ ...current, remember: event.target.checked }))
                        }
                      />
                      <span>Remember for 30 days</span>
                    </label>
                    <button type="button" className="auth-forgot-link" onClick={handleForgotPassword}>
                      Forgot password
                    </button>
                  </div>
                ) : null}

                <button type="submit" className="auth-primary-button">
                  {loadingUser
                    ? userAuthMode === "signup"
                      ? "Creating Account..."
                      : "Signing In..."
                    : userAuthMode === "signup"
                    ? "Create Account"
                    : "Sign in"}
                </button>
              </form>

              {userAuthMode === "login" ? (
                <>
                  <div className="auth-divider">
                    <span>or</span>
                  </div>
                  <button type="button" className="auth-social-button" onClick={handleGoogleLogin}>
                    <span className="auth-google-mark">G</span>
                    <span>Sign in with Google</span>
                  </button>
                </>
              ) : null}

              <p className="auth-bottom-switch">
                {userAuthMode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="auth-inline-switch"
                  onClick={() => {
                    clearFeedback();
                    setUserAuthMode((current) => (current === "login" ? "signup" : "login"));
                  }}
                >
                  {userAuthMode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
