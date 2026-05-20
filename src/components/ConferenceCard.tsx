import { Bookmark, BookmarkCheck, CalendarDays, ExternalLink, MapPin, NotebookPen } from "lucide-react";
import type { Conference } from "../types";
import { formatDate, formatDateRange } from "../lib/dates";

type ConferenceCardProps = {
  conference: Conference;
  isSaved: boolean;
  note: string;
  onToggleBookmark: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
};

const statusLabels = {
  open: "CFP open",
  upcoming: "CFP upcoming",
  closed: "CFP closed",
  unknown: "CFP unknown",
};

export function ConferenceCard({
  conference,
  isSaved,
  note,
  onToggleBookmark,
  onUpdateNote,
}: ConferenceCardProps) {
  const BookmarkIcon = isSaved ? BookmarkCheck : Bookmark;
  const place = [conference.city, conference.country].filter(Boolean).join(", ") || "Location unknown";

  return (
    <article className="conference-card">
      <div className="card-topline">
        <span className={`status status-${conference.submissionStatus}`}>
          {statusLabels[conference.submissionStatus]}
        </span>
        <button
          className="icon-button"
          type="button"
          aria-label={isSaved ? `Remove ${conference.title} from saved conferences` : `Save ${conference.title}`}
          aria-pressed={isSaved}
          onClick={() => onToggleBookmark(conference.id)}
        >
          <BookmarkIcon aria-hidden="true" size={19} />
        </button>
      </div>

      <h3>{conference.title}</h3>

      <dl className="card-facts">
        <div>
          <dt>
            <CalendarDays aria-hidden="true" size={16} />
            Dates
          </dt>
          <dd>{formatDateRange(conference.startDate, conference.endDate)}</dd>
        </div>
        <div>
          <dt>
            <MapPin aria-hidden="true" size={16} />
            Place
          </dt>
          <dd>
            {place}
            {conference.continent ? <span> / {conference.continent}</span> : null}
          </dd>
        </div>
      </dl>

      <p className="description">{conference.description}</p>

      <div className="tag-list" aria-label="Conference categories">
        {conference.categories.map((category) => (
          <span key={category}>{category}</span>
        ))}
      </div>

      <div className="deadline">
        <span>CFP deadline</span>
        <strong>{formatDate(conference.cfpDeadline)}</strong>
      </div>

      <div className="card-links">
        <a href={conference.officialUrl} target="_blank" rel="noreferrer">
          Official link
          <ExternalLink aria-hidden="true" size={15} />
        </a>
        <a href={conference.sourceUrl} target="_blank" rel="noreferrer">
          Source evidence
          <ExternalLink aria-hidden="true" size={15} />
        </a>
      </div>

      <details className="note-box" open={Boolean(note)}>
        <summary>
          <NotebookPen aria-hidden="true" size={16} />
          {note ? "Edit note" : "Add note"}
        </summary>
        <label className="sr-only" htmlFor={`note-${conference.id}`}>
          Personal note for {conference.title}
        </label>
        <textarea
          id={`note-${conference.id}`}
          value={note}
          onChange={(event) => onUpdateNote(conference.id, event.target.value)}
          placeholder="Travel grant math, co-author plans, coffee intel..."
          rows={3}
        />
      </details>
    </article>
  );
}
