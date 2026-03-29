import { Link } from "react-router-dom";

function SearchBar({ compact = false }) {
  return (
    <div className={`search-bar ${compact ? "compact" : ""}`}>
      <div className="search-item">
        <span className="search-label">Academy / Office</span>
        <strong>Chhatrapati Sambhajinagar</strong>
      </div>
      <div className="search-item">
        <span className="search-label">From</span>
        <strong>03 Apr 2026</strong>
      </div>
      <div className="search-item">
        <span className="search-label">To</span>
        <strong>07 Apr 2026</strong>
      </div>
      <div className="search-item">
        <span className="search-label">Room / Employee</span>
        <strong>1 Room | 1 Employee</strong>
      </div>
      <Link className="search-button" to="/explore">
        {compact ? "Search Again" : "Book Now"}
      </Link>
    </div>
  );
}

export default SearchBar;
