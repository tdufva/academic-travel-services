import { useState } from "react";

const SLOGANS = [
  "Peer review, but make it a getaway.",
  "Where your research agenda needs a passport.",
  "Because 'fieldwork' should occasionally include pastries.",
  "Turning CFP anxiety into itinerary energy.",
  "All aboard the tenure-track express.",
  "Conference tourism, now with footnotes.",
  "Pack lightly. Cite heavily.",
  "Your next keynote could use better coffee.",
  "Academic mobility, minus the reimbursement drama.",
  "Find your people. Lose your luggage. Gain citations.",
  "We search CFPs so you can pretend to write.",
  "Escape your department, professionally.",
  "Because every abstract deserves a destination.",
  "Travel grants sold separately.",
  "A sabbatical mood in a browser tab.",
];

export function Slogan() {
  const [slogan] = useState(() => SLOGANS[Math.floor(Math.random() * SLOGANS.length)]);

  return <p className="slogan">{slogan}</p>;
}
