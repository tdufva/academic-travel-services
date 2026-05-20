import { AlertTriangle, LoaderCircle, SearchX } from "lucide-react";

type StatePanelProps = {
  state: "loading" | "error" | "empty";
  title?: string;
  body?: string;
};

export function StatePanel({ state, title, body }: StatePanelProps) {
  const Icon = state === "loading" ? LoaderCircle : state === "error" ? AlertTriangle : SearchX;
  const fallbackTitle =
    state === "loading"
      ? "Checking the departure board"
      : state === "error"
        ? "The itinerary hit a snag"
        : "No conferences found, which is suspiciously peaceful";
  const fallbackBody =
    state === "loading"
      ? "Fetching conference data and polishing the tiny luggage tags."
      : state === "error"
        ? "The local fallback data is still available. Try reloading, then verify details on official sites."
        : "Try selecting more categories, widening the date range, or switching the continent back to Europe.";

  return (
    <section className={`state-panel state-${state}`} aria-live={state === "loading" ? "polite" : undefined}>
      <Icon aria-hidden="true" size={26} className={state === "loading" ? "spin" : undefined} />
      <h2>{title ?? fallbackTitle}</h2>
      <p>{body ?? fallbackBody}</p>
    </section>
  );
}
