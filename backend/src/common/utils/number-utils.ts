export const scalePrice = (value: number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value.toFixed(2));
};

export const scaleQuantity = (
  value: number | null | undefined,
): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value.toFixed(3));
};

export const scaleThreshold = (
  value: number | null | undefined,
): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value.toFixed(3));
};
