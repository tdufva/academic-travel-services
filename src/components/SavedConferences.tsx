import type { Conference } from "../types";
import { ConferenceCard } from "./ConferenceCard";
import { StatePanel } from "./StatePanel";

type SavedConferencesProps = {
  conferences: Conference[];
  savedIds: string[];
  notes: Record<string, string>;
  onToggleBookmark: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
};

export function SavedConferences({
  conferences,
  savedIds,
  notes,
  onToggleBookmark,
  onUpdateNote,
}: SavedConferencesProps) {
  const saved = conferences.filter((conference) => savedIds.includes(conference.id));

  return (
    <main className="page-section narrow">
      <div className="section-heading">
        <p className="section-number">02</p>
        <h1>Saved Conferences</h1>
        <p>
          Your private shortlist lives in this browser. It is a tiny, local bureau of promising escapes.
        </p>
      </div>

      {saved.length === 0 ? (
        <StatePanel
          state="empty"
          title="No saved conferences yet"
          body="Save a conference from the search page and it will wait here with your notes."
        />
      ) : (
        <div className="results-grid">
          {saved.map((conference) => (
            <ConferenceCard
              key={conference.id}
              conference={conference}
              isSaved
              note={notes[conference.id] ?? ""}
              onToggleBookmark={onToggleBookmark}
              onUpdateNote={onUpdateNote}
            />
          ))}
        </div>
      )}
    </main>
  );
}
