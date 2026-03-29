import { push, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingSidebar } from "../data/siteContent";
import { useAuth } from "../context/AuthContext";
import { database, isFirebaseConfigured } from "../lib/firebase";

const initialForm = {
  employeeName: "",
  designation: "",
  office: "",
  adminWork: "",
  fromDate: "",
  toDate: "",
  contactPhone: "",
  contactEmail: "",
  hostelWing: "",
  stayCategory: "",
  remarks: "",
  bookingReference: ""
};

function ConfirmBookingPage() {
  const navigate = useNavigate();
  const { currentUser, isAdmin, profile } = useAuth();
  const [formValues, setFormValues] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (!currentUser && !profile) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      employeeName: current.employeeName || profile?.displayName || currentUser?.displayName || "",
      contactEmail: current.contactEmail || profile?.email || currentUser?.email || "",
      contactPhone: current.contactPhone || profile?.phoneNumber || currentUser?.phoneNumber || "",
      office: current.office || profile?.office || "",
      designation: current.designation || profile?.designation || ""
    }));
  }, [currentUser, profile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentUser) {
      setError("Please log in before creating a booking.");
      return;
    }

    if (!isFirebaseConfigured || !database) {
      setError("Firebase is not configured yet. Add your Firebase env values first, including the Realtime Database URL.");
      return;
    }

    if (
      !formValues.employeeName ||
      !formValues.designation ||
      !formValues.office ||
      !formValues.contactPhone ||
      !formValues.contactEmail ||
      !formValues.fromDate ||
      !formValues.toDate ||
      !formValues.hostelWing ||
      !formValues.stayCategory
    ) {
      setError("Fill the required employee, contact, stay, and date fields before proceeding.");
      return;
    }

    setSubmitting(true);

    try {
      const reference = formValues.bookingReference || `REF-${Date.now()}`;
      const bookingPayload = {
        userId: currentUser.uid,
        createdByRole: isAdmin ? "admin" : "user",
        profileName: profile?.displayName || "",
        srNo: formValues.srNo || `TEMP-${Date.now()}`,
        employeeName: formValues.employeeName,
        designation: formValues.designation,
        office: formValues.office,
        adminWork: formValues.adminWork,
        workType: formValues.stayCategory || "General Stay",
        checkIn: formValues.fromDate,
        checkOut: formValues.toDate,
        contact: `${formValues.contactPhone} | ${formValues.contactEmail}`,
        womenRoom: formValues.hostelWing === "Women's Hostel" ? "Pending" : "-",
        menRoom: formValues.hostelWing === "Men's Hostel" ? "Pending" : "-",
        allotmentDate: "Pending",
        handoverDate: "Pending",
        remarks: formValues.remarks || "-",
        price: "Pending",
        meta: `${formValues.hostelWing} | ${reference}`,
        services: formValues.stayCategory || "Booked Stay",
        name: bookingSidebar.title,
        address: bookingSidebar.location,
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
        bookingReference: reference,
        createdAt: new Date().toISOString()
      };

      const bookingsRef = ref(database, "bookings");
      const newBookingRef = push(bookingsRef);

      await Promise.race([
        set(newBookingRef, bookingPayload),
        new Promise((_, reject) => {
          window.setTimeout(
            () => reject(new Error("Booking request timed out. Check Realtime Database rules or network.")),
            12000
          );
        })
      ]);

      setSuccess("Booking saved to Firebase successfully.");
      setFormValues(initialForm);
      navigate(isAdmin ? "/bookings" : "/my-bookings");
    } catch (submitError) {
      if (submitError.code === "PERMISSION_DENIED") {
        setError(
          "Realtime Database denied the booking write. Check your database rules and make sure the user is signed in."
        );
      } else if (submitError.message?.includes("timed out")) {
        setError(
          "Booking request timed out. Open Realtime Database rules and allow signed-in users to write bookings."
        );
      } else {
        setError(submitError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="confirm-page container">
      <h1>Confirm Booking</h1>

      <div className="confirm-layout">
        <div className="confirm-main">
          <form className="confirm-card" onSubmit={handleSubmit}>
            <h2>Employee and stay details</h2>
            <p className="form-helper-text">
              Enter only the essential booking details. Room allotment, charges, and register entries are
              completed later by the academy admin.
            </p>
            <div className="form-grid two-col">
              <label>
                Employee Name *
                <input name="employeeName" value={formValues.employeeName} onChange={handleChange} />
              </label>
              <label>
                Designation *
                <input name="designation" value={formValues.designation} onChange={handleChange} />
              </label>
              <label>
                Office *
                <input name="office" value={formValues.office} onChange={handleChange} />
              </label>
              <label>
                Administrative work other than training *
                <input name="adminWork" value={formValues.adminWork} onChange={handleChange} />
              </label>
              <label>
                From *
                <input name="fromDate" value={formValues.fromDate} onChange={handleChange} />
              </label>
              <label>
                To *
                <input name="toDate" value={formValues.toDate} onChange={handleChange} />
              </label>
              <label>
                Employee's Number *
                <input name="contactPhone" value={formValues.contactPhone} onChange={handleChange} />
              </label>
              <label>
                Employee's Email Address *
                <input name="contactEmail" value={formValues.contactEmail} onChange={handleChange} />
              </label>
              <label>
                Preferred Hostel Wing *
                <select name="hostelWing" value={formValues.hostelWing} onChange={handleChange}>
                  <option value="">Select hostel wing</option>
                  <option>Women's Hostel</option>
                  <option>Men's Hostel</option>
                  <option>Administrative Stay</option>
                </select>
              </label>
              <label>
                Stay Category *
                <select name="stayCategory" value={formValues.stayCategory} onChange={handleChange}>
                  <option value="">Select stay type</option>
                  <option>Training Programme</option>
                  <option>Administrative Work</option>
                </select>
              </label>
              <label className="full-span">
                Remarks
                <textarea name="remarks" rows="6" value={formValues.remarks} onChange={handleChange} />
              </label>
            </div>

            {error ? <p className="auth-error booking-feedback">{error}</p> : null}
            {success ? <p className="auth-success booking-feedback">{success}</p> : null}

            <button type="submit" className="confirm-button" disabled={submitting}>
              {submitting ? "Saving Booking..." : "Confirm & Proceed"}
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
            <h3>Your booking details</h3>
            <div className="summary-row">
              <div>
                <span>Check-in</span>
                <strong>{bookingSidebar.booking.checkIn}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{bookingSidebar.booking.checkOut}</strong>
              </div>
            </div>
            <p>{bookingSidebar.booking.roomType}</p>
            <p>{bookingSidebar.booking.guests}</p>
          </div>

          <div className="summary-card">
            <h3>Pricing Summary</h3>
            {bookingSidebar.pricing.map((item) => (
              <div className={`price-row ${item.total ? "total" : ""}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ConfirmBookingPage;
