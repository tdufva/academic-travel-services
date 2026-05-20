import { describe, expect, it } from "vitest";
import { CATEGORIES } from "../data/taxonomy";
import type { Conference, Filters } from "../types";
import { filterConferences } from "./filter";

const baseConference: Conference = {
  id: "test",
  title: "Test Conference",
  startDate: "2027-01-10",
  endDate: "2027-01-12",
  city: "Helsinki",
  country: "Finland",
  continent: "Europe",
  categories: ["Art education"],
  description: "A conference about visual pedagogy.",
  cfpDeadline: "2026-09-01",
  submissionStatus: "open",
  officialUrl: "https://example.org",
  sourceUrl: "https://example.org",
  lastChecked: "2026-05-20T00:00:00.000Z",
};

const filters: Filters = {
  selectedCategories: [...CATEGORIES],
  country: "All countries",
  continent: "All continents",
  query: "",
  startDate: "2026-05-20",
  endDate: "2028-05-20",
  includeUnknownDates: false,
  sortMode: "soonest",
};

describe("filterConferences", () => {
  it("filters by category, country, continent, search text, and date range", () => {
    const results = filterConferences([baseConference], {
      ...filters,
      selectedCategories: ["Art education"],
      country: "Finland",
      continent: "Europe",
      query: "visual",
    });

    expect(results).toHaveLength(1);
  });

  it("excludes unknown dates by default", () => {
    const results = filterConferences([{ ...baseConference, id: "unknown", startDate: null }], filters);

    expect(results).toHaveLength(0);
  });

  it("sorts soonest conferences first", () => {
    const later = { ...baseConference, id: "later", startDate: "2027-04-10" };
    const sooner = { ...baseConference, id: "sooner", startDate: "2026-08-10" };
    const results = filterConferences([later, sooner], filters);

    expect(results.map((result) => result.id)).toEqual(["sooner", "later"]);
  });
});
