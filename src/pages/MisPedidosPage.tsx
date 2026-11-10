import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { pedidoService } from "../services/pedidos";
import type { Pedido } from "../types/Pedido";

const ESTADOS_INFO: Record<
  string,
  { label: string; color: string; icono: any }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    icono: Clock,
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-800",
    icono: CheckCircle,
  },
  EN_PREPARACION: {
    label: "En Preparación",
    color: "bg-purple-100 text-purple-800",
    icono: Package,
  },
  EN_CAMINO: {
    label: "En Camino",
    color: "bg-indigo-100 text-indigo-800",
    icono: Truck,
  },
  ENTREGADO: {
    label: "Entregado",
    color: "bg-green-100 text-green-800",
    icono: CheckCircle,
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800",
    icono: XCircle,
  },
};

export default function MisPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const datos = await pedidoService.findMisPedidos();
        setPedidos(datos);
      } catch (err) {
        console.error("Error al cargar pedidos:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarPedidos();
  }, []);

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Package size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No tienes pedidos aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const info = ESTADOS_INFO[pedido.estado] || ESTADOS_INFO.PENDIENTE;
            const Icono = info.icono;

            return (
              <div
                key={pedido.id}
                className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Pedido #{pedido.id}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {new Date(pedido.creadoEn).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${info.color}`}
                  >
                    <Icono size={14} />
                    {info.label}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">
                    Productos:
                  </h4>
                  <div className="space-y-2">
                    {pedido.detalles.map((detalle) => (
                      <div
                        key={detalle.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-slate-600">
                          {detalle.cantidad}x {detalle.producto.nombre}
                        </span>
                        <span className="font-mono font-medium">
                          ${Number(detalle.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-600">Método de pago:</p>
                    <p className="font-medium">{pedido.metodoPago}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total:</p>
                    <p className="text-xl font-bold text-slate-900">
                      ${Number(pedido.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
