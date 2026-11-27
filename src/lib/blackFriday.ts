// Products uploaded on/after this moment get the Black Friday label.
export const BLACK_FRIDAY_CUTOFF = new Date("2026-11-26T07:21:00Z");
export const isBlackFridayProduct = (createdAt?: string | null) =>
  !!createdAt && new Date(createdAt) >= BLACK_FRIDAY_CUTOFF;
