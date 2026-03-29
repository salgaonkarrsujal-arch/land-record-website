import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import RoomCard from "../components/RoomCard";
import { useAuth } from "../context/AuthContext";
import { categoryRooms, overviewCards, topRatedRooms } from "../data/siteContent";

function HomePage() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <>
      <section className="home-hero">
        <div className="hero-overlay">
          <div className="container hero-inner">
            <div className="hero-copy">
              <h1>Reserve hostel rooms and manage academy stay allotments with ease.</h1>
              <p>Book rooms for training visits and administrative work at Land Records Training Academy.</p>
              {isAuthenticated ? (
                <div className="home-profile-strip">
                  <span className="profile-avatar home-avatar">
                    {(profile?.displayName || profile?.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <div className="home-profile-copy">
                    <span className="home-profile-label">Signed in</span>
                    <strong>{profile?.displayName || profile?.email || "Signed-in user"}</strong>
                    <small>Use the profile menu to manage your account and bookings.</small>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="container search-bar-wrap">
          <SearchBar />
        </div>
      </section>

      <section className="content-section container">
        <div className="section-title">
          <h2>Overview</h2>
          <span />
        </div>
        <div className="overview-grid">
          {overviewCards.map((item) => (
            <article key={item.title} className="overview-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section container">
        <div className="section-title">
          <h2>Top Rated</h2>
          <span />
        </div>
        <div className="room-grid five-col">
          {topRatedRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      <section className="content-section container">
        <div className="section-title">
          <h2>Category</h2>
          <span />
        </div>
        <div className="room-grid five-col">
          {categoryRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
        <div className="section-action">
          <Link className="small-button" to="/explore">
            Explore All Stays
          </Link>
        </div>
      </section>
    </>
  );
}

export default HomePage;
