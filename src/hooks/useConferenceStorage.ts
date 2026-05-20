import { useCallback, useEffect, useMemo, useState } from "react";

const BOOKMARKS_KEY = "ats.bookmarks";
const NOTES_KEY = "ats.notes";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useConferenceStorage() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => readJson<string[]>(BOOKMARKS_KEY, []));
  const [notes, setNotes] = useState<Record<string, string>>(() => readJson<Record<string, string>>(NOTES_KEY, {}));

  useEffect(() => {
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((current) =>
      current.includes(id) ? current.filter((bookmark) => bookmark !== id) : [...current, id],
    );
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    setNotes((current) => {
      const next = { ...current };
      if (note.trim()) {
        next[id] = note;
      } else {
        delete next[id];
      }
      return next;
    });
  }, []);

  return {
    bookmarks,
    bookmarkSet,
    notes,
    toggleBookmark,
    updateNote,
  };
}
