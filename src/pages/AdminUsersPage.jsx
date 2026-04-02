import { get, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import { database, isFirebaseConfigured } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: "",
  otpCode: "",
  currentPassword: ""
};

function AdminUsersPage() {
  const {
    profile,
    adminOtpVerified,
    createAdminUser,
    resetAdminOtpVerification,
    startAdminOtp,
    verifyAdminOtp,
    verifyMainAdminPassword
  } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingUid, setUpdatingUid] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      if (!isFirebaseConfigured || !database) {
        setLoading(false);
        return;
      }

      const snapshot = await get(ref(database, "users"));
      const value = snapshot.exists() ? snapshot.val() : {};
      const nextUsers = Object.values(value).sort((first, second) =>
        String(first.displayName || first.email || "").localeCompare(String(second.displayName || second.email || ""))
      );
      setUsers(nextUsers);
      setLoading(false);
    }

    loadUsers();
  }, []);

  const adminUsers = users.filter((item) => item.role === "admin");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!formValues.email || !formValues.password) {
      setError("Enter the admin email and password.");
      return;
    }

    if (!adminOtpVerified) {
      setError("Verify the main admin mobile OTP before creating a new admin.");
      return;
    }

    setSubmitting(true);

    try {
      const createdUser = await createAdminUser(formValues);
      const displayName = String(createdUser.email || "")
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .trim();

      setUsers((current) =>
        [
          ...current,
          {
            uid: createdUser.uid,
            displayName: displayName
              .split(" ")
              .filter(Boolean)
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
            email: createdUser.email || formValues.email,
            designation: "Admin",
            office: "",
            role: "admin",
            profileComplete: true
          }
        ].sort((first, second) =>
          String(first.displayName || first.email || "").localeCompare(String(second.displayName || second.email || ""))
        )
      );
      setMessage(
        createdUser.promotedExistingUser
          ? "Existing user account was upgraded to admin access."
          : "New admin account created successfully."
      );
      setFormValues(initialForm);
      resetAdminOtpVerification();
    } catch (createError) {
      if (createError.code === "auth/email-already-in-use") {
        setError("That email already exists and cannot be created again. If it belongs to a registered user, it will be promoted automatically.");
      } else if (createError.code === "auth/weak-password") {
        setError("Use a stronger password with at least 6 characters.");
      } else {
        setError(createError.message || "Failed to create admin user.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    setSendingOtp(true);

    try {
      await startAdminOtp(profile?.phoneNumber, "admin-phone-recaptcha");
      setMessage("OTP sent to the main admin mobile number.");
    } catch (otpError) {
      if (
        otpError.code === "auth/billing-not-enabled" ||
        otpError.code === "auth/operation-not-allowed"
      ) {
        setError("Firebase Phone OTP is not available for this project yet. Enable Phone Authentication and billing first.");
      } else if (otpError.code === "auth/invalid-app-credential") {
        setError("Phone OTP verification failed for this app configuration. Use the main admin password verification below or fix the Firebase phone-auth setup.");
      } else {
        setError(otpError.message || "Failed to send OTP.");
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyPassword = async () => {
    setError("");
    setMessage("");

    if (!formValues.currentPassword) {
      setError("Enter the main admin password first.");
      return;
    }

    setVerifyingPassword(true);

    try {
      await verifyMainAdminPassword(formValues.currentPassword);
      setMessage("Main admin password verified successfully.");
    } catch (verifyError) {
      setError(verifyError.message || "Password verification failed.");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!formValues.otpCode) {
      setError("Enter the OTP code sent to the main admin mobile.");
      return;
    }

    setVerifyingOtp(true);

    try {
      await verifyAdminOtp(formValues.otpCode);
      setMessage("Main admin mobile verified successfully.");
    } catch (otpError) {
      setError(otpError.message || "Failed to verify OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRemoveAdmin = async (user) => {
    setError("");
    setMessage("");
    setUpdatingUid(user.uid);

    try {
      await update(ref(database, `users/${user.uid}`), {
        role: "user",
        updatedAt: new Date().toISOString()
      });

      setUsers((current) => current.map((item) => (item.uid === user.uid ? { ...item, role: "user" } : item)));
      setMessage(`${user.displayName || user.email} no longer has admin access.`);
    } catch (updateError) {
      setError(updateError.message || "Failed to remove admin access.");
    } finally {
      setUpdatingUid("");
    }
  };

  return (
    <section className="bookings-page container">
      <div className="allotment-header">
        <div>
          <h1>Manage Admin Users</h1>
          <p className="allotment-subtitle">
            Only the primary admin can create additional admin accounts for the website.
          </p>
        </div>
      </div>

      <div className="admin-users-shell">
        <article className="admin-users-summary">
          <div className="admin-summary-card">
            <span>Primary Admin</span>
            <strong>{profile?.email || "Configured in environment"}</strong>
          </div>
          <div className="admin-summary-card">
            <span>Additional Admins</span>
            <strong>{adminUsers.length}</strong>
          </div>
          <div className="admin-summary-card">
            <span>Total Admin Access</span>
            <strong>{adminUsers.length + 1}</strong>
          </div>
        </article>

        <article className="confirm-card admin-manage-card">
          <div className="booking-form-header">
            <h2>Create New Admin</h2>
            <p>Enter the admin email. If the email already belongs to a registered user, the website will promote that user to admin access after main admin mobile verification.</p>
          </div>

          {error ? <p className="auth-error">{error}</p> : null}
          {message ? <p className="auth-success">{message}</p> : null}

          <form className="auth-form auth-form-wide admin-create-form" onSubmit={handleCreateAdmin}>
            <label>
              Admin Email
              <input
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="newadmin@example.com"
                autoComplete="email"
              />
            </label>

            <label>
              Admin Password
              <input
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleChange}
                placeholder="Enter a strong password"
                autoComplete="new-password"
              />
            </label>

            <p className="admin-inline-note">
              If this email already belongs to a user account, the existing account will be promoted to admin and its current login method will stay the same.
            </p>

            <div className="admin-otp-block">
              <div className="admin-otp-row">
                <div className="admin-otp-copy">
                  <strong>Main Admin Mobile</strong>
                  <span>{profile?.phoneNumber || "Add phone number in main admin profile first"}</span>
                </div>
                <button type="button" className="small-button" onClick={handleSendOtp} disabled={sendingOtp || !profile?.phoneNumber}>
                  {sendingOtp ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>

              <div id="admin-phone-recaptcha" className="admin-phone-recaptcha" />

              <div className="admin-otp-row">
                <label className="admin-otp-field">
                  OTP Code
                  <input
                    name="otpCode"
                    value={formValues.otpCode}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    inputMode="numeric"
                  />
                </label>
                <button type="button" className="small-button" onClick={handleVerifyOtp} disabled={verifyingOtp}>
                  {verifyingOtp ? "Verifying..." : adminOtpVerified ? "Verified" : "Verify OTP"}
                </button>
              </div>

              <div className="admin-otp-divider">
                <span>or verify with main admin password</span>
              </div>

              <div className="admin-otp-row">
                <label className="admin-otp-field">
                  Main Admin Password
                  <input
                    name="currentPassword"
                    type="password"
                    value={formValues.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current main admin password"
                    autoComplete="current-password"
                  />
                </label>
                <button type="button" className="small-button" onClick={handleVerifyPassword} disabled={verifyingPassword}>
                  {verifyingPassword ? "Verifying..." : adminOtpVerified ? "Verified" : "Verify Password"}
                </button>
              </div>
            </div>

            <button type="submit" className="small-button" disabled={submitting}>
              {submitting ? "Creating Admin..." : "Create Admin User"}
            </button>
          </form>
        </article>

        <article className="confirm-card admin-manage-card">
          <div className="booking-form-header">
            <h2>Current Admins</h2>
            <p>These accounts can access allotments, room occupancy, and the booking register.</p>
          </div>

          {loading ? <p className="page-message">Loading admin users...</p> : null}
          {!loading && adminUsers.length === 0 ? <p className="page-message">No additional admin users yet.</p> : null}

          <div className="admin-user-list">
            {adminUsers.map((user) => (
              <div className="admin-user-card" key={user.uid}>
                <div className="admin-user-copy">
                  <strong>{user.displayName || "Admin User"}</strong>
                  <p>{user.email || "No email"}</p>
                  <span>{user.designation || "Admin"} | {user.office || "Website admin account"}</span>
                </div>
                <div className="admin-user-actions">
                  <span className="user-ready-pill active">Admin Access</span>
                  <button
                    type="button"
                    className="small-button danger"
                    disabled={updatingUid === user.uid}
                    onClick={() => handleRemoveAdmin(user)}
                  >
                    {updatingUid === user.uid ? "Updating..." : "Remove Admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default AdminUsersPage;
