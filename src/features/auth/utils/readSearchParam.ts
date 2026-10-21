// Un parámetro repetido llega como array y uno vacío como "": ambos cuentan como ausentes.
export function readSearchParam(
  value: string | string[] | undefined,
): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
