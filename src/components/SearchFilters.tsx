import { Check, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, CONTINENTS } from "../data/taxonomy";
import type { Filters, SortMode } from "../types";

type SearchFiltersProps = {
  filters: Filters;
  countries: string[];
  draftQuery: string;
  resultCount: number;
  dataUpdatedAt: string;
  isLoading: boolean;
  onDraftQueryChange: (query: string) => void;
  onFiltersChange: (filters: Filters) => void;
  onSearch: () => void;
  onReset: () => void;
};

export function SearchFilters({
  filters,
  countries,
  draftQuery,
  resultCount,
  dataUpdatedAt,
  isLoading,
  onDraftQueryChange,
  onFiltersChange,
  onSearch,
  onReset,
}: SearchFiltersProps) {
  const selectedCount = filters.selectedCategories.length;

  function updateFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function toggleCategory(category: string) {
    const selected = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter((item) => item !== category)
      : [...filters.selectedCategories, category];

    updateFilter("selectedCategories", selected);
  }

  return (
    <section className="search-panel" aria-label="Conference search controls">
      <form
        className="search-bar"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <label htmlFor="conference-search">Search term</label>
        <div className="search-input-wrap">
          <Search aria-hidden="true" size={19} />
          <input
            id="conference-search"
            value={draftQuery}
            onChange={(event) => onDraftQueryChange(event.target.value)}
            placeholder="Try arts-based research, Lisbon, CFP..."
            type="search"
          />
        </div>
        <button className="button primary" type="submit" disabled={isLoading}>
          <RotateCcw aria-hidden="true" size={18} />
          <span>{isLoading ? "Reloading" : "Search / Reload results"}</span>
        </button>
      </form>

      <div className="filter-grid">
        <details className="category-menu" open>
          <summary>
            <span>
              <SlidersHorizontal aria-hidden="true" size={18} />
              Categories
            </span>
            <span className="count-pill">{selectedCount} selected</span>
          </summary>
          <div className="category-actions" aria-label="Category actions">
            <button
              className="button ghost"
              type="button"
              onClick={() => updateFilter("selectedCategories", [...CATEGORIES])}
            >
              <Check aria-hidden="true" size={17} />
              <span>Select all</span>
            </button>
            <button className="button ghost" type="button" onClick={() => updateFilter("selectedCategories", [])}>
              <X aria-hidden="true" size={17} />
              <span>Clear all</span>
            </button>
          </div>
          <fieldset className="category-options">
            <legend className="sr-only">Conference fields and genres</legend>
            {CATEGORIES.map((category) => (
              <label key={category} className="check-row">
                <input
                  type="checkbox"
                  checked={filters.selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </fieldset>
        </details>

        <div className="control-stack">
          <label htmlFor="continent-filter">Continent</label>
          <select
            id="continent-filter"
            value={filters.continent}
            onChange={(event) => updateFilter("continent", event.target.value)}
          >
            <option>All continents</option>
            <option>Europe</option>
            {CONTINENTS.filter((continent) => continent !== "Europe").map((continent) => (
              <option key={continent}>{continent}</option>
            ))}
          </select>
        </div>

        <div className="control-stack">
          <label htmlFor="country-filter">Country</label>
          <select
            id="country-filter"
            value={filters.country}
            onChange={(event) => updateFilter("country", event.target.value)}
          >
            {countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </div>

        <div className="control-stack">
          <label htmlFor="sort-filter">Sort by</label>
          <select
            id="sort-filter"
            value={filters.sortMode}
            onChange={(event) => updateFilter("sortMode", event.target.value as SortMode)}
          >
            <option value="soonest">Soonest conference date</option>
            <option value="cfpDeadline">CFP deadline</option>
            <option value="country">Country</option>
            <option value="relevance">Relevance</option>
          </select>
        </div>

        <div className="control-stack">
          <label htmlFor="start-date">From</label>
          <input
            id="start-date"
            type="date"
            value={filters.startDate}
            onChange={(event) => updateFilter("startDate", event.target.value)}
          />
        </div>

        <div className="control-stack">
          <label htmlFor="end-date">Until</label>
          <input
            id="end-date"
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter("endDate", event.target.value)}
          />
        </div>

        <label className="check-row date-unknown">
          <input
            type="checkbox"
            checked={filters.includeUnknownDates}
            onChange={(event) => updateFilter("includeUnknownDates", event.target.checked)}
          />
          <span>Include unknown dates</span>
        </label>
      </div>

      <div className="filter-footer">
        <p>
          Showing <strong>{resultCount}</strong> conference{resultCount === 1 ? "" : "s"}. Data refreshed{" "}
          <time dateTime={dataUpdatedAt}>{new Date(dataUpdatedAt).toLocaleDateString()}</time>.
        </p>
        <button className="button secondary" type="button" onClick={onReset}>
          Reset filters
        </button>
      </div>
    </section>
  );
}
