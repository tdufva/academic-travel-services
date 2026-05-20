import type { Conference, Filters } from "../types";
import { compareDates, isBetween } from "./dates";

const ALL_COUNTRIES = "All countries";
const ALL_CONTINENTS = "All continents";

export function getCountries(conferences: Conference[]): string[] {
  const countries = conferences
    .map((conference) => conference.country)
    .filter((country): country is string => Boolean(country));

  return [ALL_COUNTRIES, ...Array.from(new Set(countries)).sort((a, b) => a.localeCompare(b))];
}

export function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function relevanceScore(conference: Conference, filters: Filters): number {
  const query = normalizeSearch(filters.query);
  const haystack = [
    conference.title,
    conference.description,
    conference.city,
    conference.country,
    conference.continent,
    ...conference.categories,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  let score = 0;

  for (const category of filters.selectedCategories) {
    if (conference.categories.includes(category)) {
      score += 3;
    }
  }

  if (filters.continent !== ALL_CONTINENTS && conference.continent === filters.continent) {
    score += 2;
  }

  if (filters.country !== ALL_COUNTRIES && conference.country === filters.country) {
    score += 2;
  }

  if (query) {
    const terms = query.split(/\s+/);
    for (const term of terms) {
      if (conference.title.toLocaleLowerCase().includes(term)) {
        score += 4;
      } else if (haystack.includes(term)) {
        score += 1;
      }
    }
  }

  return score;
}

export function filterConferences(conferences: Conference[], filters: Filters): Conference[] {
  const query = normalizeSearch(filters.query);

  return conferences
    .filter((conference) => {
      const matchesCategories =
        filters.selectedCategories.length > 0 &&
        conference.categories.some((category) => filters.selectedCategories.includes(category));

      if (!matchesCategories) {
        return false;
      }

      if (filters.country !== ALL_COUNTRIES && conference.country !== filters.country) {
        return false;
      }

      if (filters.continent !== ALL_CONTINENTS && conference.continent !== filters.continent) {
        return false;
      }

      if (!conference.startDate && !filters.includeUnknownDates) {
        return false;
      }

      if (conference.startDate && !isBetween(conference.startDate, filters.startDate, filters.endDate)) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        conference.title,
        conference.description,
        conference.city,
        conference.country,
        conference.continent,
        conference.cfpDeadline,
        conference.submissionStatus,
        ...conference.categories,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return query.split(/\s+/).every((term) => haystack.includes(term));
    })
    .sort((a, b) => {
      if (filters.sortMode === "cfpDeadline") {
        return compareDates(a.cfpDeadline, b.cfpDeadline) || compareDates(a.startDate, b.startDate);
      }

      if (filters.sortMode === "country") {
        return (
          (a.country ?? "zzz").localeCompare(b.country ?? "zzz") ||
          compareDates(a.startDate, b.startDate)
        );
      }

      if (filters.sortMode === "relevance") {
        return relevanceScore(b, filters) - relevanceScore(a, filters) || compareDates(a.startDate, b.startDate);
      }

      return compareDates(a.startDate, b.startDate);
    });
}
