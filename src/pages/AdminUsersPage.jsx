import { get, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import { database, isFirebaseConfigured } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  email: "",
  password: ""
};

function AdminUsersPage() {
  const { profile, createAdminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingUid, setUpdatingUid] = useState("");

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
      setMessage("New admin account created successfully.");
      setFormValues(initialForm);
    } catch (createError) {
      if (createError.code === "auth/email-already-in-use") {
        setError("That email already has an account. Use another email for the admin account.");
      } else if (createError.code === "auth/weak-password") {
        setError("Use a stronger password with at least 6 characters.");
      } else {
        setError(createError.message || "Failed to create admin user.");
      }
    } finally {
      setSubmitting(false);
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
            <p>Enter the admin email and password here. The website will create the admin account directly.</p>
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
