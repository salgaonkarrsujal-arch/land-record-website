export const navLinks = [
  { label: "Home", to: "/" },
  { label: "Room Details", to: "/room-details" },
  { label: "Allotments", to: "/bookings" },
  { label: "Explore", to: "/explore" }
];

export const overviewCards = [
  {
    title: "Academy Stay Overview",
    description: "Centralised room booking for training programmes, inspections, and administrative work at the academy campus."
  },
  {
    title: "Separate Hostel Allocation",
    description: "Women's and Men's hostel rooms are tracked independently with clear room allotment and handover dates."
  },
  {
    title: "Structured Register Flow",
    description: "Employee details, office, room charges, and remarks are maintained in a clean booking and allotment workflow."
  }
];

export const detailSummary = {
  title: "Executive Hostel and Allotment Block",
  subtitle: "Premium academy accommodation for officers, trainees, and administrative visitors",
  badges: ["Women's & Men's Hostel", "Reception Support", "Campus Dining", "Secure Stay"],
  note:
    "Booking is confirmed only after a room is selected. The confirm booking form is part of the room selection flow, not the main navigation."
};

export const detailFacts = [
  { label: "Stay Type", value: "Training and administrative accommodation" },
  { label: "Allocation", value: "Separate Women's and Men's hostel rooms" },
  { label: "Check-in Support", value: "Reception desk and room handover process" },
  { label: "Charges", value: "Room charges recorded during allotment" }
];

export const detailPolicies = [
  "Employee name, designation, office, and contact details are required before confirmation.",
  "Room allotment and room handover dates are recorded for every confirmed stay.",
  "Administrative work other than training must include the type of work in the booking form.",
  "Remarks are used for early arrival, special coordination, and hostel desk notes."
];

export const heroSearchFields = [
  { label: "Academy / Office", value: "Chhatrapati Sambhajinagar" },
  { label: "From", value: "03 Apr 2026" },
  { label: "To", value: "07 Apr 2026" },
  { label: "Room / Employee", value: "1 Room | 1 Employee" }
];

export const topRatedRooms = [
  {
    id: "block-a-suite",
    name: "Women's Hostel Block A",
    price: "₹2200 / 4 nights",
    address: "Training Academy Campus, East Wing",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "block-b-deluxe",
    name: "Men's Hostel Block B",
    price: "₹2100 / 4 nights",
    address: "Training Academy Campus, North Wing",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "admin-suite",
    name: "Administrative Guest Suite",
    price: "₹3200 / 4 nights",
    address: "Administrative Residence Block",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "training-standard",
    name: "Training Officers Residence",
    price: "₹2400 / 4 nights",
    address: "Central Courtyard Building",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "executive-hostel",
    name: "Executive Stay Floor",
    price: "₹3600 / 4 nights",
    address: "Academy Main House",
    image:
      "https://images.unsplash.com/photo-1521783988139-89397d761dce?auto=format&fit=crop&w=800&q=80"
  }
];

export const categoryRooms = [
  {
    id: "women-premium",
    name: "Women's Premium Stay",
    price: "₹2400 / 4 nights",
    address: "Women's Hostel, Premium Floor",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "men-premium",
    name: "Men's Premium Stay",
    price: "₹2400 / 4 nights",
    address: "Men's Hostel, Premium Floor",
    image:
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "inspection-suite",
    name: "Inspection Visit Suite",
    price: "₹4200 / 4 nights",
    address: "Guest Residence Wing",
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "seminar-stay",
    name: "Seminar Guest Room",
    price: "₹2800 / 4 nights",
    address: "Conference Block",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "admin-duplex",
    name: "Administrative Duplex",
    price: "₹5200 / 4 nights",
    address: "Administrative Residence",
    image:
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80"
  }
];

export const listingFilters = {
  search: "Land Records Training Academy",
  priceRanges: [
    { label: "₹1500 - ₹2500", count: 12 },
    { label: "₹2500 - ₹3500", count: 15 },
    { label: "₹3500 - ₹5000", count: 9 },
    { label: "₹5000 - ₹7000", count: 5 }
  ],
  ratings: [
    { label: "Women's Hostel", count: 14 },
    { label: "Men's Hostel", count: 19 },
    { label: "Administrative Stay", count: 8 },
    { label: "Training Stay", count: 13 }
  ]
};

export const listingResults = [
  {
    id: "womens-premium-suite",
    name: "Women's Hostel Premium Suite",
    rating: 5,
    reviews: 208,
    address: "Land Records Training Academy, Women's Wing",
    description: "Curated stay experience with secure access, academy dining, and quiet study support.",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    price: "₹2,024",
    meta: "Women's hostel | 1 employee"
  },
  {
    id: "mens-deluxe-room",
    name: "Men's Hostel Deluxe Room",
    rating: 4,
    reviews: 154,
    address: "Land Records Training Academy, Men's Wing",
    description: "Comfortable stay option for officers and trainees with campus access and reception support.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    price: "₹2,024",
    meta: "Men's hostel | 1 employee"
  },
  {
    id: "hotel-emma-style",
    name: "Administrative Review Suite",
    rating: 4,
    reviews: 178,
    address: "Academy Administrative Residence",
    description: "Designed for inspection visits, audit stays, and official overnight bookings.",
    image:
      "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80",
    price: "₹2,024",
    meta: "Administrative stay"
  },
  {
    id: "last-creek-style",
    name: "Officer Guest Residence",
    rating: 5,
    reviews: 198,
    address: "Academy Main House",
    description: "Premium guest room with comfortable furnishings, smooth check-in, and academy transport access.",
    image:
      "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=800&q=80",
    price: "₹2,024",
    meta: "Training allotment"
  },
  {
    id: "azul-style",
    name: "Seminar Residence Block",
    rating: 4,
    reviews: 163,
    address: "Conference and Seminar Complex",
    description: "Built for workshop participants and department guests attending multi-day sessions.",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    price: "₹2,024",
    meta: "Administrative stay"
  },
  {
    id: "belvedere-style",
    name: "Executive Inspection Floor",
    rating: 4,
    reviews: 144,
    address: "Executive Residence Level",
    description: "Reserved accommodation for senior officials, auditors, and academy leadership visits.",
    image:
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80",
    price: "₹2,024",
    meta: "Officer allotment"
  }
];

export const detailGallery = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
];

export const roomHighlights = [
  "Separate room allocation for women's and men's hostels",
  "Supports training visits and administrative work stays",
  "Room allotment date and handover tracking",
  "Structured room charges and remarks recording"
];

export const roomAmenities = [
  "Reception Counter",
  "Women's Hostel Rooms",
  "Men's Hostel Rooms",
  "Room Register Desk",
  "Wi-Fi Access",
  "Dining Hall",
  "Parking Space",
  "Lift",
  "Study Desk",
  "Security Support"
];

export const roomOptions = [
  {
    name: "Women's Hostel Premium Room",
    description:
      "Best suited for women employees and trainees with direct room allotment tracking, handover records, and stay support.",
    availability: "Women's Hostel: 4 rooms available",
    price: "₹2,024",
    meta: "Single occupancy • Training stay",
    features: ["Attached study desk", "Priority near reception", "Quiet floor access"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Administrative Suite",
    description:
      "Reserved for official visits and administrative work other than training, with room charges, remarks, and handover details maintained.",
    availability: "Administrative block: 2 rooms available",
    price: "₹3,184",
    meta: "Priority occupancy • Official stay",
    features: ["Faster handover support", "Extended admin stay use", "Charges entered in register"],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
  }
];

export const bookingSidebar = {
  title: "Land Records Training Academy",
  location: "Chhatrapati Sambhajinagar, Maharashtra",
  details: ["1 employee", "Reception Desk", "Women's / Men's Hostel", "Parking"],
  booking: {
    checkIn: "Thu, 03 Apr, 2026",
    checkOut: "Mon, 07 Apr, 2026",
    roomType: "Administrative Stay Room",
    guests: "1 employee, room allotment prototype"
  },
  pricing: [
    { label: "Room charges amount", value: "₹2,400" },
    { label: "Register and service fee", value: "₹200" },
    { label: "Total", value: "₹2,600", total: true }
  ]
};

export const bookings = [
  {
    srNo: "01",
    employeeName: "Aditi Kulkarni",
    designation: "Training Officer",
    office: "Nashik Division",
    adminWork: "No",
    workType: "Training Programme",
    contact: "+91 98765 11223 | aditi.k@academy.demo",
    womenRoom: "W-104",
    menRoom: "-",
    allotmentDate: "01 Apr 2026",
    handoverDate: "07 Apr 2026",
    remarks: "Confirmed",
    name: "Women's Hostel Premium Suite",
    address: "Land Records Training Academy, Chhatrapati Sambhajinagar",
    services: "Training Stay",
    checkIn: "Thu, 03 Apr, 2026",
    checkOut: "Mon, 07 Apr, 2026",
    price: "₹2,024",
    meta: "Women's hostel | Sr. No. 01",
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
  },
  {
    srNo: "02",
    employeeName: "Rahul Deshmukh",
    designation: "Survey Inspector",
    office: "Aurangabad Regional Office",
    adminWork: "Yes",
    workType: "Administrative Review",
    contact: "+91 99876 22110 | rahul.d@academy.demo",
    womenRoom: "-",
    menRoom: "M-212",
    allotmentDate: "08 Apr 2026",
    handoverDate: "12 Apr 2026",
    remarks: "Late arrival expected",
    name: "Administrative Review Suite",
    address: "Land Records Training Academy, Chhatrapati Sambhajinagar",
    services: "Administrative Stay",
    checkIn: "Thu, 10 Apr, 2026",
    checkOut: "Mon, 12 Apr, 2026",
    price: "₹2,024",
    meta: "Men's hostel | Sr. No. 02",
    image:
      "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=800&q=80"
  },
  {
    srNo: "03",
    employeeName: "Sneha Patil",
    designation: "Assistant Registrar",
    office: "Pune Record Office",
    adminWork: "Yes",
    workType: "Administrative Coordination",
    contact: "+91 97654 33441 | sneha.p@academy.demo",
    womenRoom: "W-118",
    menRoom: "-",
    allotmentDate: "13 Apr 2026",
    handoverDate: "18 Apr 2026",
    remarks: "Requires early check-in",
    name: "Women's Hostel Deluxe Room",
    address: "Land Records Training Academy, Chhatrapati Sambhajinagar",
    services: "Administrative Stay",
    checkIn: "Tue, 14 Apr, 2026",
    checkOut: "Sat, 18 Apr, 2026",
    price: "₹2,024",
    meta: "Women's hostel | Sr. No. 03",
    image:
      "https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=800&q=80"
  },
  {
    srNo: "04",
    employeeName: "Vikas Shinde",
    designation: "Records Officer",
    office: "Latur Division",
    adminWork: "No",
    workType: "Training Session",
    contact: "+91 97555 33662 | vikas.s@academy.demo",
    womenRoom: "-",
    menRoom: "M-208",
    allotmentDate: "20 Apr 2026",
    handoverDate: "24 Apr 2026",
    remarks: "Training batch B",
    name: "Officer Guest Residence",
    address: "Land Records Training Academy, Chhatrapati Sambhajinagar",
    services: "Training Stay",
    checkIn: "Mon, 20 Apr, 2026",
    checkOut: "Fri, 24 Apr, 2026",
    price: "₹2,024",
    meta: "Men's hostel | Sr. No. 04",
    image:
      "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=800&q=80"
  }
];

export const allotmentStats = [
  { label: "Total active allotments", value: "24" },
  { label: "Women's hostel rooms", value: "12 occupied" },
  { label: "Men's hostel rooms", value: "10 occupied" },
  { label: "Administrative stays", value: "6 ongoing" }
];

export const allotmentFilters = [
  "All records",
  "Training stay",
  "Administrative stay",
  "Women's hostel",
  "Men's hostel"
];

export const footerColumns = [
  {
    title: "About Us",
    links: ["Company Overview", "Our Mission & Values", "Careers", "Blog", "Press Releases"]
  },
  {
    title: "Customer Service",
    links: ["Contact Us", "FAQs", "Live Chat", "Cancellation Policy", "Booking Policies"]
  },
  {
    title: "Explore",
    links: ["Destinations", "Special Offers", "Last-Minute Deals", "Travel Guides", "Blog & Travel Tips"]
  },
  {
    title: "Support",
    links: ["Privacy Policy", "Terms & Conditions", "Accessibility", "Feedback & Suggestions", "Sitemap"]
  },
  {
    title: "Membership",
    links: ["Loyalty Program", "Unlock Exclusive Offers", "Rewards & Benefits"]
  }
];
