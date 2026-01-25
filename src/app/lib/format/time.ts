import moment from "moment";

export const formatDuration = (
  rawSeconds: string | null | undefined,
): string => {
  if (!rawSeconds) return "-";
  let value: bigint;
  try {
    value = BigInt(rawSeconds);
  } catch {
    return "-";
  }
  if (value === 0n) return "0 seconds";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return "-";
  return moment.duration(seconds, "seconds").humanize();
};

export const formatTimestamp = (
  rawSeconds: string | null | undefined,
): string => {
  if (!rawSeconds) return "-";
  let value: bigint;
  try {
    value = BigInt(rawSeconds);
  } catch {
    return "-";
  }
  if (value === 0n) return "-";
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) return "-";
  return moment.unix(seconds).format("YYYY-MM-DD HH:mm:ss");
};
