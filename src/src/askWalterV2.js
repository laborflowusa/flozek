export function askWalterV2(input) {
  let score = 70;

  const text = input.toLowerCase();

  // Base assumptions
  if (text.includes("tap")) score += 0;
  if (text.includes("bottled")) score += 5;
  if (text.includes("filtered")) score += 10;

  // Penalties
  if (text.includes("chlorine")) score -= 10;
  if (text.includes("lead")) score -= 40;
  if (text.includes("bad smell")) score -= 15;
  if (text.includes("bacteria")) score -= 50;

  score = Math.max(0, Math.min(100, score));

  let grade =
    score >= 90 ? "Excellent" :
    score >= 75 ? "Good" :
    score >= 50 ? "Moderate" :
    "Risky";

  return {
    score,
    grade,
    summary: `Water quality is classified as ${grade.toLowerCase()}.`,
    findings: [],
    explanation: "",
    action: "",
    insight: ""
  };
}
