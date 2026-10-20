// `?token=a&token=b` llega como array y `?token=` como vacío: ambos son un enlace inválido.
export function readToken(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 200
    ? value
    : null;
}
