export const formatToken = (
  raw: string | null | undefined,
  decimals = 18,
): string => {
  if (!raw) return "-";
  let value: bigint;
  try {
    value = BigInt(raw);
  } catch {
    return "-";
  }
  const base = BigInt("10") ** BigInt(decimals);
  const whole = value / base;
  const fraction = value % base;
  if (fraction === BigInt("0")) return whole.toString();
  const fractionStr = fraction.toString().padStart(decimals, "0");
  const trimmed = fractionStr.replace(/0+$/, "");
  return `${whole.toString()}.${trimmed}`;
};

export const parseToken = (
  input: string,
  decimals = 18,
): string | null => {
  if (!input) return null;
  const normalized = input.trim();
  if (!normalized) return null;
  const [wholePart, fracPart] = normalized.split(".");
  const safeWhole = wholePart?.replace(/[^0-9]/g, "") || "0";
  const safeFrac = (fracPart || "").replace(/[^0-9]/g, "");
  if (safeWhole === "" && safeFrac === "") return null;
  const fracPadded = safeFrac.padEnd(decimals, "0").slice(0, decimals);
  try {
    const whole = BigInt(safeWhole || "0");
    const frac = BigInt(fracPadded || "0");
    const base = BigInt("10") ** BigInt(decimals);
    return (whole * base + frac).toString();
  } catch {
    return null;
  }
};
