/**
 * `Omit`, but it distributes over a union instead of collapsing it.
 *
 * The built-in `Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`, and `keyof` a
 * union is only the keys *common* to every arm — so `Omit` over a union flattens
 * it into a single object carrying every arm's keys at once. That quietly
 * destroys the mutually-exclusive prop unions in this package
 * (`FieldLabellingProps`, `TextInputProps`, `SelectProps`, …): the result would
 * accept `label` *and* `aria-label` together, then fail to be assignable back to
 * the component that produced it.
 *
 * Reach for this whenever you re-type a component's props — wrapping a control,
 * or narrowing its API:
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
 * `Partial`, distributed over a union — the same hazard as {@link DistributiveOmit}.
 * A plain `Partial<T>` over a union of mutually-exclusive arms produces a single
 * all-optional object in which every arm's props coexist.
 */
export type DistributivePartial<T> = T extends unknown ? Partial<T> : never;
