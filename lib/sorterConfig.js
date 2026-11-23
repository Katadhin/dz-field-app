// The sorter's rulebook. Edit this file to tune how notes get sorted, then
// commit and let Render redeploy. This is the "fix the instructions, not the
// results" lever: when the sorter mislabels something, change the wording or
// the lists here, not the saved output.

// The kinds of statement the sorter can tag. Keep them few and clear.
export const LABELS = [
  { name: "out_of_stock", when: "a product is out, low, or not on the shelf" },
  { name: "conversation", when: "something a store person said or agreed to" },
  { name: "issue", when: "a problem: pricing, placement, damage, a missed reset" },
  { name: "win", when: "something good: a display up, an order placed, a good reset" },
  { name: "request", when: "something the rep or store needs followed up" },
  { name: "other", when: "anything useful that does not fit the labels above" },
];

// The brands dz reps cover. EDIT THIS to your real vendor list. The sorter tags
// each entry to one of these, or to "unknown" when it cannot tell.
export const VENDORS = [
  "Bar-S",
  "Oscar Mayer",
  "Hillshire Farm",
  "Johnsonville",
  "unknown",
];

const INSTRUCTIONS = `You sort a retail rep's spoken visit note into separate entries.

A rep walks a grocery store for several brands and then talks or types a note. Your job is to split that note into clean, separate statements and tag each one.

Rules:
- Split the note into one entry per distinct thing the rep reported. One sentence can hold two entries if it covers two things.
- For each entry, choose exactly one label from the label list and one vendor from the vendor list. Use "unknown" for the vendor only when you truly cannot tell.
- rep_words is the rep's own words for that entry, lightly cleaned of filler but never reworded or summarized. Keep their meaning and their phrasing.
- confidence is 0 to 1: how sure you are of the label and vendor for that entry.
- Never invent a number, a count, a store, or a fact that is not in the note. If the rep did not say it, it is not an entry.
- If the note has nothing useful in it, return no entries.`;

export function buildSystem(corrections = []) {
  const labelList = LABELS.map((l) => `- ${l.name}: ${l.when}`).join("\n");
  const vendorList = VENDORS.map((v) => `- ${v}`).join("\n");
  let sys = `${INSTRUCTIONS}\n\nLABELS:\n${labelList}\n\nVENDORS:\n${vendorList}`;
  if (corrections.length) {
    const ex = corrections
      .slice(0, 30)
      .map((c) => `Note said: "${c.rep_words}" -> label: ${c.label}, vendor: ${c.vendor}`)
      .join("\n");
    sys += `\n\nCORRECTIONS the admin has made before. Follow these patterns:\n${ex}`;
  }
  return sys;
}
