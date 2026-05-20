export function About() {
  return (
    <main className="page-section prose-page">
      <div className="section-heading">
        <p className="section-number">03</p>
        <h1>About</h1>
        <p>
          Academic Travel Services is an experimental conference discovery tool for researchers, artists,
          educators, and humanities-adjacent travelers with suspiciously full calendars.
        </p>
      </div>

      <section>
        <h2>What It Does</h2>
        <p>
          The site combines a static, GitHub Pages-friendly frontend with a scheduled data refresh workflow.
          That keeps the browser fast and avoids brittle client-side scraping. Filters run locally, bookmarks
          and notes stay in localStorage, and every conference card points back to source evidence.
        </p>
      </section>

      <section>
        <h2>Please Verify</h2>
        <p>
          Conference locations, formats, fees, CFP deadlines, and submission portals can change without much
          ceremony. Treat this as a discovery layer, then confirm details on official conference websites before
          booking travel or sending an abstract into the void.
        </p>
      </section>
    </main>
  );
}
