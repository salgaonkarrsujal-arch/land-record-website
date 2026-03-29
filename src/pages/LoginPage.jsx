import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from || "/", [location.state]);
  const {
    isFirebaseConfigured,
    signInAdmin,
    signInWithGoogleUser,
    startPhoneLogin,
    verifyPhoneOtp
  } = useAuth();
  const [mode, setMode] = useState("user");
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [phoneForm, setPhoneForm] = useState({ phone: "", otp: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleGoogle = async () => {
    clearFeedback();
    try {
      await signInWithGoogleUser();
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    clearFeedback();

    try {
      await signInAdmin(adminForm.email, adminForm.password);
      navigate("/bookings", { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    clearFeedback();

    try {
      await startPhoneLogin(phoneForm.phone);
      setOtpRequested(true);
      setMessage("OTP sent. Enter the verification code to continue.");
    } catch (authError) {
      setError(authError.message);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    clearFeedback();

    try {
      await verifyPhoneOtp(phoneForm.otp);
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError.message);
    }
  };

  return (
    <section className="auth-page container">
      <div className="auth-shell">
        <div className="auth-intro">
          <p className="auth-eyebrow">Authentication</p>
          <h1>Sign in to continue with bookings or admin allotments.</h1>
          <p>
            Users can sign in with Google or phone OTP. Admin access is limited to approved email/password
            accounts only.
          </p>
          {!isFirebaseConfigured ? (
            <div className="auth-warning">
              Firebase is not configured yet. Add the values from the local `.env` file using
              `.env.example` as your template.
            </div>
          ) : null}
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "user" ? "active" : ""}`}
              onClick={() => setMode("user")}
            >
              User Login
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "admin" ? "active" : ""}`}
              onClick={() => setMode("admin")}
            >
              Admin Login
            </button>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}
          {message ? <p className="auth-success">{message}</p> : null}

          {mode === "user" ? (
            <div className="auth-section">
              <button type="button" className="auth-primary-button" onClick={handleGoogle}>
                Continue with Google
              </button>

              <div className="auth-divider">
                <span>or use phone login</span>
              </div>

              <form className="auth-form" onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp}>
                <label>
                  Phone Number
                  <input
                    value={phoneForm.phone}
                    onChange={(event) =>
                      setPhoneForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="+91 9876543210"
                  />
                </label>

                {otpRequested ? (
                  <label>
                    OTP Code
                    <input
                      value={phoneForm.otp}
                      onChange={(event) =>
                        setPhoneForm((current) => ({ ...current, otp: event.target.value }))
                      }
                      placeholder="Enter verification code"
                    />
                  </label>
                ) : null}

                <div id="phone-recaptcha" className="recaptcha-box" />

                <button type="submit" className="auth-primary-button">
                  {otpRequested ? "Verify OTP" : "Send OTP"}
                </button>
              </form>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleAdminLogin}>
              <label>
                Admin Email
                <input
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="admin@example.com"
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
                />
              </label>

              <button type="submit" className="auth-primary-button">
                Sign in as Admin
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
