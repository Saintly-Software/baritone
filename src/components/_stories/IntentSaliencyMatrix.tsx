import type { CSSProperties, ReactNode } from "react";

// Shared story helper: renders an intent (rows) × saliency (columns) matrix as an
// HTML table, with a diagonal "slash" corner cell labelling both axes. Used by the
// `IntentsAndSaliencies` story of every intent/saliency-driven component so they
// all read as the same matrix. Not part of the published package (excluded from
// the dts build).

const thStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "8px 12px",
  whiteSpace: "nowrap",
  verticalAlign: "bottom",
};

const cellStyle: CSSProperties = {
  padding: "8px 12px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
  verticalAlign: "baseline",
};

interface Props<I extends string, S extends string> {
  intents: readonly I[];
  saliencies: readonly S[];
  /** Renders the cell content for one intent/saliency pair. */
  children: (intent: I, saliency: S) => ReactNode;
  /** Optional extra header cell rendered on each row, before the saliency columns. */
  rowLead?: (intent: I) => ReactNode;
  /** Header label for the {@link rowLead} column. */
  rowLeadLabel?: string;
}

export function IntentSaliencyMatrix<I extends string, S extends string>({
  intents,
  saliencies,
  children,
  rowLead,
  rowLeadLabel,
}: Props<I, S>) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, padding: 0 }}>
              <div
                style={{
                  position: "relative",
                  minWidth: 90,
                  height: 40,
                  background:
                    "linear-gradient(to top right, transparent calc(50% - 0.5px), rgba(128,128,128,0.4), transparent calc(50% + 0.5px))",
                }}
              >
                <span style={{ position: "absolute", top: 4, right: 8 }}>saliency</span>
                <span style={{ position: "absolute", bottom: 4, left: 8 }}>intent</span>
              </div>
            </th>
            {rowLead ? <th style={thStyle}>{rowLeadLabel}</th> : null}
            {saliencies.map((saliency) => (
              <th key={saliency} style={thStyle}>
                {saliency}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {intents.map((intent) => (
            <tr key={intent}>
              <th scope="row" style={{ ...thStyle, ...cellStyle }}>
                {intent}
              </th>
              {rowLead ? <td style={cellStyle}>{rowLead(intent)}</td> : null}
              {saliencies.map((saliency) => (
                <td key={saliency} style={cellStyle}>
                  {children(intent, saliency)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
