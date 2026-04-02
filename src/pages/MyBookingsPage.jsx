import { get, ref, remove, update } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BookingCard from "../components/BookingCard";
import { allotmentFilters } from "../data/siteContent";
import { database, isFirebaseConfigured } from "../lib/firebase";
import { downloadBookingsCsv } from "../utils/exportBookings";

function MyBookingsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All records");
  const [searchValue, setSearchValue] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    async function loadAdminBookings() {
      if (!isFirebaseConfigured || !database) {
        setRecords([]);
        setLoading(false);
        return;
      }

      const snapshot = await get(ref(database, "bookings"));
      const value = snapshot.exists() ? snapshot.val() : {};
      const docs = Object.entries(value).map(([id, item]) => ({ id, ...item }));
      setRecords(docs);

      // One-time style backfill for existing records so public email search works.
      if (docs.length > 0) {
        const updates = {};
        docs.forEach((item) => {
          const contactEmail =
            String(item.contactEmail || "")
              .trim()
              .toLowerCase() ||
            String(item.contact || "")
              .split("|")
              .map((part) => part.trim().toLowerCase())
              .find((part) => part.includes("@")) ||
            "";

          if (!contactEmail || !item.id) {
            return;
          }

          const emailKey = contactEmail.replace(/[.#$/\[\]]/g, "_");
          updates[`publicRoomSearch/${emailKey}/${item.id}`] = {
            employeeName: item.employeeName || "",
            designation: item.designation || "",
            office: item.office || "",
            contact: item.contact || "",
            womenRoom: item.womenRoom || "-",
            menRoom: item.menRoom || "-",
            checkIn: item.checkIn || "",
            checkOut: item.checkOut || "",
            allotmentDate: item.allotmentDate || "",
            handoverDate: item.handoverDate || "",
            workType: item.workType || "",
            adminWork: item.adminWork || "",
            remarks: item.remarks || "",
            meta: item.meta || "",
            services: item.services || "",
            srNo: item.srNo || ""
          };
        });

        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates);
        }
      }

      setLoading(false);
    }

    loadAdminBookings();
  }, []);

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return records.filter((booking) => {
      const matchesFilter =
        activeFilter === "All records" ||
        booking.services?.toLowerCase().includes(activeFilter.toLowerCase()) ||
        booking.meta?.toLowerCase().includes(activeFilter.toLowerCase());

      const matchesSearch =
        !normalizedSearch ||
        [
          booking.employeeName,
          booking.office,
          booking.womenRoom,
          booking.menRoom,
          booking.workType,
          booking.designation
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, records, searchValue]);

  const handleDeleteBooking = async (booking) => {
    const confirmed = window.confirm("Delete this booking?");
    if (!confirmed) {
      return;
    }

    const bookingKey = booking.id || booking.srNo || booking.name;
    setDeletingId(String(bookingKey));

    try {
      if (isFirebaseConfigured && database && booking.id) {
        await remove(ref(database, `bookings/${booking.id}`));
      }

      setRecords((current) =>
        current.filter((item) => {
          if (booking.id) {
            return item.id !== booking.id;
          }

          if (booking.srNo) {
            return item.srNo !== booking.srNo;
          }

          return item.name !== booking.name;
        })
      );
    } catch (error) {
      window.alert(error.message || "Failed to delete booking.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="bookings-page container">
      <div className="allotment-header">
        <div>
          <h1>Allotment Register</h1>
          <p className="allotment-subtitle">View allotted rooms, search registered users, and manage the academy booking register.</p>
        </div>
        <div className="allotment-header-actions">
          <Link className="small-button" to="/create-booking">
            Create Allotment
          </Link>
          <button
            type="button"
            className="small-button"
            onClick={() => downloadBookingsCsv(filteredRecords, "academy-allotment-register.csv")}
          >
            Export Register
          </button>
        </div>
      </div>

      <div className="allotment-toolbar">
        <div className="allotment-filter-pills">
          {allotmentFilters.map((item, index) => (
            <button
              type="button"
              key={item}
              className={`allotment-pill ${activeFilter === item || (index === 0 && activeFilter === "All records") ? "active" : ""}`}
              onClick={() => setActiveFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          className="allotment-search-input"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search records"
        />
      </div>

      {loading ? <p className="page-message">Loading allotment records...</p> : null}
      <div className="bookings-list">
        {!loading && filteredRecords.length === 0 ? (
          <div className="empty-state-card">
            <h3>No allotment records yet</h3>
            <p>Booked candidates will appear here once an admin creates a room allotment.</p>
          </div>
        ) : (
          filteredRecords.map((booking) => (
            <BookingCard
              key={booking.id || booking.name}
              booking={booking}
              onDelete={handleDeleteBooking}
              deleting={deletingId === String(booking.id || booking.srNo || booking.name)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default MyBookingsPage;
