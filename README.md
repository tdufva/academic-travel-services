# Academic Travel Services

A playful, minimalistic conference-discovery website for scholars, artists, educators, and researchers looking for upcoming conferences across Europe and globally. It behaves like a small travel booking desk for CFPs: airy, practical, and just witty enough to survive committee work.

## Local Development

```bash
npm install
npm run dev
npm test
npm run build
```

The app is built with Vite, React, and TypeScript. Conference data is loaded at runtime from `public/data/conferences.json`, so the frontend works on static hosting such as GitHub Pages.

## Deployment

The repository includes `.github/workflows/deploy-pages.yml`.

1. Push to `main`.
2. In GitHub repository settings, make sure Pages is configured to deploy from **GitHub Actions**.
3. The workflow installs dependencies, runs tests, builds the static site, and publishes `dist/`.

The Vite base path is configured for the project site URL `/academic-travel-services/`.

## Data Refresh Workflow

The scheduled workflow `.github/workflows/refresh-conferences.yml` runs weekly and can be launched manually from the Actions tab. It runs:

```bash
npm run refresh:data
```

The update script searches public web results for combinations of:

- tracked fields and genres
- `conference`
- `call for papers`
- `CFP`
- current and upcoming years
- country, continent, and Europe-focused terms

It deduplicates by conference title and URL, avoids low-quality aggregator domains where possible, keeps uncertain values as `null` or `unknown`, and writes the normalized dataset back to `public/data/conferences.json`.

## Search API Keys

No API key is exposed in the frontend. Add one of these repository secrets to enable real refreshes:

- `BRAVE_SEARCH_API_KEY`
- `SERPAPI_KEY`
- `BING_SEARCH_API_KEY`

If no key is configured, the refresh script keeps the existing data unchanged and the site continues to use the bundled demo records.

## Manual Data Edits

You can manually edit `public/data/conferences.json`. Keep records in this shape:

```ts
type Conference = {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  city: string | null;
  country: string | null;
  continent: string | null;
  categories: string[];
  description: string;
  cfpDeadline: string | null;
  submissionStatus: "open" | "upcoming" | "closed" | "unknown";
  officialUrl: string;
  sourceUrl: string;
  lastChecked: string;
};
```

Use ISO dates (`YYYY-MM-DD`) where known. Prefer official conference websites for `officialUrl`; use `sourceUrl` for the page or search result that supports the listing.

## Disclaimer

Conference details change. CFP deadlines move, hybrid formats appear, and locations sometimes shift after the first announcement. Always verify dates, venues, fees, submission status, and travel requirements on official conference websites before booking or submitting.
