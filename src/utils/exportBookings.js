function escapeCsv(value) {
  const stringValue = value == null ? "" : String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function downloadBookingsCsv(bookings, fileName = "bookings-export.csv") {
  const titleRows = [
    ["Land Records Training Academy, Chhatrapati Sambhajinagar"],
    []
  ];

  const headers = [
    "Sr. No.",
    "Employee Name",
    "Designation",
    "Office",
    "Administrative work other than training",
    "Type of Administrative Work",
    "From",
    "To",
    "Employee's Number & email address",
    "Women's Hostel Room No.",
    "Men's Hostel Room No.",
    "Room Allotment Date",
    "Room Handover Date",
    "Room Charges Amount",
    "Remarks",
    "Status"
  ];

  const rows = bookings.map((booking) => [
    booking.srNo || "",
    booking.employeeName || "",
    booking.designation || "",
    booking.office || "",
    booking.adminWork || "",
    booking.workType || "",
    booking.checkIn || "",
    booking.checkOut || "",
    booking.contact || "",
    booking.womenRoom || "",
    booking.menRoom || "",
    booking.allotmentDate || "",
    booking.handoverDate || "",
    booking.price || "",
    booking.remarks || "",
    booking.services || ""
  ]);

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
