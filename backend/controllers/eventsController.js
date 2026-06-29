// Helper to generate mock Devpost events across 2026
const generateDevpostMocks = () => {
  const events = [];
  const startYear = 2026;
  const topics = ["AI & ML", "Web3", "Blockchain", "Healthcare", "FinTech", "Open Source", "Gaming", "EduTech"];
  
  for (let month = 0; month < 12; month++) {
    // Generate 2-3 hackathons per month
    const count = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < count; i++) {
      const startDay = Math.floor(Math.random() * 20) + 1;
      const duration = Math.floor(Math.random() * 4) + 2;
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const startDate = new Date(startYear, month, startDay);
      const endDate = new Date(startYear, month, startDay + duration);
      
      events.push({
        id: `devpost-${month}-${i}`,
        title: `Global ${topic} Hackathon ${startYear}`,
        platform: "Devpost",
        organization: "Devpost Community",
        logo: "https://devpost.com/apple-touch-icon.png",
        url: "https://devpost.com/hackathons",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "UPCOMING"
      });
    }
  }
  return events;
};

async function getAllEvents(req, res) {
  try {
    const [unstopRes, heRes] = await Promise.allSettled([
      fetch("https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=100", {
        headers: { "User-Agent": "Mozilla/5.0" }
      }).then(r => r.json()),
      fetch("https://www.hackerearth.com/chrome-extension/events/").then(r => r.json())
    ]);

    let allEvents = [];

    // Parse Unstop Events
    if (unstopRes.status === "fulfilled" && unstopRes.value?.data?.data) {
      const unstopEvents = unstopRes.value.data.data.map(event => ({
        id: `unstop-${event.id}`,
        title: event.title,
        platform: "Unstop",
        organization: event.organisation?.name || "Unknown",
        logo: event.logoUrl2,
        url: `https://unstop.com/${event.public_url}`,
        startDate: event.regnRequirements?.start_regn_dt || event.approved_date,
        endDate: event.regnRequirements?.end_regn_dt || event.end_date,
        status: event.status
      }));
      allEvents = [...allEvents, ...unstopEvents];
    }

    // Parse HackerEarth Events
    if (heRes.status === "fulfilled" && heRes.value?.response) {
      const heEvents = heRes.value.response.map((event, index) => ({
        id: `he-${index}`,
        title: event.title,
        platform: "HackerEarth",
        organization: "HackerEarth",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/HackerEarth_logo.png",
        url: event.url,
        startDate: event.start_tz,
        endDate: event.end_tz,
        status: event.status
      }));
      allEvents = [...allEvents, ...heEvents];
    }

    // Inject Devpost Mocks
    const devpostEvents = generateDevpostMocks();
    allEvents = [...allEvents, ...devpostEvents];

    // Sort by start date
    allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.json(allEvents);
  } catch (err) {
    console.error("Error fetching aggregated events:", err.message);
    res.status(500).json({ error: "Failed to fetch events from platforms" });
  }
}

module.exports = {
  getAllEvents
};
