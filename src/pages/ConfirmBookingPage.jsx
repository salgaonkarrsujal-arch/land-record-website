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
  const [selectedUserIds, setSelectedUserIds] = useState([]);
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

  const selectedUsers = useMemo(
    () => selectedUserIds.map((id) => registeredUsers.find((item) => item.uid === id)).filter(Boolean),
    [registeredUsers, selectedUserIds]
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return registeredUsers.filter((user) =>
      [user.displayName, user.designation, user.office, user.email, user.phoneNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch))
    );
  }, [registeredUsers, searchValue]);

  const roomOptions = useMemo(() => hostelRoomNumbersByWing[formValues.hostelWing] || [], [formValues.hostelWing]);

  useEffect(() => {
    if (selectedUsers.length === 0) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      stayCategory: current.stayCategory || selectedUsers[0]?.workType || ""
    }));
  }, [selectedUsers]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => {
      if (name === "hostelWing") {
        return { ...current, hostelWing: value, roomNumber: "" };
      }

      return { ...current, [name]: value };
    });
  };

  const handleUserToggle = (userId) => {
    setSelectedUserIds((current) => {
      if (current.includes(userId)) {
        return current.filter((id) => id !== userId);
      }

      if (current.length >= 2) {
        return current;
      }

      return [...current, userId];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (selectedUsers.length !== 2) {
      setError("Select exactly 2 candidates for one room allotment.");
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
      const candidateNames = selectedUsers.map((user) => user.displayName || "Unnamed user");
      const candidateContacts = selectedUsers.map(
        (user) => `${user.displayName || "User"}: ${user.phoneNumber || "-"} | ${user.email || "-"}`
      );

      const bookingPayload = {
        userId: selectedUsers[0].uid,
        candidateUserIds: selectedUsers.map((user) => user.uid),
        candidateNames,
        candidateEmails: selectedUsers.map((user) => String(user.email || "").trim()).filter(Boolean),
        candidateCount: 2,
        createdByRole: "admin",
        profileName: candidateNames.join(" & "),
        srNo: `TEMP-${Date.now()}`,
        employeeName: candidateNames.join(" & "),
        secondaryEmployeeName: candidateNames[1] || "",
        designation: selectedUsers.map((user) => user.designation || "-").join(" / "),
        office: selectedUsers.map((user) => user.office || "-").join(" / "),
        adminWork: selectedUsers.some((user) => user.adminWork === "Yes") ? "Yes" : "No",
        workType: formValues.stayCategory || selectedUsers[0]?.workType || "",
        contactPhone: selectedUsers.map((user) => user.phoneNumber || "-").join(" / "),
        contactEmail: selectedUsers.map((user) => user.email || "-").join(" / "),
        contact: candidateContacts.join(" || "),
        checkIn: formValues.fromDate,
        checkOut: formValues.toDate,
        womenRoom: formValues.hostelWing === "Women's Hostel" ? formValues.roomNumber : "-",
        menRoom: formValues.hostelWing === "Men's Hostel" ? formValues.roomNumber : "-",
        allotmentDate: formValues.allotmentDate,
        handoverDate: formValues.handoverDate,
        remarks: formValues.remarks || selectedUsers.map((user) => user.remarks).filter(Boolean).join(" | ") || "-",
        roomChargesAmount: formValues.roomChargesAmount || "",
        price: formValues.roomChargesAmount || "Pending",
        meta: `${formValues.hostelWing} | ${reference} | 1 Room | 2 Candidates`,
        services: `${formValues.stayCategory || selectedUsers[0]?.workType || "Booked Stay"} | Shared Room`,
        name: bookingSidebar.title,
        address: bookingSidebar.location,
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
        bookingReference: reference,
        occupancy: "1 Room | 2 Candidates",
        status: "Allotted",
        createdAt: new Date().toISOString()
      };

      const bookingsRef = ref(database, "bookings");
      const newBookingRef = push(bookingsRef);
      await set(newBookingRef, bookingPayload);

      await Promise.all(
        selectedUsers
          .map((user) => String(user.email || "").trim().toLowerCase().replace(/[.#$/\[\]]/g, "_"))
          .filter(Boolean)
          .map((emailKey) =>
            set(ref(database, `publicRoomSearch/${emailKey}/${newBookingRef.key}`), {
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
              srNo: bookingPayload.srNo,
              occupancy: bookingPayload.occupancy
            })
          )
      );

      setSuccess("Shared room allotted successfully.");
      setFormValues(initialForm);
      setSelectedUserIds([]);
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
              <h2>Select 2 Candidates</h2>
              <p>Search registered users and choose exactly two candidates for one shared room allotment.</p>
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

                {selectedUsers.length > 0 ? (
                  <div className="selected-candidates-grid">
                    {selectedUsers.map((user, index) => (
                      <div className="selected-user-inline" key={user.uid}>
                        <div className="selected-user-inline-head">
                          <strong>Candidate {index + 1}: {user.displayName || "Unnamed user"}</strong>
                          <span className={`user-ready-pill ${user.profileComplete ? "ready" : "pending"}`}>
                            {user.profileComplete ? "Ready for Allotment" : "Incomplete"}
                          </span>
                        </div>
                        <small>
                          {user.designation || "No designation"} | {user.office || "No office"} | {user.email || "No email"}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : null}

                {searchValue.trim() ? (
                  <div className="user-selection-label">
                    <span>Select Candidates</span>
                    <div className="user-selection-results">
                      {filteredUsers.length === 0 ? (
                        <p className="page-message">No registered users match this search.</p>
                      ) : (
                        filteredUsers.map((user) => {
                          const selected = selectedUserIds.includes(user.uid);
                          const disabled = selectedUserIds.length >= 2 && !selected;

                          return (
                            <button
                              key={user.uid}
                              type="button"
                              className={`user-result-card ${selected ? "active" : ""}`}
                              onClick={() => handleUserToggle(user.uid)}
                              disabled={disabled}
                            >
                              <div className="user-result-head">
                                <span className="user-result-main">{user.displayName || "Unnamed user"}</span>
                                <span className={`user-ready-pill ${user.profileComplete ? "ready" : "pending"}`}>
                                  {user.profileComplete ? "Ready" : "Incomplete"}
                                </span>
                              </div>
                              <span className="user-result-meta">
                                {user.designation || "No designation"} | {user.office || "No office"} | {user.email || "No email"}
                              </span>
                            </button>
                          );
                        })
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
              <p>One room will be assigned to two selected candidates and saved to the booking register.</p>
            </div>

            {selectedUsers.length === 2 ? (
              <div className="selected-user-summary">
                <h3>Selected Candidates</h3>
                <div className="selected-user-grid">
                  <div>
                    <span>Candidate 1</span>
                    <strong>{selectedUsers[0]?.displayName || "-"}</strong>
                  </div>
                  <div>
                    <span>Candidate 2</span>
                    <strong>{selectedUsers[1]?.displayName || "-"}</strong>
                  </div>
                  <div>
                    <span>Designation</span>
                    <strong>{selectedUsers.map((user) => user.designation || "-").join(" / ")}</strong>
                  </div>
                  <div>
                    <span>Office</span>
                    <strong>{selectedUsers.map((user) => user.office || "-").join(" / ")}</strong>
                  </div>
                  <div>
                    <span>Administrative Work</span>
                    <strong>{selectedUsers.some((user) => user.adminWork === "Yes") ? "Yes" : "No"}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong>{selectedUsers.map((user) => user.phoneNumber || "-").join(" / ")}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="page-message">Select two candidates above to continue.</p>
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
                  <input type="date" name="allotmentDate" value={formValues.allotmentDate} onChange={handleChange} required />
                </label>
                <label>
                  Room Handover Date *
                  <input type="date" name="handoverDate" value={formValues.handoverDate} onChange={handleChange} required />
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
              {submitting ? "Saving Allotment..." : "Save Shared Allotment"}
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
            <h3>Selected Candidates</h3>
            <div className="summary-row">
              <div>
                <span>Candidate 1</span>
                <strong>{selectedUsers[0]?.displayName || "Select candidate"}</strong>
              </div>
              <div>
                <span>Candidate 2</span>
                <strong>{selectedUsers[1]?.displayName || "Select candidate"}</strong>
              </div>
            </div>
            <p>{selectedUsers.map((user) => user.designation).filter(Boolean).join(" / ") || "Designation will appear here"}</p>
            <p>{selectedUsers.length > 0 ? "1 room will be allotted to 2 candidates." : "Select candidates first."}</p>
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
