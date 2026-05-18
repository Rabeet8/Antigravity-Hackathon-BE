const bookings = [
  {
    booking_id: "KK-20240510-001",
    service: "Electrician",
    provider_id: "PRV-004",
    provider_name: "Hamid Electric",
    date: "2024-05-10",
    time: "10:00 AM",
    location: "F-7, Islamabad",
    status: "Completed",
    reminder_sent: true
  },
  {
    booking_id: "KK-20240428-002",
    service: "Plumber",
    provider_id: "PRV-005",
    provider_name: "Khan Plumbing",
    date: "2024-04-28",
    time: "09:00 AM",
    location: "G-9, Islamabad",
    status: "Completed",
    reminder_sent: true
  },
  {
    booking_id: "KK-20240520-003",
    service: "Painter",
    provider_id: "PRV-006",
    provider_name: "Usman Painters",
    date: "2024-05-20",
    time: "08:00 AM",
    location: "E-11, Islamabad",
    status: "Upcoming",
    reminder_sent: false
  }
];

module.exports = bookings;
