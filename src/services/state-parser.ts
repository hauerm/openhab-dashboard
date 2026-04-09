export type ParsedStateKind = "numeric" | "undef" | "null" | "unknown";

export interface ParsedItemState {
  raw: string;
  kind: ParsedStateKind;
  numericValue: number | null;
}

export const parseOpenHABState = (rawValue: string): ParsedItemState => {
  const raw = rawValue.trim();

  if (raw === "UNDEF") {
    return { raw, kind: "undef", numericValue: null };
  }

  if (raw === "NULL" || raw === "-") {
    return { raw, kind: "null", numericValue: null };
  }

  const numericValue = parseFloat(raw);
  if (!Number.isNaN(numericValue)) {
    return { raw, kind: "numeric", numericValue };
  }

  return { raw, kind: "unknown", numericValue: null };
};
