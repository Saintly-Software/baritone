export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type DistributivePartial<T> = T extends unknown ? Partial<T> : never;
