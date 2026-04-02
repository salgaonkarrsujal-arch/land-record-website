import { onValue, ref } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hostelLayoutsByWing, hostelOptions, normalizeHostelRoom } from "../data/hostelLayout";
import { database, isFirebaseConfigured } from "../lib/firebase";

function getCandidateNames(booking) {
  if (Array.isArray(booking.candidateNames) && booking.candidateNames.length > 0) {
    return booking.candidateNames.filter(Boolean);
  }

  if (booking.secondaryEmployeeName) {
    return [booking.employeeName, booking.secondaryEmployeeName].filter(Boolean);
  }

  return String(booking.employeeName || "")
    .split("&")
    .map((value) => value.trim())
    .filter(Boolean);
}

function getCandidateContacts(booking) {
  return String(booking.contact || "")
    .split("||")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [namePart, detailsPart = ""] = entry.split(":");
      const [phone = "-", email = "-"] = detailsPart.split("|").map((value) => value.trim());

      return {
        name: namePart?.trim() || "Candidate",
        phone: phone || "-",
        email: email || "-",
      };
    });
}

function RoomOccupancyPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(hostelOptions[0].bookingValue);
  const [selectedRoom, setSelectedRoom] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured || !database) {
      setRecords([]);
      return undefined;
    }

    const bookingsRef = ref(database, "bookings");
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const value = snapshot.exists() ? snapshot.val() : {};
      const docs = Object.entries(value).map(([id, item]) => ({ id, ...item }));
      setRecords(docs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setSelectedRoom("");
  }, [selectedHostel]);

  const activeFloorPlans = hostelLayoutsByWing[selectedHostel] || [];

  const occupancyMap = useMemo(() => {
    const map = new Map();

    records.forEach((item) => {
      const rawRoom = selectedHostel === "Women's Hostel" ? item.womenRoom : item.menRoom;
      const normalizedRoom = normalizeHostelRoom(rawRoom, selectedHostel);

      if (normalizedRoom) {
        map.set(normalizedRoom, item);
      }
    });

    return map;
  }, [records, selectedHostel]);

  const selectedBooking = selectedRoom ? occupancyMap.get(selectedRoom) : null;
  const selectedHostelLabel = hostelOptions.find((option) => option.bookingValue === selectedHostel)?.label || selectedHostel;
  const selectedCandidateNames = useMemo(
    () => (selectedBooking ? getCandidateNames(selectedBooking) : []),
    [selectedBooking]
  );
  const selectedCandidateContacts = useMemo(
    () => (selectedBooking ? getCandidateContacts(selectedBooking) : []),
    [selectedBooking]
  );

  const handleBookRoom = () => {
    if (!selectedRoom) {
      return;
    }

    const params = new URLSearchParams({
      wing: selectedHostel,
      room: selectedRoom
    });
    navigate(`/create-booking?${params.toString()}`);
  };

  const renderPlanCell = (item, floorLabel) => {
    if (item.type === "room") {
      const occupied = occupancyMap.has(item.room);
      const selected = selectedRoom === item.room;
      return (
        <button
          type="button"
          key={`${floorLabel}-${item.room}`}
          className={`plan-cell room ${occupied ? "occupied" : "available"} ${selected ? "selected" : ""}`}
          onClick={() => setSelectedRoom(item.room)}
          title={`Room ${item.room}`}
        >
          <span className="room-name">Room {item.room}</span>
          <span className="room-status">{occupied ? "Booked" : "Available"}</span>
        </button>
      );
    }

    if (item.type === "empty") {
      return <div key={`${floorLabel}-empty-${item.label || "gap"}`} className="plan-cell empty" aria-hidden="true" />;
    }

    const labelText = String(item.label || "");
    const normalizedLabel = String(item.serviceType || labelText).toLowerCase();
    const serviceClassName = [
      "plan-cell",
      "service",
      normalizedLabel.includes("store") ? "store-room" : "",
      normalizedLabel.includes("stairs") ? "stairs" : "",
      normalizedLabel.includes("terrace") ? "terrace" : "",
      normalizedLabel.includes("reception") ? "reception" : "",
      normalizedLabel.includes("canteen") ? "canteen" : "",
      normalizedLabel.includes("bhandar") ? "bhandar-room" : "",
      normalizedLabel.includes("strong") ? "strong-room" : "",
      normalizedLabel.includes("toilet") ? "toilet" : ""
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        key={`${floorLabel}-${item.label}`}
        className={serviceClassName}
        style={item.span ? { gridColumn: `span ${item.span}` } : undefined}
      >
        {item.hideLabel ? "" : labelText}
      </div>
    );
  };

  const serviceCell = (serviceType, key, label = "", extra = {}) =>
    renderPlanCell({ type: "service", label, serviceType, ...extra }, key);

  const renderMensFloorPlan = (floor) => {
    if (floor.id === "third-floor") {
      return (
        <section className="floor-plan-card third-floor-card" key={floor.id}>
          <div className="floor-plan-third-shell">
            <div className="third-floor-main">
              <div className="floor-plan-third-top">
                {renderPlanCell({ type: "room", room: "32" }, `${floor.id}-top-32`)}
                {renderPlanCell({ type: "service", label: "Store Room" }, `${floor.id}-top-store`)}
                {renderPlanCell({ type: "room", room: "33" }, `${floor.id}-top-33`)}
                {renderPlanCell({ type: "room", room: "34" }, `${floor.id}-top-34`)}
                {renderPlanCell({ type: "room", room: "35" }, `${floor.id}-top-35`)}
                {renderPlanCell({ type: "room", room: "36" }, `${floor.id}-top-36`)}
              </div>

              <div className="floor-plan-corridor third-floor-corridor">{floor.label}</div>

              <div className="floor-plan-third-bottom">
                {renderPlanCell({ type: "room", room: "42" }, `${floor.id}-bottom-42`)}
                {renderPlanCell({ type: "room", room: "41" }, `${floor.id}-bottom-41`)}
                {renderPlanCell({ type: "service", label: "Stairs" }, `${floor.id}-bottom-stairs`)}
                {renderPlanCell({ type: "room", room: "40" }, `${floor.id}-bottom-40`)}
                {renderPlanCell({ type: "room", room: "39" }, `${floor.id}-bottom-39`)}
                {renderPlanCell({ type: "room", room: "38" }, `${floor.id}-bottom-38`)}
                {renderPlanCell({ type: "room", room: "37" }, `${floor.id}-bottom-37`)}
              </div>
            </div>

            {renderPlanCell({ type: "service", label: "Terrace" }, `${floor.id}-terrace`)}
          </div>
        </section>
      );
    }

    if (floor.id === "ground-floor") {
      return (
        <section className="floor-plan-card ground-floor-card" key={floor.id}>
          <div className="floor-plan-ground-shell">
            <div className="ground-canteen-wrap">
              {renderPlanCell({ type: "service", label: "Canteen", span: 2 }, `${floor.id}-canteen`)}
            </div>

            <div className="ground-right-wrap">
              <div className="floor-plan-ground-top">
                {renderPlanCell({ type: "room", room: "01" }, `${floor.id}-top-01`)}
                {renderPlanCell({ type: "room", room: "02" }, `${floor.id}-top-02`)}
                {renderPlanCell({ type: "room", room: "03" }, `${floor.id}-top-03`)}
                {renderPlanCell({ type: "room", room: "04" }, `${floor.id}-top-04`)}
              </div>

              <div className="floor-plan-corridor ground-floor-corridor">{floor.label}</div>

              <div className="floor-plan-ground-bottom">
                {renderPlanCell({ type: "service", label: "Stairs" }, `${floor.id}-bottom-stairs`)}
                {renderPlanCell({ type: "service", label: "Reception" }, `${floor.id}-bottom-reception`)}
                {renderPlanCell({ type: "room", room: "07" }, `${floor.id}-bottom-07`)}
                {renderPlanCell({ type: "room", room: "05" }, `${floor.id}-bottom-05`)}
              </div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="floor-plan-card" key={floor.id}>
        <div className="floor-plan-rooms" style={{ gridTemplateColumns: `repeat(${floor.columns}, minmax(0, 1fr))` }}>
          {floor.top.map((item) => renderPlanCell(item, `${floor.id}-top`))}
        </div>

        <div className="floor-plan-corridor">{floor.label}</div>

        <div className="floor-plan-rooms" style={{ gridTemplateColumns: `repeat(${floor.columns}, minmax(0, 1fr))` }}>
          {floor.bottom.map((item) => renderPlanCell(item, `${floor.id}-bottom`))}
        </div>
      </section>
    );
  };

  const getWomensFloorPrefix = (floorId) => {
    if (floorId === "fourth-floor") return "4";
    if (floorId === "third-floor") return "3";
    if (floorId === "second-floor") return "2";
    if (floorId === "first-floor") return "1";
    return "";
  };

  const renderWomensFloorPlan = (floor) => {
    if (floor.id === "ground-floor") {
      return (
        <section className="floor-plan-card women-ground-floor-card" key={floor.id}>
          <div className="women-ground-plan">
            <div className="women-ground-top-strip">
              {serviceCell("stairs", `${floor.id}-stairs-top`, "Stairs")}
            </div>

            <div className="women-ground-bhandar">
              {renderPlanCell({ type: "service", label: "Bhandar Room" }, `${floor.id}-bhandar`)}
            </div>

            <div className="floor-plan-corridor women-ground-corridor">{floor.label}</div>

            <div className="women-ground-left-mini-row">
              {renderPlanCell({ type: "service", label: "Store Room" }, `${floor.id}-store`)}
              {renderPlanCell({ type: "service", label: "Toilet" }, `${floor.id}-toilet-left`)}
            </div>

            <div className="women-ground-bottom-stairs-row">
              {serviceCell("stairs", `${floor.id}-stairs-bottom`, "Stairs")}
            </div>

            <div className="women-ground-right-mini-row">
              {renderPlanCell({ type: "service", label: "Strong Room" }, `${floor.id}-strong`)}
              {renderPlanCell({ type: "service", label: "Toilet" }, `${floor.id}-toilet-right-1`)}
              {renderPlanCell({ type: "service", label: "Toilet" }, `${floor.id}-toilet-right-2`)}
            </div>
          </div>
        </section>
      );
    }

    const prefix = getWomensFloorPrefix(floor.id);
    return (
      <section className="floor-plan-card women-floor-card" key={floor.id}>
        <div className="women-upper-grid">
          <div className="women-floor-top">
            {serviceCell("stairs-side", `${floor.id}-left-stairs`, "Stairs")}
            {renderPlanCell({ type: "room", room: `${prefix}02` }, `${floor.id}-top-02`)}
            {renderPlanCell({ type: "room", room: `${prefix}01` }, `${floor.id}-top-01`)}
            {renderPlanCell({ type: "room", room: `${prefix}05` }, `${floor.id}-top-05`)}
            {renderPlanCell({ type: "room", room: `${prefix}06` }, `${floor.id}-top-06`)}
          </div>

          <div className="floor-plan-corridor women-floor-corridor">{floor.label}</div>

          <div className="women-floor-bottom">
            {renderPlanCell({ type: "room", room: `${prefix}03` }, `${floor.id}-bottom-03`)}
            {renderPlanCell({ type: "room", room: `${prefix}04` }, `${floor.id}-bottom-04`)}
            {serviceCell("stairs-center", `${floor.id}-bottom-stairs`, "Stairs")}
            {renderPlanCell({ type: "room", room: `${prefix}08` }, `${floor.id}-bottom-08`)}
            {renderPlanCell({ type: "room", room: `${prefix}07` }, `${floor.id}-bottom-07`)}
          </div>
        </div>
      </section>
    );
  };

  return (
    <section className="content-section container">
      <div className="section-title">
        <h2>Room Allocation</h2>
        <span />
      </div>

      <article className="occupancy-card">
        <div className="occupancy-legend">
          <span>
            <i className="legend-box available" />
            Available
          </span>
          <span>
            <i className="legend-box selected" />
            Selected
          </span>
          <span>
            <i className="legend-box occupied" />
            Occupied
          </span>
        </div>

        <div className="hostel-switcher" role="tablist" aria-label="Hostel selection">
          {hostelOptions.map((option) => (
            <button
              type="button"
              key={option.key}
              className={`hostel-switcher-tab ${selectedHostel === option.bookingValue ? "active" : ""}`}
              onClick={() => setSelectedHostel(option.bookingValue)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className={`occupancy-layout ${selectedRoom ? "room-selected" : "no-room-selected"}`}>
          <div className="hostel-structure-card">
            <div className="hostel-name-banner">{selectedHostelLabel}</div>

            <div className="floor-plan-stack">
              {activeFloorPlans.map((floor) =>
                selectedHostel === "Women's Hostel" ? renderWomensFloorPlan(floor) : renderMensFloorPlan(floor)
              )}
            </div>
          </div>

          {selectedRoom ? (
            <aside className="room-inspector-card">
              {selectedBooking ? (
              <>
                <span className="inspector-kicker booked">Booked Room</span>
                <h3>
                  Room {selectedRoom} · {selectedHostelLabel}
                </h3>
                <div className="inspector-candidates">
                  {(selectedCandidateNames.length > 0 ? selectedCandidateNames : [selectedBooking.employeeName || "-"]).map(
                    (candidateName, index) => {
                      const candidateContact = selectedCandidateContacts[index];
                      return (
                        <div className="inspector-candidate-card" key={`${candidateName}-${index}`}>
                          <span>Candidate {index + 1}</span>
                          <strong>{candidateName}</strong>
                          <small>{candidateContact?.phone || "-"}</small>
                          <small>{candidateContact?.email || "-"}</small>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="inspector-grid">
                  <div>
                    <span>Office</span>
                    <strong>{selectedBooking.office || "-"}</strong>
                  </div>
                  <div>
                    <span>Stay Type</span>
                    <strong>{selectedBooking.workType || selectedBooking.services || "-"}</strong>
                  </div>
                  <div>
                    <span>Check-in</span>
                    <strong>{selectedBooking.checkIn || selectedBooking.allotmentDate || "-"}</strong>
                  </div>
                  <div>
                    <span>Check-out</span>
                    <strong>{selectedBooking.checkOut || selectedBooking.handoverDate || "-"}</strong>
                  </div>
                </div>
                <p className="inspector-note">This room is already allotted. Pick another room to create a new booking.</p>
              </>
              ) : (
              <>
                <span className="inspector-kicker available">Available Room</span>
                <h3>
                  Room {selectedRoom} · {selectedHostelLabel}
                </h3>
                <p>This room is free right now. You can open the booking form and allot this exact room directly.</p>
                <button type="button" className="confirm-button inspector-button" onClick={handleBookRoom}>
                  Book Room {selectedRoom}
                </button>
              </>
              )}
            </aside>
          ) : null}
        </div>
      </article>
    </section>
  );
}

export default RoomOccupancyPage;
