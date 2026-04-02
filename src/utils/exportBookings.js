function escapeCsv(value) {
  const stringValue = value == null ? "" : String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function normalizeDate(value) {
  const stringValue = String(value || "").trim();

  if (!stringValue) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    const [year, month, day] = stringValue.split("-");
    return `${day}-${month}-${year}`;
  }

  return stringValue;
}

function splitCombinedField(value) {
  return String(value || "")
    .split("/")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCandidateList(booking) {
  const primary = String(booking.employeeName || "").trim();
  const secondary = String(booking.secondaryEmployeeName || "").trim();

  if (!primary && !secondary) {
    return [];
  }

  if (!secondary) {
    return primary
      .split("&")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (primary.includes("&") || primary.includes(secondary)) {
    return primary
      .split("&")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [primary, secondary].filter(Boolean);
}

function splitContacts(contactValue) {
  return String(contactValue || "")
    .split("||")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((entry) => {
      const [, detailPart = ""] = entry.split(":");
      return detailPart.trim().replace(/\s*\|\s*/g, " | ");
    });
}

function formatRoomValue(booking, roomValue) {
  const roomNumber = String(roomValue || "").trim();

  if (!roomNumber || roomNumber === "-") {
    return "-";
  }

  const candidates = getCandidateList(booking);
  const candidateLabel = candidates.length > 0 ? candidates.join(" & ") : "Assigned candidates";

  return `${roomNumber} (1 room for ${candidateLabel})`;
}

function formatStatus(booking) {
  const baseStatus = String(booking.status || "").trim() || "Allotted";
  const isSharedRoom =
    Number(booking.candidateCount || 0) > 1 || String(booking.occupancy || "").includes("2 Candidates");

  return isSharedRoom ? `${baseStatus} - Shared Room` : baseStatus;
}

export function downloadBookingsCsv(bookings, fileName = "bookings-export.csv") {
  const titleRows = [["Land Records Training Academy, Chhatrapati Sambhajinagar"], []];

  const headers = [
    "Sr. No.",
    "Employee Name 1",
    "Employee Name 2",
    "Designation",
    "Office",
    "Administrative work other than training",
    "Type of Administrative Work",
    "From",
    "To",
    "Employee 1 Number & email address",
    "Employee 2 Number & email address",
    "Women's Hostel Room No.",
    "Men's Hostel Room No.",
    "Room Allotment Date",
    "Room Handover Date",
    "Room Charges Amount",
    "Remarks",
    "Status"
  ];

  const rows = bookings.map((booking) => {
    const candidates = getCandidateList(booking);
    const designations = splitCombinedField(booking.designation);
    const offices = splitCombinedField(booking.office);
    const contacts = splitContacts(booking.contact);

    return [
      booking.srNo || "",
      candidates[0] || "",
      candidates[1] || "",
      designations.join(" / "),
      offices.join(" / "),
      booking.adminWork || "",
      booking.workType || "",
      normalizeDate(booking.checkIn),
      normalizeDate(booking.checkOut),
      contacts[0] || "",
      contacts[1] || "",
      formatRoomValue(booking, booking.womenRoom),
      formatRoomValue(booking, booking.menRoom),
      normalizeDate(booking.allotmentDate),
      normalizeDate(booking.handoverDate),
      booking.price || "",
      booking.remarks || "",
      formatStatus(booking)
    ];
  });

  const csvContent = [...titleRows, headers, ...rows]
    .map((row) => row.map((value) => escapeCsv(value)).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
