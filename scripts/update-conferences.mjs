#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../public/data/conferences.json", import.meta.url);
const NOW = new Date();
const TWO_YEARS_FROM_NOW = new Date(NOW);
TWO_YEARS_FROM_NOW.setFullYear(TWO_YEARS_FROM_NOW.getFullYear() + 2);

const CATEGORIES = [
  "Art education",
  "Craft education",
  "Education",
  "Media education",
  "Creative coding",
  "Critical age studies",
  "Future studies",
  "Visual art",
  "Artistic research",
  "Digital humanities",
  "Social sciences",
  "Science studies",
  "Interdisciplinary arts",
  "Design research",
  "Cultural studies",
  "Humanities",
  "Pedagogy",
  "Technology and education",
  "Arts-based research",
];

const COUNTRY_CONTINENTS = new Map(
  [
    ["Austria", "Europe"],
    ["Belgium", "Europe"],
    ["Czechia", "Europe"],
    ["Denmark", "Europe"],
    ["Estonia", "Europe"],
    ["Finland", "Europe"],
    ["France", "Europe"],
    ["Germany", "Europe"],
    ["Greece", "Europe"],
    ["Iceland", "Europe"],
    ["Ireland", "Europe"],
    ["Italy", "Europe"],
    ["Netherlands", "Europe"],
    ["Norway", "Europe"],
    ["Portugal", "Europe"],
    ["Spain", "Europe"],
    ["Sweden", "Europe"],
    ["Switzerland", "Europe"],
    ["United Kingdom", "Europe"],
    ["Canada", "North America"],
    ["United States", "North America"],
    ["Mexico", "North America"],
    ["Brazil", "South America"],
    ["Chile", "South America"],
    ["Argentina", "South America"],
    ["Japan", "Asia"],
    ["South Korea", "Asia"],
    ["Singapore", "Asia"],
    ["India", "Asia"],
    ["Australia", "Oceania"],
    ["New Zealand", "Oceania"],
    ["South Africa", "Africa"],
  ].sort((a, b) => b[0].length - a[0].length),
);

const CITY_HINTS = [
  "Amsterdam",
  "Athens",
  "Barcelona",
  "Berlin",
  "Bilbao",
  "Brussels",
  "Copenhagen",
  "Dublin",
  "Helsinki",
  "Lisbon",
  "London",
  "Madrid",
  "Milan",
  "Oslo",
  "Paris",
  "Porto",
  "Prague",
  "Reykjavik",
  "Rome",
  "Stockholm",
  "Tallinn",
  "Vienna",
  "Zurich",
  "Toronto",
  "Montreal",
  "New York",
  "Chicago",
  "Kyoto",
  "Tokyo",
  "Singapore",
  "Melbourne",
  "Sydney",
  "Cape Town",
];

const LOW_QUALITY_DOMAINS = [
  "allconferencealert",
  "conferencealerts",
  "conferenceindex",
  "conferencelists",
  "freeconferencealerts",
  "internationalconferencealerts",
  "researchfora",
  "sciencefora",
  "waset.org",
  "worldacademy",
];

function getProvider() {
  if (process.env.BRAVE_SEARCH_API_KEY) {
    return {
      name: "brave-search",
      async search(query) {
        const url = new URL("https://api.search.brave.com/res/v1/web/search");
        url.searchParams.set("q", query);
        url.searchParams.set("count", "10");
        url.searchParams.set("search_lang", "en");
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY,
          },
        });
        if (!response.ok) {
          throw new Error(`Brave Search failed: ${response.status}`);
        }
        const payload = await response.json();
        return (payload.web?.results ?? []).map((result) => ({
          title: result.title,
          url: result.url,
          snippet: result.description ?? "",
        }));
      },
    };
  }

  if (process.env.SERPAPI_KEY) {
    return {
      name: "serpapi-google",
      async search(query) {
        const url = new URL("https://serpapi.com/search.json");
        url.searchParams.set("engine", "google");
        url.searchParams.set("q", query);
        url.searchParams.set("num", "10");
        url.searchParams.set("api_key", process.env.SERPAPI_KEY);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`SerpApi failed: ${response.status}`);
        }
        const payload = await response.json();
        return (payload.organic_results ?? []).map((result) => ({
          title: result.title,
          url: result.link,
          snippet: result.snippet ?? "",
        }));
      },
    };
  }

  if (process.env.BING_SEARCH_API_KEY) {
    return {
      name: "bing-web-search",
      async search(query) {
        const url = new URL("https://api.bing.microsoft.com/v7.0/search");
        url.searchParams.set("q", query);
        url.searchParams.set("count", "10");
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_API_KEY,
          },
        });
        if (!response.ok) {
          throw new Error(`Bing Search failed: ${response.status}`);
        }
        const payload = await response.json();
        return (payload.webPages?.value ?? []).map((result) => ({
          title: result.name,
          url: result.url,
          snippet: result.snippet ?? "",
        }));
      },
    };
  }

  return null;
}

function buildQueries() {
  const years = Array.from(new Set([NOW.getFullYear(), NOW.getFullYear() + 1, NOW.getFullYear() + 2]));
  const europeCountries = Array.from(COUNTRY_CONTINENTS.entries())
    .filter(([, continent]) => continent === "Europe")
    .map(([country]) => country);

  const queries = [];
  for (const category of CATEGORIES) {
    for (const year of years) {
      queries.push({ category, query: `"${category}" conference CFP ${year} Europe` });
      queries.push({ category, query: `"${category}" "call for papers" conference ${year}` });
      queries.push({ category, query: `"${category}" conference ${year} ${europeCountries[queries.length % europeCountries.length]}` });
    }
  }

  return queries;
}

async function readExistingDataset() {
  try {
    return JSON.parse(await readFile(DATA_PATH, "utf8"));
  } catch {
    return { generatedAt: NOW.toISOString(), generatedBy: "empty", items: [] };
  }
}

function canonicalUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_)/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

function domainFor(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function isLowQualityResult(result) {
  const domain = domainFor(result.url);
  const text = `${result.title} ${result.snippet} ${result.url}`.toLowerCase();
  return (
    LOW_QUALITY_DOMAINS.some((blocked) => domain.includes(blocked)) ||
    /\b(predatory|fake conference|hijacked journal|guaranteed publication)\b/.test(text)
  );
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8211;|&#8212;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "AcademicTravelServicesBot/0.1 (+https://github.com/tdufva/academic-travel-services)",
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.2",
      },
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !/(html|text|xml)/i.test(contentType)) {
      return "";
    }
    return cleanText((await response.text()).slice(0, 300_000));
  } catch {
    return "";
  }
}

function dateOnly(value) {
  if (!value) {
    return null;
  }

  const iso = String(value).match(/\b(20[2-3]\d)-([01]\d)-([0-3]\d)\b/);
  if (iso) {
    return iso[0];
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function monthNumber(month) {
  return (
    [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ].indexOf(month.toLowerCase()) + 1
  );
}

function padded(value) {
  return String(value).padStart(2, "0");
}

function findDateRange(text) {
  const iso = text.match(/\b(2026|2027|2028)-([01]\d)-([0-3]\d)\b/);
  if (iso) {
    return { startDate: iso[0], endDate: null };
  }

  const monthPattern =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-3]?\d)(?:\s*(?:-|to|through|until|–)\s*(?:(January|February|March|April|May|June|July|August|September|October|November|December)\s+)?([0-3]?\d))?,?\s+(2026|2027|2028)\b/i;
  const match = text.match(monthPattern);
  if (!match) {
    return { startDate: null, endDate: null };
  }

  const startMonth = monthNumber(match[1]);
  const startDay = Number(match[2]);
  const endMonth = monthNumber(match[3] ?? match[1]);
  const endDay = match[4] ? Number(match[4]) : null;
  const year = Number(match[5]);
  const startDate = `${year}-${padded(startMonth)}-${padded(startDay)}`;
  const endDate = endDay ? `${year}-${padded(endMonth)}-${padded(endDay)}` : null;

  return { startDate, endDate };
}

function findCfpDeadline(text) {
  const deadlineWindows = [...text.matchAll(/\b(deadline|abstracts?|submissions?|cfp|call for papers).{0,120}/gi)].map(
    (match) => match[0],
  );
  for (const windowText of deadlineWindows) {
    const { startDate } = findDateRange(windowText);
    if (startDate) {
      return startDate;
    }
  }
  return null;
}

function detectCountry(text) {
  for (const [country] of COUNTRY_CONTINENTS) {
    if (new RegExp(`\\b${country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
      return country;
    }
  }
  return null;
}

function detectCity(text) {
  for (const city of CITY_HINTS) {
    if (new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) {
      return city;
    }
  }
  return null;
}

function detectSubmissionStatus(cfpDeadline, text) {
  const lower = text.toLowerCase();
  if (cfpDeadline) {
    return new Date(`${cfpDeadline}T23:59:59Z`) >= NOW ? "open" : "closed";
  }
  if (/\b(call opens|submissions open soon|cfp forthcoming)\b/.test(lower)) {
    return "upcoming";
  }
  if (/\b(submissions closed|cfp closed|deadline passed)\b/.test(lower)) {
    return "closed";
  }
  return "unknown";
}

function categoryMatches(text, seedCategory) {
  const matches = new Set([seedCategory]);
  const lower = text.toLowerCase();
  for (const category of CATEGORIES) {
    if (lower.includes(category.toLowerCase())) {
      matches.add(category);
    }
  }
  return [...matches];
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function normalizeResult(result, pageText) {
  const combinedText = cleanText(`${result.title}. ${result.snippet}. ${pageText}`);
  const title = cleanText(result.title)
    .replace(/\s+[-|]\s+Call for Papers.*$/i, "")
    .replace(/\s+[-|]\s+CFP.*$/i, "")
    .slice(0, 160);

  if (!title || !/\b(conference|congress|symposium|colloquium|meeting|cfp|call for papers)\b/i.test(combinedText)) {
    return null;
  }

  const { startDate, endDate } = findDateRange(combinedText);
  if (startDate) {
    const date = new Date(`${startDate}T12:00:00Z`);
    if (date < NOW || date > TWO_YEARS_FROM_NOW) {
      return null;
    }
  }

  const cfpDeadline = findCfpDeadline(combinedText);
  const country = detectCountry(combinedText);
  const city = detectCity(combinedText);
  const categories = categoryMatches(combinedText, result.category);
  const description = cleanText(result.snippet || combinedText).slice(0, 260);
  const officialUrl = canonicalUrl(result.url);

  return {
    id: slugify(`${title}-${officialUrl}`),
    title,
    startDate,
    endDate,
    city,
    country,
    continent: country ? COUNTRY_CONTINENTS.get(country) ?? null : null,
    categories,
    description: description || "Public search result. Verify details on the official conference website.",
    cfpDeadline,
    submissionStatus: detectSubmissionStatus(cfpDeadline, combinedText),
    officialUrl,
    sourceUrl: officialUrl,
    lastChecked: NOW.toISOString(),
  };
}

function dedupeItems(items) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${canonicalUrl(item.officialUrl)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(item);
  }

  return output;
}

async function main() {
  const existing = await readExistingDataset();
  const provider = getProvider();

  if (!provider) {
    console.log("No search API key configured. Keeping existing conference data unchanged.");
    console.log("Set BRAVE_SEARCH_API_KEY, SERPAPI_KEY, or BING_SEARCH_API_KEY in GitHub Actions secrets.");
    return;
  }

  const queryLimit = Number(process.env.SEARCH_QUERY_LIMIT ?? 80);
  const queries = buildQueries().slice(0, queryLimit);
  const rawResults = [];

  for (const { query, category } of queries) {
    try {
      const results = await provider.search(query);
      for (const result of results) {
        if (!result.url || isLowQualityResult(result)) {
          continue;
        }
        rawResults.push({ ...result, category, query });
      }
    } catch (error) {
      console.warn(`Search failed for query "${query}": ${error.message}`);
    }
  }

  const uniqueResults = dedupeItems(
    rawResults.map((result) => ({
      title: cleanText(result.title),
      officialUrl: canonicalUrl(result.url),
      ...result,
    })),
  ).slice(0, Number(process.env.SEARCH_RESULT_LIMIT ?? 80));

  const normalized = [];
  for (const result of uniqueResults) {
    const pageText = await fetchPageText(result.url);
    const item = normalizeResult(result, pageText);
    if (item) {
      normalized.push(item);
    }
  }

  const manualItems = (existing.items ?? []).filter(
    (item) => !String(item.id).startsWith("demo-") && !String(item.officialUrl).includes("example.org"),
  );
  const items = normalized.length > 0 ? dedupeItems([...manualItems, ...normalized]) : existing.items ?? [];

  const output = {
    generatedAt: NOW.toISOString(),
    generatedBy: provider.name,
    notes:
      "Generated from public search results. Values that cannot be confidently extracted are stored as null or unknown. Verify details on official conference websites.",
    items,
  };

  await writeFile(DATA_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Wrote ${items.length} conference records using ${provider.name}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
