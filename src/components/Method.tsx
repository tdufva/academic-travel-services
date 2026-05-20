import { CATEGORIES } from "../data/taxonomy";

type MethodProps = {
  generatedAt: string;
};

export function Method({ generatedAt }: MethodProps) {
  return (
    <main className="page-section prose-page">
      <div className="section-heading">
        <p className="section-number">04</p>
        <h1>Method / Data</h1>
        <p>
          A transparent little engine: public searches happen in GitHub Actions, the frontend reads a JSON file,
          and uncertain values stay unknown.
        </p>
      </div>

      <section>
        <h2>Refresh Workflow</h2>
        <p>
          A scheduled GitHub Actions workflow runs the update script weekly and can also be launched manually.
          The script searches configured providers for conference and CFP pages, prefers official sources where
          possible, deduplicates by title and URL, normalizes fields, and commits updated data back to the repo.
        </p>
        <p>
          Last dataset refresh: <time dateTime={generatedAt}>{new Date(generatedAt).toLocaleString()}</time>.
        </p>
        <a className="text-link" href={`${import.meta.env.BASE_URL}data/conferences.json`} target="_blank" rel="noreferrer">
          Open the JSON data file
        </a>
      </section>

      <section>
        <h2>Tracked Fields</h2>
        <ul className="field-list">
          <li>title</li>
          <li>startDate / endDate</li>
          <li>city, country, continent</li>
          <li>categories</li>
          <li>description</li>
          <li>cfpDeadline</li>
          <li>submissionStatus</li>
          <li>officialUrl and sourceUrl</li>
          <li>lastChecked</li>
        </ul>
      </section>

      <section>
        <h2>Tracked Fields / Genres</h2>
        <div className="tag-list large">
          {CATEGORIES.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
