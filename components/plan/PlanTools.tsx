"use client";

/** Download the questions/plan as .txt and print the worksheet. */
export function PlanTools({ text, filename }: { text: string; filename: string }) {
  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="ix-tools no-print">
      <button type="button" className="btn-secondary" onClick={download} data-download>
        Download as .txt
      </button>
      <button type="button" className="btn-ghost" onClick={() => window.print()} data-print>
        Print worksheet
      </button>
    </div>
  );
}
