import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import { pedidoService } from "../services/pedidos";
import type { Pedido } from "../types/Pedido";

// ✅ COLORES ACTUALIZADOS PARA MODO OSCURO (Tarjetas)
const ESTADOS_INFO: Record<
  string,
  { label: string; color: string; icono: any }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    icono: Clock,
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    icono: CheckCircle,
  },
  EN_PREPARACION: {
    label: "En Preparación",
    color: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    icono: Package,
  },
  EN_CAMINO: {
    label: "En Camino",
    color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    icono: Truck,
  },
  ENTREGADO: {
    label: "Entregado",
    color: "bg-green-500/10 text-green-400 border border-green-500/30",
    icono: CheckCircle,
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-500/10 text-red-400 border border-red-500/30",
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
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto py-8 px-4 min-h-screen"
      style={{ backgroundColor: "#0F172A" }}
    >
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-6">Mis Pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-12 bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg">
          <Package size={48} className="mx-auto text-[#94A3B8] mb-4" />
          <p className="text-[#94A3B8]">No tienes pedidos aún.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const info = ESTADOS_INFO[pedido.estado] || ESTADOS_INFO.PENDIENTE;
            const Icono = info.icono;

            return (
              <div
                key={pedido.id}
                className="bg-[#1E293B] rounded-lg border border-[#334155] p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#F1F5F9]">
                      Pedido #{pedido.id}
                    </h3>
                    <p className="text-sm text-[#94A3B8]">
                      {new Date(pedido.creadoEn).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${info.color}`}
                  >
                    <Icono size={14} />
                    {info.label}
                  </span>
                </div>

                <div className="border-t border-[#334155] pt-4">
                  <h4 className="text-sm font-medium text-[#F1F5F9] mb-2">
                    Productos:
                  </h4>
                  <div className="space-y-2">
                    {pedido.detalles.map((detalle) => (
                      <div
                        key={detalle.id}
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

                <div className="border-t border-[#334155] mt-4 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#94A3B8]">Método de pago:</p>
                    <p className="font-medium text-[#F1F5F9]">
                      {pedido.metodoPago}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#94A3B8]">Total:</p>
                    <p className="text-xl font-bold text-[#3B82F6]">
                      S/{Number(pedido.total).toFixed(2)}
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
