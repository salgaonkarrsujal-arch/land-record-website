import { get, push, ref, set } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingSidebar } from "../data/siteContent";
import { hostelRoomNumbersByWing } from "../data/hostelLayout";
import { database, isFirebaseConfigured } from "../lib/firebase";

const initialForm = {
  fromDate: "",
  toDate: "",
  hostelWing: "",
  roomNumber: "",
  stayCategory: "",
  allotmentDate: "",
  handoverDate: "",
  roomChargesAmount: "",
  remarks: "",
  bookingReference: ""
};

function ConfirmBookingPage() {
  const navigate = useNavigate();
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [formValues, setFormValues] = useState(initialForm);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      if (!isFirebaseConfigured || !database) {
        setLoadingUsers(false);
        return;
      }

      const snapshot = await get(ref(database, "users"));
      const value = snapshot.exists() ? snapshot.val() : {};
      const users = Object.values(value)
        .filter((item) => item.role === "user")
        .sort((first, second) => String(first.displayName || "").localeCompare(String(second.displayName || "")));

      setRegisteredUsers(users);
      setLoadingUsers(false);
    }

    loadUsers();
  }, []);

  const selectedUser = useMemo(
    () => registeredUsers.find((item) => item.uid === selectedUserId) || null,
    [registeredUsers, selectedUserId]
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return registeredUsers;
    }

    return registeredUsers.filter((user) =>
      [user.displayName, user.designation, user.office, user.email, user.phoneNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [registeredUsers, searchValue]);

  const roomOptions = useMemo(() => {
    return hostelRoomNumbersByWing[formValues.hostelWing] || [];
  }, [formValues.hostelWing]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      stayCategory: current.stayCategory || selectedUser.workType || ""
    }));
  }, [selectedUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => {
      if (name === "hostelWing") {
        return { ...current, hostelWing: value, roomNumber: "" };
      }

      return { ...current, [name]: value };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedUser) {
      setError("Select a registered user before allotting a room.");
      return;
    }

    if (
      !formValues.fromDate ||
      !formValues.toDate ||
      !formValues.hostelWing ||
      !formValues.stayCategory ||
      !formValues.allotmentDate ||
      !formValues.handoverDate
    ) {
      setError("Fill the allotment dates, stay details, and hostel details before saving.");
      return;
    }

    if (
      (formValues.hostelWing === "Women's Hostel" || formValues.hostelWing === "Men's Hostel") &&
      !formValues.roomNumber
    ) {
      setError("Select a room number for the chosen hostel wing.");
      return;
    }

    if (!isFirebaseConfigured || !database) {
      setError("Firebase is not configured yet. Add your Firebase env values first.");
      return;
    }

    setSubmitting(true);

    try {
      const reference = formValues.bookingReference || `REF-${Date.now()}`;
      const bookingPayload = {
        userId: selectedUser.uid,
        createdByRole: "admin",
        profileName: selectedUser.displayName || "",
        srNo: `TEMP-${Date.now()}`,
        employeeName: selectedUser.displayName || "",
        designation: selectedUser.designation || "",
        office: selectedUser.office || "",
        adminWork: selectedUser.adminWork || "",
        workType: selectedUser.workType || formValues.stayCategory || "",
        contactPhone: selectedUser.phoneNumber || "",
        contactEmail: selectedUser.email || "",
        contact: `${selectedUser.phoneNumber || "-"} | ${selectedUser.email || "-"}`,
        checkIn: formValues.fromDate,
        checkOut: formValues.toDate,
        womenRoom: formValues.hostelWing === "Women's Hostel" ? formValues.roomNumber : "-",
        menRoom: formValues.hostelWing === "Men's Hostel" ? formValues.roomNumber : "-",
        allotmentDate: formValues.allotmentDate,
        handoverDate: formValues.handoverDate,
        remarks: formValues.remarks || selectedUser.remarks || "-",
        roomChargesAmount: formValues.roomChargesAmount || "",
        price: formValues.roomChargesAmount || "Pending",
        meta: `${formValues.hostelWing} | ${reference}`,
        services: formValues.stayCategory || selectedUser.workType || "Booked Stay",
        name: bookingSidebar.title,
        address: bookingSidebar.location,
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
        bookingReference: reference,
        status: "Allotted",
        createdAt: new Date().toISOString()
      };

      const bookingsRef = ref(database, "bookings");
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, bookingPayload);

      const emailKey = String(selectedUser.email || "")
        .trim()
        .toLowerCase()
        .replace(/[.#$/\[\]]/g, "_");

      if (emailKey) {
        await set(ref(database, `publicRoomSearch/${emailKey}/${newBookingRef.key}`), {
          employeeName: bookingPayload.employeeName,
          designation: bookingPayload.designation,
          office: bookingPayload.office,
          contact: bookingPayload.contact,
          womenRoom: bookingPayload.womenRoom,
          menRoom: bookingPayload.menRoom,
          checkIn: bookingPayload.checkIn,
          checkOut: bookingPayload.checkOut,
          allotmentDate: bookingPayload.allotmentDate,
          handoverDate: bookingPayload.handoverDate,
          workType: bookingPayload.workType,
          adminWork: bookingPayload.adminWork,
          remarks: bookingPayload.remarks,
          meta: bookingPayload.meta,
          services: bookingPayload.services,
          srNo: bookingPayload.srNo
        });
      }

      setSuccess("Room allotted successfully.");
      setFormValues(initialForm);
      setSelectedUserId("");
      setSearchValue("");
      navigate("/bookings");
    } catch (submitError) {
      setError(submitError.message || "Failed to save allotment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="confirm-page container">
      <h1>Create Allotment</h1>

      <div className="confirm-layout">
        <div className="confirm-main">
          <article className="confirm-card user-selection-panel">
            <div className="booking-form-header">
              <h2>Select Registered User</h2>
              <p>Select a saved user profile from the registration list before allotting a room.</p>
            </div>
            {loadingUsers ? <p className="page-message">Loading registered users...</p> : null}
            {!loadingUsers ? (
              <div className="user-selection-dropdown-wrap">
                <label className="user-selection-label">
                  Search User
                  <input
                    className="user-selection-search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search by name, designation, office, email, or phone"
                  />
                </label>
                {searchValue.trim() ? (
                  <div className="user-selection-label">
                    <span>Select User</span>
                    <div className="user-selection-results">
                      {filteredUsers.length === 0 ? (
                        <p className="page-message">No registered users match this search.</p>
                      ) : (
                        filteredUsers.map((user) => (
                        <button
                          key={user.uid}
                          type="button"
                          className={`user-result-card ${selectedUserId === user.uid ? "active" : ""}`}
                          onClick={() => setSelectedUserId(user.uid)}
                        >
                          <div className="user-result-head">
                            <span className="user-result-main">{user.displayName || "Unnamed user"}</span>
                            <span className={`user-ready-pill ${user.profileComplete ? "ready" : "pending"}`}>
                              {user.profileComplete ? "Ready for Allotment" : "Incomplete"}
                            </span>
                          </div>
                          <span className="user-result-meta">
                            {user.designation || "No designation"} | {user.office || "No office"} |{" "}
                            {user.email || "No email"}
                          </span>
                        </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>

          <form className="confirm-card" onSubmit={handleSubmit}>
            <div className="booking-form-header">
              <h2>Allotment Details</h2>
              <p>Room assignment is created from the selected user profile and saved to the booking register.</p>
            </div>

            {selectedUser ? (
              <div className="selected-user-summary">
                <h3>Selected User Profile</h3>
                <div className="selected-user-grid">
                  <div>
                    <span>Employee Name</span>
                    <strong>{selectedUser.displayName || "-"}</strong>
                  </div>
                  <div>
                    <span>Designation</span>
                    <strong>{selectedUser.designation || "-"}</strong>
                  </div>
                  <div>
                    <span>Office</span>
                    <strong>{selectedUser.office || "-"}</strong>
                  </div>
                  <div>
                    <span>Administrative Work</span>
                    <strong>{selectedUser.adminWork || "-"}</strong>
                  </div>
                  <div>
                    <span>Type of Work</span>
                    <strong>{selectedUser.workType || "-"}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong>{selectedUser.phoneNumber || "-"} | {selectedUser.email || "-"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="page-message">Select a registered user above to continue.</p>
            )}

            <section className="booking-form-section">
              <h3>Stay & Room Allotment</h3>
              <div className="form-grid two-col">
                <label>
                  From *
                  <input type="date" name="fromDate" value={formValues.fromDate} onChange={handleChange} required />
                </label>
                <label>
                  To *
                  <input type="date" name="toDate" value={formValues.toDate} onChange={handleChange} required />
                </label>
                <label>
                  Hostel Wing *
                  <select name="hostelWing" value={formValues.hostelWing} onChange={handleChange} required>
                    <option value="">Select hostel wing</option>
                    <option>Women's Hostel</option>
                    <option>Men's Hostel</option>
                    <option>Administrative Stay</option>
                  </select>
                </label>
                <label>
                  Room Number{" "}
                  {formValues.hostelWing === "Women's Hostel" || formValues.hostelWing === "Men's Hostel"
                    ? "*"
                    : "(optional)"}
                  <select
                    name="roomNumber"
                    value={formValues.roomNumber}
                    onChange={handleChange}
                    required={formValues.hostelWing === "Women's Hostel" || formValues.hostelWing === "Men's Hostel"}
                    disabled={!formValues.hostelWing || formValues.hostelWing === "Administrative Stay"}
                  >
                    <option value="">Select room number</option>
                    {roomOptions.map((room) => (
                      <option key={room} value={room}>
                        Room {room}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Stay Category *
                  <input
                    name="stayCategory"
                    value={formValues.stayCategory}
                    onChange={handleChange}
                    placeholder="Training Programme / Administrative Work"
                    required
                  />
                </label>
                <label>
                  Booking Reference
                  <input
                    name="bookingReference"
                    value={formValues.bookingReference}
                    onChange={handleChange}
                    placeholder="Optional custom reference"
                  />
                </label>
              </div>
            </section>

            <section className="booking-form-section">
              <h3>Register Information</h3>
              <div className="form-grid two-col">
                <label>
                  Room Allotment Date *
                  <input
                    type="date"
                    name="allotmentDate"
                    value={formValues.allotmentDate}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Room Handover Date *
                  <input
                    type="date"
                    name="handoverDate"
                    value={formValues.handoverDate}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Room Charges Amount
                  <input
                    name="roomChargesAmount"
                    value={formValues.roomChargesAmount}
                    onChange={handleChange}
                    placeholder="₹ 2400"
                  />
                </label>
                <label className="full-span">
                  Remarks
                  <textarea
                    name="remarks"
                    rows="5"
                    value={formValues.remarks}
                    onChange={handleChange}
                    placeholder="Room handover notes, pending items, or allotment remarks"
                  />
                </label>
              </div>
            </section>

            {error ? <p className="auth-error booking-feedback">{error}</p> : null}
            {success ? <p className="auth-success booking-feedback">{success}</p> : null}

            <button type="submit" className="confirm-button" disabled={submitting}>
              {submitting ? "Saving Allotment..." : "Save Allotment"}
            </button>
          </form>
        </div>

        <aside className="confirm-sidebar">
          <div className="summary-card image-card">
            <div className="summary-image" />
            <h3>{bookingSidebar.title}</h3>
            <p className="address-line">{bookingSidebar.location}</p>
            <div className="summary-features">
              {bookingSidebar.details.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="summary-card">
            <h3>Selected User</h3>
            <div className="summary-row">
              <div>
                <span>Name</span>
                <strong>{selectedUser?.displayName || "Select user"}</strong>
              </div>
              <div>
                <span>Office</span>
                <strong>{selectedUser?.office || "Pending"}</strong>
              </div>
            </div>
            <p>{selectedUser?.designation || "Designation will appear here"}</p>
            <p>{selectedUser?.workType || "Saved stay type will appear here"}</p>
          </div>

          <div className="summary-card">
            <h3>Allotment Summary</h3>
            <div className="summary-row">
              <div>
                <span>Check-in</span>
                <strong>{formValues.fromDate || bookingSidebar.booking.checkIn}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{formValues.toDate || bookingSidebar.booking.checkOut}</strong>
              </div>
            </div>
            <p>{formValues.roomNumber || "Room number will appear here"}</p>
            <p>{formValues.roomChargesAmount || "Room charges will appear here"}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ConfirmBookingPage;
