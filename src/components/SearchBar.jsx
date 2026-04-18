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
        <span className="search-label">Room / Candidates</span>
        <strong>1 Room | 2 Candidates</strong>
      </div>
      <button type="button" className="search-button" disabled>
        {compact ? "Search Disabled" : "Booking Disabled"}
      </button>
    </div>
  );
}

export default SearchBar;
