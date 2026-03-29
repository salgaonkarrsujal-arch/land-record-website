function BookingCard({ booking }) {
  return (
    <article className="booking-card">
      <div className="booking-image-wrap">
        <img src={booking.image} alt={booking.name} />
        <span className="booking-serial-chip">Sr. No. {booking.srNo}</span>
      </div>
      <div className="booking-content">
        <div className="booking-copy">
          <div className="booking-heading">
            <h3>{booking.name}</h3>
            <span className="service-badge">{booking.services}</span>
          </div>
          <p className="address-line">{booking.address}</p>
          <div className="booking-sections">
            <section className="booking-section-card">
              <h4>Employee Details</h4>
              <div className="booking-meta-grid">
                <div>
                  <span>Employee Name</span>
                  <strong>{booking.employeeName}</strong>
                </div>
                <div>
                  <span>Designation</span>
                  <strong>{booking.designation}</strong>
                </div>
                <div>
                  <span>Office</span>
                  <strong>{booking.office}</strong>
                </div>
                <div>
                  <span>Contact</span>
                  <strong>{booking.contact}</strong>
                </div>
              </div>
            </section>

            <section className="booking-section-card">
              <h4>Stay Details</h4>
              <div className="booking-meta-grid">
                <div>
                  <span>Admin Work</span>
                  <strong>{booking.adminWork}</strong>
                </div>
                <div>
                  <span>Type of Work</span>
                  <strong>{booking.workType}</strong>
                </div>
              </div>
              <div className="booking-dates">
                <div>
                  <span>From</span>
                  <strong>{booking.checkIn}</strong>
                  <small>Room allotment period</small>
                </div>
                <div>
                  <span>To</span>
                  <strong>{booking.checkOut}</strong>
                  <small>Room handover period</small>
                </div>
              </div>
            </section>

            <section className="booking-section-card">
              <h4>Allocation Details</h4>
              <div className="booking-dates">
                <div>
                  <span>Women's Hostel Room</span>
                  <strong>{booking.womenRoom}</strong>
                  <small>Allocated room number</small>
                </div>
                <div>
                  <span>Men's Hostel Room</span>
                  <strong>{booking.menRoom}</strong>
                  <small>Allocated room number</small>
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="booking-side">
          <span className="booking-side-label">{booking.meta}</span>
          <strong className="booking-price">{booking.price}</strong>
          <div className="booking-side-panel">
            <small>Allotment: {booking.allotmentDate}</small>
            <small>Handover: {booking.handoverDate}</small>
            <small>Remarks: {booking.remarks}</small>
          </div>
          <button type="button" className="small-button">
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

export default BookingCard;
