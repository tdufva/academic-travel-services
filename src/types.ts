export type SubmissionStatus = "open" | "upcoming" | "closed" | "unknown";

export type Conference = {
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
  submissionStatus: SubmissionStatus;
  officialUrl: string;
  sourceUrl: string;
  lastChecked: string;
};

export type ConferenceDataset = {
  generatedAt: string;
  generatedBy: string;
  notes?: string;
  items: Conference[];
};

export type SortMode = "soonest" | "cfpDeadline" | "country" | "relevance";

export type Filters = {
  selectedCategories: string[];
  country: string;
  continent: string;
  query: string;
  startDate: string;
  endDate: string;
  includeUnknownDates: boolean;
  sortMode: SortMode;
};
