import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import BookingCard from "../components/BookingCard";
import { useAuth } from "../context/AuthContext";
import { database, isFirebaseConfigured } from "../lib/firebase";

function UserBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      if (!isFirebaseConfigured || !database || !currentUser) {
        setLoading(false);
        return;
      }

      const snapshot = await get(ref(database, "bookings"));
      const value = snapshot.exists() ? snapshot.val() : {};
      const nextBookings = Object.entries(value)
        .map(([id, item]) => ({ id, ...item }))
        .filter((item) => item.userId === currentUser.uid);
      setBookings(nextBookings);
      setLoading(false);
    }

    loadBookings();
  }, [currentUser]);

  return (
    <section className="bookings-page container">
      <div className="allotment-header">
        <div>
          <h1>My Bookings</h1>
          <p className="allotment-subtitle">
            Review the bookings created from your account, including room assignment dates and remarks.
          </p>
        </div>
      </div>

      {loading ? <p className="page-message">Loading your bookings...</p> : null}
      {!loading && bookings.length === 0 ? (
        <p className="page-message">No bookings found yet. Create a booking after you sign in.</p>
      ) : null}

      <div className="bookings-list">
        {bookings.map((booking) => (
          <BookingCard key={booking.id || booking.name} booking={booking} />
        ))}
      </div>
    </section>
  );
}

export default UserBookingsPage;
