// Owned preview. The repo's Field stories style the raw control with vanilla-extract
// recipes (`formControlRecipe`/`focusRingRecipe`) imported from styling source and
// called at module top level. The design-sync converter bundles previews with esbuild
// (no VE compiler), so importing that story module throws before any story renders —
// the generated Field preview came up root-empty (validate ✗[RENDER]).
//
// This preview reimplements the same stories using only shipped bundle exports,
// reproducing the control's look inline from the exported `vars` token contract (the
// same values `formControlRecipe({ state, size: "md" })` reads) so nothing touches the
// VE runtime. `Field` itself is the real shipped component; only the raw input's skin
// is rebuilt here. Placeholder colour is the recipe's `::placeholder` pseudo, which
// inline style can't set — the control shows the browser-default placeholder, the
// sole intended delta from the storybook reference.
import * as React from "react";
import { Field, Text, vars } from "@saintly-software/baritone";

const FORM_STATES = ["neutral", "warning", "invalid", "valid"] as const;
const LABEL_POSITIONS = ["top", "start", "end"] as const;
type FormState = (typeof FORM_STATES)[number];

const V = vars as any;
const F = Field as any;

const controlStyle = (state: FormState = "neutral"): React.CSSProperties => {
  const c = V.form.color[state];
  return {
    boxSizing: "border-box",
    width: "100%",
    margin: 0,
    height: "2.5rem",
    paddingInline: V.space[3],
    fontFamily: V.font.sans,
    fontSize: V.text.size.md.fontSize,
    color: V.text.color.neutral.high,
    background: c.background,
    borderStyle: "solid",
    borderWidth: V.borderWidth.thin,
    borderColor: c.border,
    borderRadius: V.form.borderRadius,
  };
};

// meta.decorators wraps every story in a 420px column — mirror it for framing parity.
const wrap = (node: React.ReactNode) => <div style={{ maxWidth: 420 }}>{node}</div>;

const renderField = (args: Record<string, unknown> = {}) => {
  const a: any = {
    label: "Email",
    helpText: "We'll never share it.",
    state: "neutral",
    labelPosition: "top",
    fit: "fill",
    required: false,
    disabled: false,
    ...args,
  };
  return wrap(
    <F {...a}>
      <F.Control
        required={a.required}
        style={controlStyle(a.state)}
        placeholder="you@example.com"
      />
    </F>,
  );
};

export const Playground = () => renderField();

export const Basic = () => renderField({ label: "Email", helpText: "We'll never share it." });

export const Invalid = () =>
  renderField({ state: "invalid", helpText: "That doesn't look like an email address." });

export const Inline = () =>
  wrap(
    <div style={{ display: "grid", gap: 24 }}>
      {LABEL_POSITIONS.map((labelPosition) => (
        <F
          key={labelPosition}
          label="Email"
          labelPosition={labelPosition}
          helpText={`labelPosition="${labelPosition}"`}
        >
          <F.Control style={controlStyle("neutral")} placeholder="you@example.com" />
        </F>
      ))}
    </div>,
  );

export const Required = () =>
  renderField({ required: true, helpText: "We'll send your receipt here." });

const STATE_MESSAGE: Record<FormState, string | undefined> = {
  neutral: undefined,
  warning: "This address looks unusual.",
  invalid: "This field is required.",
  valid: undefined,
};
const thStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.6,
  textAlign: "left",
  padding: "16px 20px",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};
const cellStyle: React.CSSProperties = {
  padding: "16px 20px",
  borderTop: "1px solid rgba(128,128,128,0.25)",
  verticalAlign: "top",
};

export const States = () =>
  wrap(
    <table style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>State</th>
          <th style={thStyle}>Field</th>
        </tr>
      </thead>
      <tbody>
        {FORM_STATES.map((state) => (
          <tr key={state}>
            <th scope="row" style={{ ...thStyle, ...cellStyle }}>
              {state}
            </th>
            <td style={cellStyle}>
              <div style={{ maxWidth: 320 }}>
                <F label="Email" state={state} helpText={STATE_MESSAGE[state]}>
                  <F.Control style={controlStyle(state)} placeholder="you@example.com" />
                </F>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>,
  );

export const WithInfo = () =>
  renderField({
    label: "API key",
    helpText: "Starts with sk-.",
    info: (
      <Text render={<p />} size="sm">
        Find your key in Settings → Developer. It's shown only once.
      </Text>
    ),
    slotProps: { info: { "aria-label": "About API keys" } },
  });

export const Naming = () =>
  wrap(
    <div style={{ display: "grid", gap: 24 }}>
      <F label="Visible label" helpText="label — the right answer nearly always.">
        <F.Control style={controlStyle("neutral")} />
      </F>

      <F aria-label="Search" helpText="aria-label — an invisible name.">
        <F.Control aria-label="Search" style={controlStyle("neutral")} placeholder="Search…" />
      </F>

      <>
        <Text render={<p />} id="external-label" size="sm">
          A label living elsewhere on the page
        </Text>
        <F aria-labelledby="external-label" helpText="aria-labelledby — name by reference.">
          <F.Control aria-labelledby="external-label" style={controlStyle("neutral")} />
        </F>
      </>
    </div>,
  );

export const CustomControl = () =>
  wrap(
    <F
      label="Custom control"
      helpText="Wired by hand: nameAttrs + describedBy from the render prop."
    >
      {({ nameAttrs, describedBy }: any) => (
        <div
          role="group"
          {...nameAttrs}
          aria-describedby={describedBy}
          style={{ display: "flex", gap: 8 }}
        >
          <button type="button">One</button>
          <button type="button">Two</button>
        </div>
      )}
    </F>,
  );
