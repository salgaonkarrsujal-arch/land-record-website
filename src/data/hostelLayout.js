export const hostelOptions = [
  { key: "mens", label: "Men's Hostel", bookingValue: "Men's Hostel" },
  { key: "womens", label: "Women's Hostel", bookingValue: "Women's Hostel" }
];

export const mensHostelFloorPlans = [
  {
    id: "third-floor",
    label: "Third Floor",
    columns: 7,
    top: [
      { type: "room", room: "32" },
      { type: "service", label: "Store Room" },
      { type: "room", room: "33" },
      { type: "room", room: "34" },
      { type: "room", room: "35" },
      { type: "room", room: "36" },
      { type: "service", label: "Stairs" }
    ],
    bottom: [
      { type: "room", room: "42" },
      { type: "room", room: "41" },
      { type: "service", label: "Stairs" },
      { type: "room", room: "40" },
      { type: "room", room: "39" },
      { type: "room", room: "38" },
      { type: "room", room: "37" }
    ]
  },
  {
    id: "second-floor",
    label: "Second Floor",
    columns: 7,
    top: [
      { type: "room", room: "20" },
      { type: "room", room: "21" },
      { type: "service", label: "Store Room" },
      { type: "room", room: "22" },
      { type: "room", room: "23" },
      { type: "room", room: "24" },
      { type: "room", room: "25" }
    ],
    bottom: [
      { type: "room", room: "31" },
      { type: "room", room: "30" },
      { type: "service", label: "Stairs" },
      { type: "room", room: "29" },
      { type: "room", room: "28" },
      { type: "room", room: "27" },
      { type: "room", room: "26" }
    ]
  },
  {
    id: "first-floor",
    label: "First Floor",
    columns: 7,
    top: [
      { type: "room", room: "08" },
      { type: "room", room: "09" },
      { type: "service", label: "Store Room" },
      { type: "room", room: "10" },
      { type: "room", room: "11" },
      { type: "room", room: "12" },
      { type: "room", room: "13" }
    ],
    bottom: [
      { type: "room", room: "19" },
      { type: "room", room: "18" },
      { type: "service", label: "Stairs" },
      { type: "room", room: "17" },
      { type: "room", room: "16" },
      { type: "room", room: "15" },
      { type: "room", room: "14" }
    ]
  },
  {
    id: "ground-floor",
    label: "Ground Floor",
    columns: 6,
    top: [
      { type: "service", label: "Canteen", span: 2 },
      { type: "room", room: "01" },
      { type: "room", room: "02" },
      { type: "room", room: "03" },
      { type: "room", room: "04" }
    ],
    bottom: [
      { type: "service", label: "Reception", span: 2 },
      { type: "service", label: "Stairs" },
      { type: "room", room: "07" },
      { type: "room", room: "05" },
      { type: "empty", label: "" }
    ]
  }
];

export const womensHostelFloorPlans = [
  { id: "fourth-floor", label: "Fourth Floor" },
  { id: "third-floor", label: "Third Floor" },
  { id: "second-floor", label: "Second Floor" },
  { id: "first-floor", label: "First Floor" },
  { id: "ground-floor", label: "Ground Floor" }
];

export const hostelLayoutsByWing = {
  "Men's Hostel": mensHostelFloorPlans,
  "Women's Hostel": womensHostelFloorPlans
};

export const mensHostelRoomNumbers = mensHostelFloorPlans.flatMap((floor) =>
  [...floor.top, ...floor.bottom]
    .filter((item) => item.type === "room")
    .map((item) => item.room)
);

export const womensHostelRoomNumbers = [
  "101",
  "102",
  "103",
  "104",
  "105",
  "106",
  "107",
  "108",
  "201",
  "202",
  "203",
  "204",
  "205",
  "206",
  "207",
  "208",
  "301",
  "302",
  "303",
  "304",
  "305",
  "306",
  "307",
  "308",
  "401",
  "402",
  "403",
  "404",
  "405",
  "406",
  "407",
  "408"
];

export const hostelRoomNumbersByWing = {
  "Men's Hostel": mensHostelRoomNumbers,
  "Women's Hostel": womensHostelRoomNumbers
};

export function normalizeHostelRoom(roomValue, hostelWing = "") {
  const raw = String(roomValue || "").trim();
  if (!raw || raw === "-" || /pending/i.test(raw)) {
    return "";
  }

  const numericOnly = raw.replace(/[^\d]/g, "");
  if (hostelWing === "Women's Hostel") {
    if (numericOnly.length >= 3) {
      return numericOnly.slice(-3);
    }
    if (numericOnly.length > 0) {
      return numericOnly.padStart(3, "0");
    }
  } else {
    if (numericOnly.length >= 2) {
      return numericOnly.slice(-2);
    }
    if (numericOnly.length > 0) {
      return numericOnly.padStart(2, "0");
    }
  }

  return raw;
}
