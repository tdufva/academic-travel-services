#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = new URL("../public/data/conferences.json", import.meta.url);
const NOW = new Date();
const TWO_YEARS_FROM_NOW = new Date(NOW);
TWO_YEARS_FROM_NOW.setFullYear(TWO_YEARS_FROM_NOW.getFullYear() + 2);
const TRACKED_YEARS = Array.from(new Set([NOW.getFullYear(), NOW.getFullYear() + 1, NOW.getFullYear() + 2]));
const YEAR_PATTERN = TRACKED_YEARS.join("|");

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

const CATEGORY_ALIASES = {
  "Craft education": [
    "craft pedagogy",
    "craft teacher education",
    "craft research",
    "craft studies",
    "sloyd",
    "slöjd",
    "slöyd",
    "sløyd",
    "slojd",
    "sloyd education",
    "slöjd education",
    "craft didactics",
    "craft education research",
    "slöjdpedagogik",
    "slöjdundervisning",
  ],
  "Critical age studies": [
    "ageing studies",
    "aging studies",
    "age studies",
    "critical gerontology",
    "cultural gerontology",
    "gerontology",
    "life course studies",
    "age and culture",
    "older adults",
    "later life",
    "ageing research",
    "aging research",
    "ageing and society",
    "aging and society",
    "ageing cultures",
    "aging cultures",
    "ageing humanities",
    "aging humanities",
  ],
  "Visual art": [
    "visual arts",
    "visual arts education",
    "contemporary art",
    "fine art",
    "art history",
    "visual culture",
    "visual culture studies",
    "curatorial studies",
    "painting",
    "sculpture",
    "photography",
    "new media art",
    "bildkonst",
    "konstpedagogik",
  ],
};

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
  "Tampere",
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

const CITY_COUNTRIES = new Map([
  ["Amsterdam", "Netherlands"],
  ["Athens", "Greece"],
  ["Barcelona", "Spain"],
  ["Berlin", "Germany"],
  ["Bilbao", "Spain"],
  ["Brussels", "Belgium"],
  ["Copenhagen", "Denmark"],
  ["Dublin", "Ireland"],
  ["Helsinki", "Finland"],
  ["Lisbon", "Portugal"],
  ["London", "United Kingdom"],
  ["Madrid", "Spain"],
  ["Milan", "Italy"],
  ["Oslo", "Norway"],
  ["Paris", "France"],
  ["Porto", "Portugal"],
  ["Prague", "Czechia"],
  ["Reykjavik", "Iceland"],
  ["Rome", "Italy"],
  ["Stockholm", "Sweden"],
  ["Tallinn", "Estonia"],
  ["Tampere", "Finland"],
  ["Vienna", "Austria"],
  ["Zurich", "Switzerland"],
  ["Toronto", "Canada"],
  ["Montreal", "Canada"],
  ["New York", "United States"],
  ["Chicago", "United States"],
  ["Kyoto", "Japan"],
  ["Tokyo", "Japan"],
  ["Singapore", "Singapore"],
  ["Melbourne", "Australia"],
  ["Sydney", "Australia"],
  ["Cape Town", "South Africa"],
]);

const LOW_QUALITY_DOMAINS = [
  "allconferencealert",
  "conferencealerts",
  "conferenceindex",
  "conferencelists",
  "conferencesites.eu",
  "facebook.com",
  "freeconferencealerts",
  "instagram.com",
  "internationalconferencealerts",
  "linkedin.com",
  "researchfora",
  "sciencefora",
  "waset.org",
  "wikicfp.com",
  "worldacademy",
];

const MONTHS = new Map([
  ["jan", 1],
  ["january", 1],
  ["feb", 2],
  ["february", 2],
  ["mar", 3],
  ["march", 3],
  ["apr", 4],
  ["april", 4],
  ["may", 5],
  ["jun", 6],
  ["june", 6],
  ["jul", 7],
  ["july", 7],
  ["aug", 8],
  ["august", 8],
  ["sep", 9],
  ["sept", 9],
  ["september", 9],
  ["oct", 10],
  ["october", 10],
  ["nov", 11],
  ["november", 11],
  ["dec", 12],
  ["december", 12],
]);

const MONTH_PATTERN =
  "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";

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
          snippet: [result.date, result.snippet].filter(Boolean).join(". "),
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
  const yearClause = TRACKED_YEARS.join(" OR ");
  const templates = [
    (term) => `"${term}" (conference OR symposium OR congress) (CFP OR "call for papers" OR "call for submissions") (${yearClause}) Europe`,
    (term) => `"${term}" "call for papers" (${yearClause})`,
    (term) => `"${term}" conference (${yearClause})`,
  ];
  const categoryBuckets = CATEGORIES.map((category) => {
    const terms = [category, ...(CATEGORY_ALIASES[category] ?? [])];
    return terms.flatMap((term) => templates.map((template) => ({ category, query: template(term) })));
  });
  const queries = [];

  for (let index = 0; ; index += 1) {
    let added = false;

    for (const bucket of categoryBuckets) {
      const query = bucket[index];
      if (query) {
        queries.push(query);
        added = true;
      }
    }

    if (!added) {
      break;
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

function isLowQualityTitle(title, url) {
  const normalizedTitle = cleanText(title).toLowerCase();
  const domain = domainFor(url);
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (domain === "easychair.org" && (pathname === "/cfp" || pathname === "/cfp/area")) {
    return true;
  }

  if (domain === "call-for-papers.sas.upenn.edu" && pathname.startsWith("/category/")) {
    return true;
  }

  if (["cfplist.com", "infosec-conferences.com"].some((blocked) => domain.includes(blocked))) {
    return true;
  }

  return /\b(special issue|journal|database|archive for calls|archives par|great academic opportunities|cybersecurity conferences|upcoming conferences|smart cfp|exhibitors|assistant professor)\b/.test(
    normalizedTitle,
  ) || /^(online conference|events\s+-|activities|tuesday,|\|\s*call for papers|s in social sciences|list\s+[-–])/.test(normalizedTitle) ||
    /\s+-\s+home$/.test(normalizedTitle);
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#8211;|&#8212;|&ndash;|&mdash;/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageContent(url) {
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
      return { html: "", text: "" };
    }
    const html = (await response.text()).slice(0, 300_000);
    return { html, text: cleanText(html) };
  } catch {
    return { html: "", text: "" };
  }
}

function dateOnly(value) {
  if (!value) {
    return null;
  }

  const iso = String(value).match(new RegExp(`\\b(${YEAR_PATTERN})-([01]\\d)-([0-3]\\d)\\b`));
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
  return MONTHS.get(month.toLowerCase().replace(/\.$/, "")) ?? 0;
}

function padded(value) {
  return String(value).padStart(2, "0");
}

function normalizeYear(value) {
  const numeric = Number(value);
  const year = numeric < 100 ? 2000 + numeric : numeric;
  return TRACKED_YEARS.includes(year) ? year : null;
}

function makeDate(year, month, day) {
  if (!year || !month || !day || day < 1 || day > 31) {
    return null;
  }

  return `${year}-${padded(month)}-${padded(day)}`;
}

function withDateBounds(range) {
  if (!range.startDate) {
    return range;
  }

  const date = new Date(`${range.startDate}T12:00:00Z`);
  if (date < NOW || date > TWO_YEARS_FROM_NOW) {
    return { startDate: null, endDate: null };
  }

  return range;
}

function findDateRange(text) {
  const iso = text.match(new RegExp(`\\b(${YEAR_PATTERN})-([01]\\d)-([0-3]\\d)\\b`));
  if (iso) {
    return withDateBounds({ startDate: iso[0], endDate: null });
  }

  const monthFirstPattern = new RegExp(
    `\\b(${MONTH_PATTERN})\\.?\\s+([0-3]?\\d)(?:\\s*(?:-|to|through|until|–|—)\\s*(?:(${MONTH_PATTERN})\\.?\\s+)?([0-3]?\\d))?,?\\s+(${YEAR_PATTERN}|\\d{2})\\b`,
    "i",
  );
  const monthFirst = text.match(monthFirstPattern);
  if (monthFirst) {
    const year = normalizeYear(monthFirst[5]);
    const startMonth = monthNumber(monthFirst[1]);
    const startDay = Number(monthFirst[2]);
    const endMonth = monthNumber(monthFirst[3] ?? monthFirst[1]);
    const endDay = monthFirst[4] ? Number(monthFirst[4]) : null;
    return withDateBounds({
      startDate: makeDate(year, startMonth, startDay),
      endDate: endDay ? makeDate(year, endMonth, endDay) : null,
    });
  }

  const dayFirstPattern = new RegExp(
    `\\b([0-3]?\\d)(?:\\s*(?:-|to|through|until|–|—)\\s*([0-3]?\\d))?\\s+(${MONTH_PATTERN})\\.?\\s+(${YEAR_PATTERN}|\\d{2})\\b`,
    "i",
  );
  const dayFirst = text.match(dayFirstPattern);
  if (dayFirst) {
    const year = normalizeYear(dayFirst[4]);
    const month = monthNumber(dayFirst[3]);
    const startDay = Number(dayFirst[1]);
    const endDay = dayFirst[2] ? Number(dayFirst[2]) : null;
    return withDateBounds({
      startDate: makeDate(year, month, startDay),
      endDate: endDay ? makeDate(year, month, endDay) : null,
    });
  }

  return { startDate: null, endDate: null };
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

function findSchemaDates(html) {
  const startDate = dateOnly(html.match(/"startDate"\s*:\s*"([^"]+)"/i)?.[1]);
  const endDate = dateOnly(html.match(/"endDate"\s*:\s*"([^"]+)"/i)?.[1]);

  return withDateBounds({ startDate, endDate });
}

function cleanTitle(title) {
  return cleanText(title)
    .replace(/^cfp\s*:?\s*/i, "")
    .replace(/^call for papers\s*:?\s*/i, "")
    .replace(/^[-–—|:\s]+/, "")
    .replace(/^for\s+/i, "")
    .replace(/\s+[-|]\s+Call for Papers.*$/i, "")
    .replace(/\s+[-|]\s+CFP.*$/i, "")
    .replace(/\s*\.\.\.$/, "")
    .slice(0, 160);
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
    const terms = [category, ...(CATEGORY_ALIASES[category] ?? [])];
    if (terms.some((term) => lower.includes(term.toLowerCase()))) {
      matches.add(category);
    }
  }
  return [...matches];
}

function qualityScore(item) {
  let score = 0;
  if (item.startDate) score += 6;
  if (item.cfpDeadline) score += 3;
  if (item.country) score += 2;
  if (item.city) score += 1;
  if (item.submissionStatus === "open") score += 2;
  if (item.submissionStatus === "upcoming") score += 1;
  if (/conference|congress|symposium|colloquium/i.test(item.title)) score += 2;

  const domain = domainFor(item.officialUrl);
  if (LOW_QUALITY_DOMAINS.some((blocked) => domain.includes(blocked))) score -= 8;
  if (/facebook|instagram|linkedin|x\.com|twitter/.test(domain)) score -= 5;

  return score;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function normalizeResult(result, pageContent) {
  const resultText = cleanText(`${result.title}. ${result.snippet}`);
  const pageLead = pageContent.text.slice(0, 8000);
  const combinedText = cleanText(`${resultText}. ${pageLead}`);
  const title = cleanTitle(result.title);

  if (!title || !/\b(conference|congress|symposium|colloquium|meeting|cfp|call for papers|call for submissions)\b/i.test(resultText)) {
    return null;
  }

  if (isLowQualityTitle(title, result.url)) {
    return null;
  }

  const schemaDates = findSchemaDates(pageContent.html);
  const resultDates = findDateRange(resultText);
  const leadDates = findDateRange(pageLead);
  const startDate = schemaDates.startDate ?? resultDates.startDate ?? leadDates.startDate;
  const endDate = schemaDates.endDate ?? resultDates.endDate ?? leadDates.endDate;

  const cfpDeadline = findCfpDeadline(resultText) ?? findCfpDeadline(pageLead);
  const city = detectCity(resultText);
  const country = (city ? CITY_COUNTRIES.get(city) ?? null : null) ?? detectCountry(resultText);
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

function diversifyResultsByCategory(results, limit) {
  const buckets = new Map(CATEGORIES.map((category) => [category, []]));

  for (const result of results) {
    buckets.get(result.category)?.push(result);
  }

  const output = [];
  for (let index = 0; output.length < limit; index += 1) {
    let added = false;

    for (const category of CATEGORIES) {
      const result = buckets.get(category)?.[index];
      if (!result) {
        continue;
      }

      output.push(result);
      added = true;

      if (output.length >= limit) {
        break;
      }
    }

    if (!added) {
      break;
    }
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

  const uniqueCandidates = dedupeItems(
    rawResults.map((result) => ({
      title: cleanText(result.title),
      officialUrl: canonicalUrl(result.url),
      ...result,
    })),
  );
  const uniqueResults = diversifyResultsByCategory(uniqueCandidates, Number(process.env.SEARCH_RESULT_LIMIT ?? 80));

  const normalized = [];
  for (const result of uniqueResults) {
    const pageContent = await fetchPageContent(result.url);
    const item = normalizeResult(result, pageContent);
    if (item) {
      normalized.push(item);
    }
  }

  const manualItems = (existing.items ?? []).filter((item) => String(item.id).startsWith("manual-"));
  const sortedNormalized = normalized
    .filter((item) => item.startDate || item.cfpDeadline || item.submissionStatus === "upcoming")
    .filter((item) => qualityScore(item) >= 0)
    .sort((a, b) => qualityScore(b) - qualityScore(a));
  const items = sortedNormalized.length > 0 ? dedupeItems([...manualItems, ...sortedNormalized]) : existing.items ?? [];

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
