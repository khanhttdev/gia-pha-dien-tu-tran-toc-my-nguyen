"use server";

import { createClient } from "./supabase-server";
import { GedcomData } from "./gedcom-parser";
import { revalidatePath } from "next/cache";

export async function importGedcomAction(data: GedcomData) {
  const supabase = await createClient();

  // Mapping from GEDCOM ID (e.g. @I1@) to Supabase UUID
  const idMap = new Map<string, string>();

  let totalInserted = 0;
  let totalSkipped = 0;

  // 1. Process individuals
  for (const indi of data.individuals) {
    // Find existing match by name
    const query = supabase
      .from("members")
      .select("id, metadata")
      .eq("full_name", indi.name)
      .limit(1);

    const { data: existing } = await query;

    let memberId = "";

    // If found an existing member with same name
    if (existing && existing.length > 0) {
      // Edge case handling: Skip / Overwrite
      // Here we skip inserting a new member to avoid duplicates
      memberId = existing[0].id;
      totalSkipped++;

      // Optional: Merge/Overwrite metadata if needed
      // For now, we just skip completely as requested
    } else {
      // Insert new member
      const metadata: any = { source: "GEDCOM Import" };
      if (indi.birthYear) metadata.birth_year = indi.birthYear;
      if (indi.deathYear) {
        metadata.death_year = indi.deathYear;
        metadata.is_alive = false;
      }

      const { data: newMember, error } = await supabase
        .from("members")
        .insert({
          full_name: indi.name,
          gender: indi.gender === "unknown" ? "male" : indi.gender,
          generation_level: 99, // GEDCOM doesn't have generation levels naturally, set to 99 marking unassigned
          metadata,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error inserting member:", error);
        continue;
      }
      memberId = newMember.id;
      totalInserted++;
    }
    idMap.set(indi.id, memberId);
  }

  // 2. Process families to link father_id and spouses
  for (const fam of data.families) {
    const husbandUuid = fam.husbandId ? idMap.get(fam.husbandId) : null;
    const wifeUuid = fam.wifeId ? idMap.get(fam.wifeId) : null;

    // Link children to parents
    for (const childId of fam.childrenIds) {
      const childUuid = idMap.get(childId);
      // By convention in patrilineal families, husband is the father_id link.
      // If the mother is the clan member, this would need adjusting.
      if (childUuid && husbandUuid) {
        await supabase
          .from("members")
          .update({ father_id: husbandUuid })
          .eq("id", childUuid);
      }
    }

    // Add wife to spouses table if she was processed
    if (husbandUuid && wifeUuid) {
      const wifeIndi = data.individuals.find((i) => i.id === fam.wifeId);
      if (wifeIndi) {
        // Check if already spouse
        const { data: existingSpouse } = await supabase
          .from("spouses")
          .select("id")
          .eq("member_id", husbandUuid)
          .eq("full_name", wifeIndi.name);

        if (!existingSpouse || existingSpouse.length === 0) {
          const sMetadata: any = { source: "GEDCOM Import" };
          if (wifeIndi.birthYear) sMetadata.birth_year = wifeIndi.birthYear;
          if (wifeIndi.deathYear) {
            sMetadata.death_year = wifeIndi.deathYear;
            sMetadata.is_alive = false;
          }

          await supabase.from("spouses").insert({
            member_id: husbandUuid,
            full_name: wifeIndi.name,
            role_type: "Vợ", // default role
            metadata: sMetadata,
          });
        }
      }
    }
  }

  revalidatePath("/tree");
  revalidatePath("/people");

  return {
    success: true,
    message: `Import thành công. Thêm mới ${totalInserted} người, bỏ qua ${totalSkipped} người trùng lặp.`,
  };
}
