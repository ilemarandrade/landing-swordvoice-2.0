export function formatExperience(years: number): string {
  if (years === 0) return "Menos de un año de experiencia";
  if (years === 1) return "1 año de experiencia";
  return `${years} años de experiencia`;
}
