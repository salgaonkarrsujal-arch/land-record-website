import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const DEFAULT_COUNTRY_CODE = "+91";

function ProfilePage() {
  const { currentUser, profile, saveProfile, isAdmin, isProfileComplete } = useAuth();
  const [formValues, setFormValues] = useState({
    displayName: "",
    email: "",
    phoneNumber: DEFAULT_COUNTRY_CODE,
    office: "",
    designation: "",
    adminWork: "",
    workType: "",
    remarks: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFormValues({
      displayName: profile?.displayName || currentUser?.displayName || "",
      email: profile?.email || currentUser?.email || "",
      phoneNumber: profile?.phoneNumber || currentUser?.phoneNumber || DEFAULT_COUNTRY_CODE,
      office: profile?.office || "",
      designation: profile?.designation || "",
      adminWork: profile?.adminWork || "",
      workType: profile?.workType || "",
      remarks: profile?.remarks || ""
    });
  }, [currentUser, profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "phoneNumber") {
      const nextValue = value.startsWith(DEFAULT_COUNTRY_CODE)
        ? value
        : `${DEFAULT_COUNTRY_CODE}${value.replace(/^\+?91?/, "")}`;
      setFormValues((current) => ({ ...current, [name]: nextValue }));
      return;
    }

    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await saveProfile(formValues);
      setMessage(isAdmin ? "Profile updated successfully." : "Registration details saved successfully.");
    } catch (profileError) {
      setError(profileError.message);
    }
  };

  return (
    <section className="profile-page container">
      <div className="profile-layout">
        <article className="profile-card">
          <div className="profile-registration-head">
            <div>
              <h2>{isAdmin ? "Account Information" : "User Registration"}</h2>
              <p className="profile-registration-copy">
                {isAdmin
                  ? "Update your administrator contact details and academy profile."
                  : "Fill your details once. The admin will use this saved profile to search your name and allot a room."}
              </p>
            </div>
            {!isAdmin ? (
              <span className={`profile-status-pill ${isProfileComplete ? "complete" : "pending"}`}>
                {isProfileComplete ? "Registration Complete" : "Registration Pending"}
              </span>
            ) : null}
          </div>

          {!isAdmin && !isProfileComplete ? (
            <p className="profile-registration-note">
              Complete all required fields so your record appears properly in the admin allotment list.
            </p>
          ) : null}

          {error ? <p className="auth-error booking-feedback">{error}</p> : null}
          {message ? <p className="auth-success booking-feedback">{message}</p> : null}

          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-info-list">
              <label>
                <span>Employee Name *</span>
                <input name="displayName" value={formValues.displayName} onChange={handleChange} required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" value={formValues.email} onChange={handleChange} disabled />
              </label>
              <label>
                <span>Phone Number *</span>
                <input
                  name="phoneNumber"
                  value={formValues.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <span>Office *</span>
                <input name="office" value={formValues.office} onChange={handleChange} required />
              </label>
              <label>
                <span>Designation *</span>
                <input name="designation" value={formValues.designation} onChange={handleChange} required />
              </label>
              <label>
                <span>Administrative Work *</span>
                <select name="adminWork" value={formValues.adminWork} onChange={handleChange} required>
                  <option value="">Select option</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </label>
              <label className="full-span">
                <span>Type of Administrative Work / Stay Type *</span>
                <input
                  name="workType"
                  value={formValues.workType}
                  onChange={handleChange}
                  placeholder="Training Programme / Administrative Inspection / Official Visit"
                  required
                />
              </label>
              <label className="full-span">
                <span>Remarks</span>
                <textarea
                  name="remarks"
                  rows="4"
                  value={formValues.remarks}
                  onChange={handleChange}
                  placeholder="Optional notes for the allotment desk"
                />
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
              {isAdmin ? "Save Profile" : "Save Registration"}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
