import { useState, useEffect } from "react";
import {
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { pedidoService } from "../services/pedidos";
import { Boton } from "../componentes/ui/Boton";
import type { Pedido, EstadoPedido } from "../types/Pedido";

// ✅ COLORES ACTUALIZADOS PARA MODO OSCURO (Tarjetas)
const ESTADOS_POSIBLES: Record<
  EstadoPedido,
  { label: string; color: string; next?: EstadoPedido }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    next: "PAGADO",
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    next: "EN_PREPARACION",
  },
  EN_PREPARACION: {
    label: "En Preparación",
    color: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    next: "EN_CAMINO",
  },
  EN_CAMINO: {
    label: "En Camino",
    color: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    next: "ENTREGADO",
  },
  ENTREGADO: {
    label: "Entregado",
    color: "bg-green-500/10 text-green-400 border border-green-500/30",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "bg-red-500/10 text-red-400 border border-red-500/30",
  },
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [procesando, setProcesando] = useState<number | null>(null);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const datos = await pedidoService.findAll();
      setPedidos(datos);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleCambiarEstado = async (id: number, nuevoEstado: EstadoPedido) => {
    if (
      !window.confirm(
        `¿Cambiar estado a "${ESTADOS_POSIBLES[nuevoEstado].label}"?`,
      )
    )
      return;

    setProcesando(id);
    try {
      await pedidoService.cambiarEstado(id, nuevoEstado);
      await cargarPedidos(); // Refresca la lista para ver el stock actualizado y nuevo estado
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al cambiar el estado");
    } finally {
      setProcesando(null);
    }
  };

  if (cargando) {
    return (
      <div
        className="flex h-[calc(100vh-8rem)] items-center justify-center"
        style={{ backgroundColor: "#0F172A" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-[#94A3B8]">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 min-h-screen p-6"
      style={{ backgroundColor: "#0F172A" }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F1F5F9] flex items-center gap-2">
          <Package className="text-[#3B82F6]" />
          Cola de Órdenes y Pedidos
        </h1>
        <Boton
          variante="secundario"
          onClick={cargarPedidos}
          className="bg-[#1E293B] hover:bg-[#334155] text-[#F1F5F9] border border-[#475569] font-semibold transition-all"
        >
          🔄 Actualizar
        </Boton>
      </div>

      <div className="bg-[#1E293B] rounded-lg border border-[#334155] shadow-lg overflow-hidden">
        {pedidos.length === 0 ? (
          <div className="text-center py-12 text-[#94A3B8]">
            No hay pedidos registrados.
          </div>
        ) : (
          <div className="divide-y divide-[#334155]">
            {pedidos.map((pedido) => {
              const estadoInfo = ESTADOS_POSIBLES[pedido.estado];
              return (
                <div
                  key={pedido.id}
                  className="p-4 hover:bg-[#0F172A] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-[#F1F5F9]">
                          Pedido #{pedido.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoInfo.color}`}
                        >
                          {estadoInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#94A3B8]">
                        Cliente: {pedido.cliente?.nombre}{" "}
                        {pedido.cliente?.apellido} | Pago: {pedido.metodoPago} |
                        Total:{" "}
                        <span className="font-bold text-[#3B82F6]">
                          S/{Number(pedido.total).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        📍 {pedido.direccion?.calle} {pedido.direccion?.numero},{" "}
                        {pedido.direccion?.ciudad}
                        {pedido.direccion?.referencia &&
                          ` (Ref: ${pedido.direccion.referencia})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {estadoInfo.next && procesando !== pedido.id && (
                        <Boton
                          variante="primario"
                          onClick={() =>
                            handleCambiarEstado(pedido.id, estadoInfo.next!)
                          }
                          className="gap-2 text-sm bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-lg shadow-blue-500/20 transition-all"
                        >
                          {estadoInfo.next === "PAGADO" ? (
                            <CheckCircle size={16} />
                          ) : (
                            <Truck size={16} />
                          )}
                          Marcar como {ESTADOS_POSIBLES[estadoInfo.next].label}
                        </Boton>
                      )}
                      {estadoInfo.next === "PAGADO" &&
                        procesando !== pedido.id && (
                          <button
                            onClick={() =>
                              handleCambiarEstado(pedido.id, "CANCELADO")
                            }
                            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all font-medium"
                          >
                            <XCircle size={16} /> Cancelar
                          </button>
                        )}
                      {procesando === pedido.id && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3B82F6]"></div>
                      )}
                      <button
                        onClick={() =>
                          setExpandido(
                            expandido === pedido.id ? null : pedido.id,
                          )
                        }
                        className="p-2 hover:bg-[#334155] rounded-lg text-[#94A3B8] transition-colors"
                      >
                        {expandido === pedido.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandido === pedido.id && (
                    <div className="mt-4 pt-4 border-t border-[#334155] pl-4">
                      <h4 className="font-semibold text-sm text-[#F1F5F9] mb-2">
                        Productos:
                      </h4>
                      {pedido.detalles.map((det) => (
                        <div
                          key={det.id}
                          className="flex justify-between text-sm py-1 text-[#94A3B8]"
                        >
                          <span>
                            {det.cantidad}x {det.producto.nombre}
                          </span>
                          <span className="font-mono text-[#F1F5F9]">
                            ${Number(det.subtotal).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
