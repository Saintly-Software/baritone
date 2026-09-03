/**
 * `Omit`, but it distributes over a union instead of collapsing it.
 *
 * The built-in `Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`, and `keyof` a
 * union only keeps the keys *common* to every arm — so `Omit` flattens a
 * union into one object carrying every arm's keys at once. That destroys the
 * mutually-exclusive prop unions in this package (`FieldLabellingProps`,
 * `TextInputProps`, `SelectProps`, …): the result would accept `label` *and*
 * `aria-label` together, and fail to be assignable back to the component
 * that produced it.
 *
 * Reach for this when re-typing a component's props — wrapping a control, or
 * narrowing its API:
 *
 * ```ts
 * // ✅ stays a union: label XOR aria-label XOR aria-labelledby
 * type MyFieldProps = DistributiveOmit<TextInputProps, "size">;
 *
 * // ❌ collapses: allows label AND aria-label together, and won't spread back
 * type Broken = Omit<TextInputProps, "size">;
 * ```
 */
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * `Partial`, distributed over a union — same hazard as {@link DistributiveOmit}:
 * a plain `Partial<T>` would collapse mutually-exclusive arms into one object.
 */
export type DistributivePartial<T> = T extends unknown ? Partial<T> : never;
