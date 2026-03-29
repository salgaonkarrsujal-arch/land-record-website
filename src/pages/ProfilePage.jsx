import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { database, isFirebaseConfigured } from "../lib/firebase";

function ProfilePage() {
  const { currentUser, isAdmin, profile, saveProfile } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeStays: 0,
    adminManaged: 0
  });
  const [formValues, setFormValues] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    office: "",
    designation: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFormValues({
      displayName: profile?.displayName || currentUser?.displayName || "",
      email: profile?.email || currentUser?.email || "",
      phoneNumber: profile?.phoneNumber || currentUser?.phoneNumber || "",
      office: profile?.office || "",
      designation: profile?.designation || ""
    });
  }, [currentUser, profile]);

  useEffect(() => {
    async function loadStats() {
      if (!isFirebaseConfigured || !database || !currentUser) {
        return;
      }

      const snapshot = await get(ref(database, "bookings"));
      const value = snapshot.exists() ? snapshot.val() : {};
      const docs = Object.values(value).filter((item) => isAdmin || item.userId === currentUser.uid);

      setStats({
        totalBookings: docs.length,
        activeStays: docs.filter((item) => item.services?.toLowerCase().includes("stay")).length,
        adminManaged: docs.filter((item) => item.createdByRole === "admin").length
      });
    }

    loadStats();
  }, [currentUser, isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await saveProfile(formValues);
      setMessage("Profile updated successfully.");
    } catch (profileError) {
      setError(profileError.message);
    }
  };

  return (
    <section className="profile-page container">
      <div className="profile-hero-card">
        <div className="profile-avatar-large">
          {(profile?.displayName || profile?.email || "U").charAt(0).toUpperCase()}
        </div>
        <div className="profile-hero-copy">
          <p className="auth-eyebrow">{isAdmin ? "Admin Profile" : "User Profile"}</p>
          <h1>{profile?.displayName || "Land Records Training Academy User"}</h1>
          <p>
            {isAdmin
              ? "Manage the room allotment register, download booked data, and review academy-wide booking activity."
              : "Review your account details, stay activity, and booking history for the academy room booking portal."}
          </p>
        </div>
      </div>

      <div className="profile-stats-grid">
        <article className="profile-stat-card">
          <span>Total Bookings</span>
          <strong>{stats.totalBookings}</strong>
        </article>
        <article className="profile-stat-card">
          <span>Active Stays</span>
          <strong>{stats.activeStays}</strong>
        </article>
        <article className="profile-stat-card">
          <span>{isAdmin ? "Admin Managed" : "Admin-assisted"}</span>
          <strong>{stats.adminManaged}</strong>
        </article>
      </div>

      <div className="profile-layout">
        <article className="profile-card">
          <h2>Account Information</h2>
          {error ? <p className="auth-error booking-feedback">{error}</p> : null}
          {message ? <p className="auth-success booking-feedback">{message}</p> : null}
          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-info-list">
              <label>
                <span>Display Name</span>
                <input name="displayName" value={formValues.displayName} onChange={handleChange} />
              </label>
              <label>
                <span>Email</span>
                <input name="email" value={formValues.email} onChange={handleChange} disabled />
              </label>
              <label>
                <span>Phone Number</span>
                <input name="phoneNumber" value={formValues.phoneNumber} onChange={handleChange} />
              </label>
              <label>
                <span>Office</span>
                <input name="office" value={formValues.office} onChange={handleChange} />
              </label>
              <label>
                <span>Designation</span>
                <input name="designation" value={formValues.designation} onChange={handleChange} />
              </label>
              <div className="profile-static-field">
                <span>Role</span>
                <strong>{profile?.role || "user"}</strong>
              </div>
              <div className="profile-static-field">
                <span>Provider</span>
                <strong>{profile?.providerId || "custom"}</strong>
              </div>
            </div>
            <button type="submit" className="small-button profile-save-button">
              Save Profile
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
