import { SOURCE_ORDER, SOURCES } from "@/content/sources";

/** Every study and benchmark the homepage cites, linked. Closed by default. */
export function Sources() {
  return (
    <details className="cl-sources" id="sources">
      <summary>Sources</summary>
      <ol>
        {SOURCE_ORDER.map((k) => {
          const s = SOURCES[k];
          return (
            <li key={k}>
              <a href={s.url} rel="noopener" target="_blank">
                {s.authors}, {s.journal && <i>{s.journal}</i>}
                {s.journal && ", "}
                {s.year}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ol>
    </details>
  );
}
