import SearchBar from "../components/SearchBar";
import RoomCard from "../components/RoomCard";
import { listingFilters, listingResults } from "../data/siteContent";

function ListingsPage() {
  return (
    <section className="listings-page container">
      <div className="search-again-wrap">
        <SearchBar compact />
      </div>

      <div className="results-layout-page">
        <aside className="filters-panel">
          <div className="filter-card">
            <label className="filter-search-label">Search by academy or office</label>
            <div className="filter-search-box">{listingFilters.search}</div>
          </div>
          <div className="filter-card">
            <h3>Filter results</h3>
            <h4>Price Range</h4>
            {listingFilters.priceRanges.map((range) => (
              <label key={range.label} className="check-row">
                <input type="checkbox" />
                <span>{range.label}</span>
                <small>{range.count}</small>
              </label>
            ))}
          </div>
          <div className="filter-card">
            <h4>Stay Type</h4>
            {listingFilters.ratings.map((rating) => (
              <label key={rating.label} className="check-row">
                <input type="checkbox" />
                <span>{rating.label}</span>
                <small>{rating.count}</small>
              </label>
            ))}
          </div>
        </aside>

        <div className="results-panel">
          <h1>Chhatrapati Sambhajinagar: 1,234 room results found</h1>
          <div className="listing-list">
            {listingResults.map((room) => (
              <RoomCard key={room.id} room={room} mode="list" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ListingsPage;
