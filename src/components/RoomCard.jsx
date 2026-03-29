import { Link } from "react-router-dom";

function RoomCard({ room, mode = "grid" }) {
  if (mode === "list") {
    return (
      <article className="listing-card">
        <img src={room.image} alt={room.name} />
        <div className="listing-main">
          <h3>{room.name}</h3>
          <p className="rating-line">
            {"★".repeat(room.rating)} <span>{room.rating}.5 ({room.reviews} Reviews)</span>
          </p>
          <p className="address-line">{room.address}</p>
          <p className="listing-description">{room.description}</p>
          <Link className="small-button" to="/room-details">
            Select
          </Link>
        </div>
        <div className="listing-price">
          <span>{room.meta}</span>
          <strong>{room.price}</strong>
          <small>Total incl</small>
        </div>
      </article>
    );
  }

  return (
    <article className="room-grid-card">
      <Link className="room-card-link" to="/room-details">
        <img src={room.image} alt={room.name} />
        <h3>{room.name}</h3>
        <p className="room-price">{room.price}</p>
        <p className="room-address">{room.address}</p>
      </Link>
    </article>
  );
}

export default RoomCard;
