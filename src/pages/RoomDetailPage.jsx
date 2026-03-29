import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import {
  detailFacts,
  detailGallery,
  detailPolicies,
  detailSummary,
  roomAmenities,
  roomHighlights,
  roomOptions
} from "../data/siteContent";

function RoomDetailPage() {
  return (
    <section className="detail-page container">
      <div className="search-again-wrap narrow">
        <SearchBar compact />
      </div>

      <section className="detail-gallery">
        <img className="gallery-main" src={detailGallery[0]} alt="Main stay view" />
        <div className="gallery-side">
          <img src={detailGallery[1]} alt="Stay detail" />
        </div>
      </section>

      <section className="detail-summary-band">
        {detailFacts.map((item) => (
          <article key={item.label} className="summary-fact-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <div className="detail-header">
        <div className="detail-title-card">
          <h1>Land Records Training Academy, Chhatrapati Sambhajinagar</h1>
          <p className="address-line">
            Hostel and room allotment centre for training stays and administrative work • show map
          </p>
          <div className="detail-badges">
            {detailSummary.badges.map((badge) => (
              <span key={badge} className="detail-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <aside className="detail-side-card">
          <p className="detail-side-eyebrow">Booking Flow</p>
          <h3>{detailSummary.title}</h3>
          <p>{detailSummary.subtitle}</p>
          <small>{detailSummary.note}</small>
          <Link className="small-button full-width-button" to="/confirm-booking">
            Proceed After Selecting Room
          </Link>
        </aside>
      </div>

      <section className="detail-overview-grid">
        <div className="overview-copy">
          <h2>Overview</h2>
          <p>
            Land Records Training Academy provides a structured room booking system for training stays,
            inspection visits, and administrative work other than training. The room detail page is designed
            to help users understand the stay environment before moving into the booking form.
          </p>
          <p>
            Each confirmed stay records the employee name, designation, office, contact details, hostel room
            number, room allotment date, room handover date, room charges amount, and remarks. This gives
            the user a clear path from room selection to register entry.
          </p>
          <div className="policy-list">
            {detailPolicies.map((item) => (
              <div key={item} className="policy-row">
                <span className="policy-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="highlights-card">
          <h3>Highlights</h3>
          {roomHighlights.map((item) => (
            <div className="highlight-row" key={item}>
              <span className="check-dot">✓</span>
              <p>{item}</p>
            </div>
          ))}
        </aside>
      </section>

      <section className="amenities-section">
        <h2>Amenities</h2>
        <div className="amenities-grid">
          {roomAmenities.map((item) => (
            <span className="amenity-pill" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="rooms-section">
        <h2>Rooms</h2>
        <div className="room-option-list">
          {roomOptions.map((room) => (
            <article key={room.name} className="room-option-card">
              <img src={room.image} alt={room.name} />
              <div className="room-option-copy">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <span className="availability-text">{room.availability}</span>
                <span className="room-option-meta">{room.meta}</span>
                <div className="room-feature-list">
                  {room.features.map((feature) => (
                    <span key={feature} className="room-feature-pill">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="room-option-side">
                <Link className="small-button" to="/confirm-booking">
                  Select Room
                </Link>
                <strong>{room.price}</strong>
                <small>Room allotment option</small>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="see-more">
          ⌄
          <span>See More Room Types</span>
        </button>
      </section>

      <section className="location-section">
        <h2>Location</h2>
        <div className="location-layout">
          <div className="map-placeholder">Campus Location Map</div>
          <aside className="location-card">
            <h3>Why this location works</h3>
            <p>Located within the academy campus for easy reporting, training attendance, and reception support.</p>
            <div className="location-points">
              <span>Near training halls</span>
              <span>Close to allotment desk</span>
              <span>Walkable hostel access</span>
              <span>Parking and reception nearby</span>
            </div>
          </aside>
        </div>
      </section>
    </section>
  );
}

export default RoomDetailPage;
