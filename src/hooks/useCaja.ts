import { useState, useEffect } from "react";
import { cajaService } from "../services/caja";

export function useCaja() {
  const [cajaActiva, setCajaActiva] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerCaja = async () => {
      try {
        const caja = await cajaService.getActiva();
        setCajaActiva(caja);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "No se pudo obtener la caja activa.",
        );
      } finally {
        setCargando(false);
      }
    };
    obtenerCaja();
  }, []);

  return { cajaActiva, cargando, error };
}
