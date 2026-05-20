import { useCallback, useEffect, useMemo, useState } from "react";
import { About } from "./components/About";
import { ConferenceCard } from "./components/ConferenceCard";
import { Layout } from "./components/Layout";
import { Method } from "./components/Method";
import { SavedConferences } from "./components/SavedConferences";
import { SearchFilters } from "./components/SearchFilters";
import { Slogan } from "./components/Slogan";
import { StatePanel } from "./components/StatePanel";
import { CATEGORIES } from "./data/taxonomy";
import { fallbackDataset } from "./data/fallbackDataset";
import { useConferenceStorage } from "./hooks/useConferenceStorage";
import { addYears, toISODate } from "./lib/dates";
import { filterConferences, getCountries } from "./lib/filter";
import type { ConferenceDataset, Filters } from "./types";

type View = "home" | "saved" | "about" | "method";
type LoadState = "loading" | "ready" | "error";

function viewFromHash(): View {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "saved" || hash === "about" || hash === "method") {
    return hash;
  }
  return "home";
}

function createDefaultFilters(): Filters {
  const today = new Date();
  return {
    selectedCategories: [...CATEGORIES],
    country: "All countries",
    continent: "All continents",
    query: "",
    startDate: toISODate(today),
    endDate: toISODate(addYears(today, 2)),
    includeUnknownDates: false,
    sortMode: "soonest",
  };
}

function isConferenceDataset(value: unknown): value is ConferenceDataset {
  return Boolean(
    value &&
      typeof value === "object" &&
      "generatedAt" in value &&
      "items" in value &&
      Array.isArray((value as ConferenceDataset).items),
  );
}

export default function App() {
  const [view, setView] = useState<View>(() => viewFromHash());
  const [dataset, setDataset] = useState<ConferenceDataset>(fallbackDataset);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [filters, setFilters] = useState<Filters>(() => createDefaultFilters());
  const [draftQuery, setDraftQuery] = useState("");
  const { bookmarks, bookmarkSet, notes, toggleBookmark, updateNote } = useConferenceStorage();

  const loadDataset = useCallback(async () => {
    setLoadState("loading");
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}data/conferences.json`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Conference data request failed with ${response.status}`);
      }

      const payload: unknown = await response.json();
      if (!isConferenceDataset(payload)) {
        throw new Error("Conference data did not match the expected shape");
      }

      setDataset(payload);
      setLoadState("ready");
    } catch (error) {
      console.warn(error);
      setDataset(fallbackDataset);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadDataset();
  }, [loadDataset]);

  useEffect(() => {
    const handleHashChange = () => setView(viewFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const title = {
      home: "Academic Travel Services",
      saved: "Saved Conferences | Academic Travel Services",
      about: "About | Academic Travel Services",
      method: "Method / Data | Academic Travel Services",
    }[view];
    document.title = title;
  }, [view]);

  const countries = useMemo(() => getCountries(dataset.items), [dataset.items]);
  const results = useMemo(() => filterConferences(dataset.items, filters), [dataset.items, filters]);

  const resetFilters = useCallback(() => {
    setFilters(createDefaultFilters());
    setDraftQuery("");
  }, []);

  const searchAndReload = useCallback(() => {
    setFilters((current) => ({ ...current, query: draftQuery }));
    void loadDataset();
  }, [draftQuery, loadDataset]);

  const home = (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <h1>Academic Travel Services</h1>
          <Slogan />
          <p>
            A conference discovery desk for scholars, artists, educators, and researchers planning their next
            intellectually defensible trip.
          </p>
        </div>
        <figure className="hero-art">
          <img src={`${import.meta.env.BASE_URL}assets/academic-travel-hero.png`} alt="" />
        </figure>
      </section>

      <SearchFilters
        filters={filters}
        countries={countries}
        draftQuery={draftQuery}
        resultCount={results.length}
        dataUpdatedAt={dataset.generatedAt}
        isLoading={loadState === "loading"}
        onDraftQueryChange={setDraftQuery}
        onFiltersChange={setFilters}
        onSearch={searchAndReload}
        onReset={resetFilters}
      />

      {loadState === "loading" ? <StatePanel state="loading" /> : null}
      {loadState === "error" ? (
        <StatePanel
          state="error"
          title="Live data stayed at the gate"
          body="The site is using bundled demo data for now. Configure a search API secret to let the scheduled workflow refresh real public results."
        />
      ) : null}

      {results.length === 0 && loadState !== "loading" ? <StatePanel state="empty" /> : null}

      {results.length > 0 ? (
        <section className="results-section" aria-label="Conference results">
          <div className="results-grid">
            {results.map((conference) => (
              <ConferenceCard
                key={conference.id}
                conference={conference}
                isSaved={bookmarkSet.has(conference.id)}
                note={notes[conference.id] ?? ""}
                onToggleBookmark={toggleBookmark}
                onUpdateNote={updateNote}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );

  return (
    <Layout view={view}>
      {view === "home" ? home : null}
      {view === "saved" ? (
        <SavedConferences
          conferences={dataset.items}
          savedIds={bookmarks}
          notes={notes}
          onToggleBookmark={toggleBookmark}
          onUpdateNote={updateNote}
        />
      ) : null}
      {view === "about" ? <About /> : null}
      {view === "method" ? <Method generatedAt={dataset.generatedAt} /> : null}
    </Layout>
  );
}
