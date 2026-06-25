export type ClassValue = string | false | null | undefined;

/** Minimal classname joiner. No dedupe — last-wins is the consumer's job. */
export function cx(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
