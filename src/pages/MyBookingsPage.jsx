import { get, ref } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import BookingCard from "../components/BookingCard";
import { allotmentFilters, allotmentStats, bookings } from "../data/siteContent";
import { database, isFirebaseConfigured } from "../lib/firebase";
import { downloadBookingsCsv } from "../utils/exportBookings";

function MyBookingsPage() {
  const [records, setRecords] = useState(bookings);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All records");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    async function loadAdminBookings() {
      if (!isFirebaseConfigured || !database) {
        setLoading(false);
        return;
      }

      const snapshot = await get(ref(database, "bookings"));
      const value = snapshot.exists() ? snapshot.val() : {};
      const docs = Object.entries(value).map(([id, item]) => ({ id, ...item }));
      setRecords(docs.length > 0 ? docs : bookings);
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

  const computedStats = useMemo(
    () => [
      { label: "Total active allotments", value: String(records.length) },
      {
        label: "Women's hostel rooms",
        value: `${records.filter((item) => item.womenRoom && item.womenRoom !== "-").length} occupied`
      },
      {
        label: "Men's hostel rooms",
        value: `${records.filter((item) => item.menRoom && item.menRoom !== "-").length} occupied`
      },
      {
        label: "Administrative stays",
        value: `${records.filter((item) => item.services?.toLowerCase().includes("administrative")).length} ongoing`
      }
    ],
    [records]
  );

  return (
    <section className="bookings-page container">
      <div className="allotment-header">
        <div>
          <h1>Room Allotment Register</h1>
          <p className="allotment-subtitle">
            Review active room allotments, employee details, hostel assignments, allotment dates, charges,
            and remarks through a cleaner and more informative academy register.
          </p>
        </div>
        <button
          type="button"
          className="small-button"
          onClick={() => downloadBookingsCsv(filteredRecords, "academy-allotment-register.csv")}
        >
          Export Register
        </button>
      </div>

      <div className="allotment-stats-grid">
        {computedStats.map((item) => (
          <article key={item.label} className="allotment-stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
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
          placeholder="Search by employee, office, hostel room, or stay type"
        />
      </div>

      {loading ? <p className="page-message">Loading allotment records...</p> : null}
      <div className="bookings-list">
        {filteredRecords.map((booking) => (
          <BookingCard key={booking.id || booking.name} booking={booking} />
        ))}
      </div>
    </section>
  );
}

export default MyBookingsPage;
