import type { ConferenceDataset } from "../types";

export const fallbackDataset: ConferenceDataset = {
  generatedAt: "2026-05-20T00:00:00.000Z",
  generatedBy: "manual-demo-seed",
  notes:
    "Fallback demo records keep the site useful before a search API key is configured. Verify every detail on official conference websites.",
  items: [
    {
      id: "demo-art-education-helsinki-2026",
      title: "European Art Education Forum (demo)",
      startDate: "2026-09-17",
      endDate: "2026-09-19",
      city: "Helsinki",
      country: "Finland",
      continent: "Europe",
      categories: ["Art education", "Pedagogy", "Visual art"],
      description:
        "Demo seed listing for testing filters, saved notes, and date sorting. Replace or refresh with verified public conference data before relying on it.",
      cfpDeadline: "2026-06-30",
      submissionStatus: "open",
      officialUrl: "https://example.org/academic-travel-services/demo-art-education",
      sourceUrl: "https://example.org/academic-travel-services/demo-art-education",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-creative-coding-berlin-2026",
      title: "Creative Coding and Critical Media Symposium (demo)",
      startDate: "2026-11-05",
      endDate: "2026-11-07",
      city: "Berlin",
      country: "Germany",
      continent: "Europe",
      categories: ["Creative coding", "Media education", "Digital humanities"],
      description:
        "A demonstration record shaped like a conference listing, useful for trying keyword search and category combinations.",
      cfpDeadline: "2026-08-14",
      submissionStatus: "open",
      officialUrl: "https://example.org/academic-travel-services/demo-creative-coding",
      sourceUrl: "https://example.org/academic-travel-services/demo-creative-coding",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-design-research-milan-2027",
      title: "Design Research Routes Congress (demo)",
      startDate: "2027-03-22",
      endDate: "2027-03-25",
      city: "Milan",
      country: "Italy",
      continent: "Europe",
      categories: ["Design research", "Interdisciplinary arts", "Cultural studies"],
      description:
        "Demo data for a design research conference card, including a future CFP deadline and multiple genre tags.",
      cfpDeadline: "2026-11-15",
      submissionStatus: "upcoming",
      officialUrl: "https://example.org/academic-travel-services/demo-design-research",
      sourceUrl: "https://example.org/academic-travel-services/demo-design-research",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-digital-humanities-prague-2027",
      title: "Digital Humanities Field Notes (demo)",
      startDate: "2027-06-09",
      endDate: "2027-06-12",
      city: "Prague",
      country: "Czechia",
      continent: "Europe",
      categories: ["Digital humanities", "Humanities", "Technology and education"],
      description:
        "Starter record for the method page and frontend filtering. Treat it as a placeholder until the refresh workflow writes verified search results.",
      cfpDeadline: "2027-01-20",
      submissionStatus: "upcoming",
      officialUrl: "https://example.org/academic-travel-services/demo-digital-humanities",
      sourceUrl: "https://example.org/academic-travel-services/demo-digital-humanities",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-future-studies-lisbon-2027",
      title: "Future Studies Itinerary Lab (demo)",
      startDate: "2027-09-02",
      endDate: "2027-09-04",
      city: "Lisbon",
      country: "Portugal",
      continent: "Europe",
      categories: ["Future studies", "Social sciences", "Science studies"],
      description:
        "Demo listing designed to test continent, country, CFP deadline, and relevance sorting without depending on a live API.",
      cfpDeadline: "2027-03-31",
      submissionStatus: "unknown",
      officialUrl: "https://example.org/academic-travel-services/demo-future-studies",
      sourceUrl: "https://example.org/academic-travel-services/demo-future-studies",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-critical-age-studies-amsterdam-2028",
      title: "Critical Age Studies Winter School and Conference (demo)",
      startDate: "2028-02-10",
      endDate: "2028-02-12",
      city: "Amsterdam",
      country: "Netherlands",
      continent: "Europe",
      categories: ["Critical age studies", "Cultural studies", "Humanities"],
      description:
        "A transparent demo entry to make saved conferences and private notes testable before public-source data is configured.",
      cfpDeadline: null,
      submissionStatus: "unknown",
      officialUrl: "https://example.org/academic-travel-services/demo-critical-age-studies",
      sourceUrl: "https://example.org/academic-travel-services/demo-critical-age-studies",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-arts-based-research-toronto-2027",
      title: "Arts-Based Research Atlas (demo)",
      startDate: "2027-10-13",
      endDate: "2027-10-16",
      city: "Toronto",
      country: "Canada",
      continent: "North America",
      categories: ["Arts-based research", "Artistic research", "Education"],
      description:
        "Demo listing outside Europe for testing global discovery, saved cards, and the all-continents filter.",
      cfpDeadline: "2027-04-12",
      submissionStatus: "upcoming",
      officialUrl: "https://example.org/academic-travel-services/demo-arts-based-research",
      sourceUrl: "https://example.org/academic-travel-services/demo-arts-based-research",
      lastChecked: "2026-05-20T00:00:00.000Z"
    },
    {
      id: "demo-education-kyoto-2027",
      title: "Pedagogy and Technology Exchange (demo)",
      startDate: "2027-12-01",
      endDate: "2027-12-03",
      city: "Kyoto",
      country: "Japan",
      continent: "Asia",
      categories: ["Education", "Pedagogy", "Technology and education"],
      description:
        "Global demo data for testing country sorting and query matches such as technology, pedagogy, and education.",
      cfpDeadline: "2027-05-01",
      submissionStatus: "unknown",
      officialUrl: "https://example.org/academic-travel-services/demo-pedagogy-technology",
      sourceUrl: "https://example.org/academic-travel-services/demo-pedagogy-technology",
      lastChecked: "2026-05-20T00:00:00.000Z"
    }
  ]
};
