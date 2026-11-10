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
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #1e40af; }
          .info { margin-bottom: 20px; }
          .info p { margin: 5px 0; }
          .items { border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 15px 0; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total { text-align: right; font-size: 24px; font-weight: bold; color: #1e40af; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" />
            Historial de Ventas
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Consulta las ventas registradas por fecha
          </p>
        </div>
      </div>

      {/* Filtro de fecha */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Calendar size={18} />
            Fecha:
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando ventas...</p>
        </div>
      )}

      {/* Lista de ventas */}
      {!cargando && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          {ventas.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShoppingCart size={48} className="mx-auto text-slate-400 mb-4" />
              <p>No hay ventas registradas para esta fecha</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {ventas.map((venta) => (
                <div
                  key={venta.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Resumen de venta */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-slate-900">
                          Venta #{venta.id}
                        </span>
                        <span className="text-sm text-slate-600">
                          {new Date(venta.fecha).toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-600">
                          {venta.usuario.nombre} {venta.usuario.apellido}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {venta.metodoPago}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-slate-900">
                        ${Number(venta.totalVenta).toFixed(2)}
                      </span>
                      <button
                        onClick={() =>
                          setVentaExpandida(
                            ventaExpandida === venta.id ? null : venta.id,
                          )
                        }
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        {ventaExpandida === venta.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => handleImprimirVenta(venta)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Imprimir"
                      >
                        <Printer size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Detalles expandibles */}
                  {ventaExpandida === venta.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-3">
                        Productos:
                      </h3>
                      <div className="space-y-2">
                        {venta.detalles.map((detalle: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-600">
                              {detalle.cantidad}x {detalle.producto.nombre}
                            </span>
                            <span className="font-mono font-medium text-slate-900">
                              ${Number(detalle.subtotal).toFixed(2)}
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
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-600">Total de Ventas</p>
              <p className="text-2xl font-bold text-blue-900">
                {ventas.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Monto Total</p>
              <p className="text-2xl font-bold text-blue-900">
                $
                {ventas
                  .reduce((sum, v) => sum + Number(v.totalVenta), 0)
                  .toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Promedio por Venta</p>
              <p className="text-2xl font-bold text-blue-900">
                $
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
