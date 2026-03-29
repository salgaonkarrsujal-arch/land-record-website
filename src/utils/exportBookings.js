function escapeCsv(value) {
  const stringValue = value == null ? "" : String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function downloadBookingsCsv(bookings, fileName = "bookings-export.csv") {
  const headers = [
    "Sr No",
    "Employee Name",
    "Designation",
    "Office",
    "Admin Work",
    "Type Of Work",
    "From",
    "To",
    "Contact",
    "Women's Hostel Room",
    "Men's Hostel Room",
    "Allotment Date",
    "Handover Date",
    "Price",
    "Remarks",
    "Status"
  ];

  const rows = bookings.map((booking) => [
    booking.srNo,
    booking.employeeName,
    booking.designation,
    booking.office,
    booking.adminWork,
    booking.workType,
    booking.checkIn,
    booking.checkOut,
    booking.contact,
    booking.womenRoom,
    booking.menRoom,
    booking.allotmentDate,
    booking.handoverDate,
    booking.price,
    booking.remarks,
    booking.services
  ]);

  const csvContent = [headers, ...rows]
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
