import { useState } from "react";

function BookingCard({ booking, onDelete, deleting = false, allowDelete = true }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="booking-card">
      <div className="booking-list-main">
        <div className="booking-line booking-line-top">
          <strong>{booking.employeeName}</strong>
          <span className="service-badge">{booking.services}</span>
          <span className="booking-serial-chip">Sr. {booking.srNo}</span>
        </div>
        <div className="booking-line">
          <span>
            {booking.office} | {booking.designation}
          </span>
        </div>
        <div className="booking-line">
          <span>
            {booking.checkIn} to {booking.checkOut} | Ref: {booking.meta}
          </span>
        </div>
      </div>
      <div className="booking-list-actions">
        <button type="button" className="small-button" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show Less" : "Show More"}
        </button>
        {allowDelete ? (
          <button
            type="button"
            className="small-button danger"
            onClick={() => onDelete?.(booking)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        ) : null}
      </div>

      {expanded ? (
        <section className="booking-section-card booking-expanded-section">
          <div className="booking-meta-grid">
            <div>
              <span>Contact</span>
              <strong>{booking.contact}</strong>
            </div>
            <div>
              <span>Admin Work</span>
              <strong>{booking.adminWork}</strong>
            </div>
            <div>
              <span>Work Type</span>
              <strong>{booking.workType}</strong>
            </div>
            <div>
              <span>Women's Room</span>
              <strong>{booking.womenRoom}</strong>
            </div>
            <div>
              <span>Men's Room</span>
              <strong>{booking.menRoom}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>
                Allotment: {booking.allotmentDate} | Handover: {booking.handoverDate}
              </strong>
            </div>
            <div className="full-span">
              <span>Remarks</span>
              <strong>{booking.remarks}</strong>
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}

export default BookingCard;
