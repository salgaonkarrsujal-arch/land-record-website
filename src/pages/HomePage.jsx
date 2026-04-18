import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { isAdmin, isMainAdmin } = useAuth();

  return (
    <section className="content-section container">
      <div className="section-title">
        <h2>{isAdmin ? "Dashboard" : "Home"}</h2>
        <span />
      </div>

      <div className="overview-grid">
        <article className="overview-card">
          <h3>{isAdmin ? "Create Allotment" : "My Profile"}</h3>
          <p>{isAdmin ? "Create room allotment for registered users." : "View and update your saved registration details."}</p>
          <Link className="small-button" to={isAdmin ? "/create-booking" : "/profile"}>
            {isAdmin ? "Create Allotment" : "Open Profile"}
          </Link>
        </article>

        <article className="overview-card">
          <h3>{isAdmin ? "Allotment Register" : "My Bookings"}</h3>
          <p>{isAdmin ? "View, search, and export the booking register." : "Check your allotment status and room details."}</p>
          <Link className="small-button" to={isAdmin ? "/bookings" : "/my-bookings"}>
            {isAdmin ? "Open Register" : "Open My Bookings"}
          </Link>
        </article>

        {isAdmin && isMainAdmin ? (
          <article className="overview-card">
            <h3>Manage Admins</h3>
            <p>Grant or remove admin access. Only the primary admin can open this control panel.</p>
            <Link className="small-button" to="/manage-admins">
              Open Admin Access
            </Link>
          </article>
        ) : null}

        <article className="overview-card">
          <h3>{isAdmin ? "Room Occupancy" : "Support"}</h3>
          <p>{isAdmin ? "Check available and occupied rooms before assigning." : "Admin will use your saved profile to allot the room."}</p>
          {isAdmin ? (
            <Link className="small-button" to="/room-occupancy">
              Open Map
            </Link>
          ) : (
            <Link className="small-button" to="/my-bookings">
              View Booking Status
            </Link>
          )}
        </article>
      </div>
    </section>
  );
}

export default HomePage;
