import { useState, useEffect } from "react";
import {
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Printer,
  Calendar,
} from "lucide-react";
import { ventaService } from "../services/ventas";
import type { VentaHistorial } from "../types/Venta";

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<VentaHistorial[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [cargando, setCargando] = useState<boolean>(false);
  const [ventaExpandida, setVentaExpandida] = useState<number | null>(null);

  const cargarVentas = async () => {
    setCargando(true);
    try {
      const datos = await ventaService.findAll(fecha, fecha);
      setVentas(datos);
    } catch (err) {
      console.error("Error al cargar ventas:", err);
      alert("Error al cargar el historial de ventas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, [fecha]);

  const handleImprimirVenta = (venta: VentaHistorial) => {
    const ventana = window.open("", "_blank");
    if (!ventana) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante #${venta.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; color: #0F172A; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #334155; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #3B82F6; }
          .info { margin-bottom: 20px; }
          .info p { margin: 5px 0; }
          .items { border-top: 1px solid #334155; border-bottom: 1px solid #334155; padding: 15px 0; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total { text-align: right; font-size: 24px; font-weight: bold; color: #3B82F6; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #64748B; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Voltix.OS</h1>
          <p>Comprobante de Venta #${venta.id}</p>
        </div>
        <div class="info">
          <p><strong>Fecha:</strong> ${new Date(venta.fecha).toLocaleString()}</p>
          <p><strong>Cajero:</strong> ${venta.usuario.nombre} ${venta.usuario.apellido}</p>
          <p><strong>Método de Pago:</strong> ${venta.metodoPago}</p>
        </div>
        <div class="items">
          ${venta.detalles
            .map(
              (d: any) => `
            <div class="item">
              <span>${d.cantidad}x ${d.producto.nombre}</span>
              <span>$${Number(d.subtotal).toFixed(2)}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="total">
          Total: $${Number(venta.totalVenta).toFixed(2)}
        </div>
        <div class="footer">
          <p>Gracias por su compra</p>
          <p>${new Date().getFullYear()} Voltix.OS</p>
        </div>
      </body>
      </html>
    `;

    ventana.document.write(html);
    ventana.document.close();
    ventana.print();
  };

  return (
    <div
      className="space-y-6 min-h-screen p-6"
      style={{ backgroundColor: "#0F172A" }}
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2">
            <ShoppingCart className="text-[#3B82F6]" />
            Historial de Ventas
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Consulta las ventas registradas por fecha
          </p>
        </div>
      </div>

      {/* Filtro de fecha */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-[#F1F5F9]">
            <Calendar size={18} />
            Fecha:
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#334155] bg-[#0F172A] text-[#F1F5F9] focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Cargando ventas...</p>
        </div>
      )}

      {/* Lista de ventas */}
      {!cargando && (
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg overflow-hidden">
          {ventas.length === 0 ? (
            <div className="text-center py-12 text-[#94A3B8]">
              <ShoppingCart size={48} className="mx-auto text-[#64748B] mb-4" />
              <p>No hay ventas registradas para esta fecha</p>
            </div>
          ) : (
            <div className="divide-y divide-[#334155]">
              {ventas.map((venta) => (
                <div
                  key={venta.id}
                  className="p-4 hover:bg-[#0F172A] transition-colors"
                >
                  {/* Resumen de venta */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="font-semibold text-[#F1F5F9]">
                          Venta #{venta.id}
                        </span>
                        <span className="text-sm text-[#94A3B8]">
                          {new Date(venta.fecha).toLocaleString()}
                        </span>
                        <span className="text-sm text-[#94A3B8]">
                          {venta.usuario.nombre} {venta.usuario.apellido}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          {venta.metodoPago}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-[#3B82F6]">
                        S/{Number(venta.totalVenta).toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          setVentaExpandida(
                            ventaExpandida === venta.id ? null : venta.id,
                          )
                        }
                        className="p-2 hover:bg-[#334155] rounded-lg transition-colors text-[#94A3B8]"
                      >
                        {ventaExpandida === venta.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => handleImprimirVenta(venta)}
                        className="p-2 text-[#3B82F6] hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Imprimir"
                      >
                        <Printer size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {ventaExpandida === venta.id && (
                    <div className="mt-4 pt-4 border-t border-[#334155]">
                      <h3 className="font-semibold text-[#F1F5F9] mb-3">
                        Productos:
                      </h3>
                      <div className="space-y-2">
                        {venta.detalles.map((detalle: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-[#94A3B8]">
                              {detalle.cantidad}x {detalle.producto.nombre}
                            </span>
                            <span className="font-mono font-medium text-[#F1F5F9]">
                              S/{Number(detalle.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resumen del día */}
      {!cargando && ventas.length > 0 && (
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-[#94A3B8]">Total de Ventas</p>
              <p className="text-2xl font-bold text-[#3B82F6]">
                {ventas.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Monto Total</p>
              <p className="text-2xl font-bold text-[#3B82F6]">
                S/
                {ventas
                  .reduce((sum, v) => sum + Number(v.totalVenta), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#94A3B8]">Promedio por Venta</p>
              <p className="text-2xl font-bold text-[#3B82F6]">
                S/
                {(
                  ventas.reduce((sum, v) => sum + Number(v.totalVenta), 0) /
                  ventas.length
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
