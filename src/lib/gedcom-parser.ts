export type GedcomIndividual = {
  id: string;
  name: string;
  gender: "male" | "female" | "unknown";
  birthYear?: number;
  deathYear?: number;
  fatherId?: string;
  motherId?: string;
};

export type GedcomFamily = {
  id: string;
  husbandId?: string;
  wifeId?: string;
  childrenIds: string[];
};

export type GedcomData = {
  individuals: GedcomIndividual[];
  families: GedcomFamily[];
};

export function parseGedcom(gedcomText: string): GedcomData {
  const lines = gedcomText.split(/\r?\n/);
  const individuals = new Map<string, GedcomIndividual>();
  const families = new Map<string, GedcomFamily>();

  let currentEntity: "INDI" | "FAM" | null = null;
  let currentId = "";
  let currentContext = "";

  for (const line of lines) {
    if (!line.trim()) continue;

    // Parse level, tag, and value. Example: "0 @I1@ INDI" or "1 NAME John /Doe/"
    const match = line.match(/^(\d+)\s+(@\S+@\s+)?([A-Z0-9_]+)(\s+(.*))?$/);
    if (!match) continue;

    const level = parseInt(match[1]);
    const idMatch = match[2]?.trim(); // e.g., "@I1@"
    const tag = match[3];
    const value = match[5]?.trim() || "";

    if (level === 0) {
      currentContext = "";
      if (tag === "INDI" && idMatch) {
        currentEntity = "INDI";
        currentId = idMatch;
        individuals.set(currentId, {
          id: currentId,
          name: "Unknown",
          gender: "unknown",
        });
      } else if (tag === "FAM" && idMatch) {
        currentEntity = "FAM";
        currentId = idMatch;
        families.set(currentId, {
          id: currentId,
          childrenIds: [],
        });
      } else {
        currentEntity = null;
      }
    } else if (level === 1 && currentEntity === "INDI") {
      const indi = individuals.get(currentId)!;
      if (tag === "NAME") indi.name = value.replace(/\//g, "").trim();
      else if (tag === "SEX")
        indi.gender =
          value === "M" ? "male" : value === "F" ? "female" : "unknown";
      else if (tag === "BIRT" || tag === "DEAT") currentContext = tag;
    } else if (level === 2 && currentEntity === "INDI") {
      const indi = individuals.get(currentId)!;
      if (tag === "DATE") {
        const yearMatch = value.match(/\b(\d{4})\b/);
        if (yearMatch) {
          if (currentContext === "BIRT")
            indi.birthYear = parseInt(yearMatch[1]);
          if (currentContext === "DEAT")
            indi.deathYear = parseInt(yearMatch[1]);
        }
      }
    } else if (level === 1 && currentEntity === "FAM") {
      const fam = families.get(currentId)!;
      if (tag === "HUSB") fam.husbandId = value;
      else if (tag === "WIFE") fam.wifeId = value;
      else if (tag === "CHIL") fam.childrenIds.push(value);
    }
  }

  // Link parents to children based on families
  for (const fam of Array.from(families.values())) {
    for (const childId of fam.childrenIds) {
      const child = individuals.get(childId);
      if (child) {
        if (fam.husbandId) child.fatherId = fam.husbandId;
        if (fam.wifeId) child.motherId = fam.wifeId;
      }
    }
  }

  return {
    individuals: Array.from(individuals.values()),
    families: Array.from(families.values()),
  };
}
