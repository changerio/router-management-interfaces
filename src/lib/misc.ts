export function findPathWithValue(ob: any, value: any, prefix = ""): string | undefined {
  if (ob === value) return prefix;
  if (typeof value === "string" && typeof ob === "string" && value.toLowerCase() === ob.toLowerCase()) return prefix;

  if (typeof ob === "object") {
    for (const key in ob) {
      const path = findPathWithValue(ob[key], value, prefix ? `${prefix}.${key}` : key);
      if (path) return path;
    }
  }

  return undefined;
}
