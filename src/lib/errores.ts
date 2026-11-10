export function mensajeError(
  error: unknown,
  mensajePorDefecto: string,
): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return mensajePorDefecto;
}
