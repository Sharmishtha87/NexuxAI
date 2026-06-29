async function getUnstopEvents(req, res) {
  try {
    const url = "https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons";
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const responseData = await response.json();
    const eventsData = responseData?.data?.data || [];
    
    // Map data to a simpler format for our frontend calendar
    const formattedEvents = eventsData.map(event => ({
      id: event.id,
      title: event.title,
      organization: event.organisation?.name || "Unknown",
      logo: event.logoUrl2,
      url: `https://unstop.com/${event.public_url}`,
      startDate: event.regnRequirements?.start_regn_dt || event.approved_date,
      endDate: event.regnRequirements?.end_regn_dt || event.end_date,
      status: event.status
    }));

    res.json(formattedEvents);
  } catch (err) {
    console.error("Error fetching Unstop events:", err.message);
    res.status(500).json({ error: "Failed to fetch events from Unstop" });
  }
}

module.exports = {
  getUnstopEvents
};
