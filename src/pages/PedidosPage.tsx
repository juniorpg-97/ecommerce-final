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

const ESTADOS_POSIBLES: Record<
  EstadoPedido,
  { label: string; color: string; next?: EstadoPedido }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800",
    next: "PAGADO",
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-blue-100 text-blue-800",
    next: "EN_PREPARACION",
  },
  EN_PREPARACION: {
    label: "En Preparación",
    color: "bg-purple-100 text-purple-800",
    next: "EN_CAMINO",
  },
  EN_CAMINO: {
    label: "En Camino",
    color: "bg-indigo-100 text-indigo-800",
    next: "ENTREGADO",
  },
  ENTREGADO: { label: "Entregado", color: "bg-green-100 text-green-800" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Package className="text-blue-600" />
          Cola de Órdenes y Pedidos
        </h1>
        <Boton variante="secundario" onClick={cargarPedidos}>
          🔄 Actualizar
        </Boton>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {pedidos.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No hay pedidos registrados.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pedidos.map((pedido) => {
              const estadoInfo = ESTADOS_POSIBLES[pedido.estado];
              return (
                <div
                  key={pedido.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-slate-900">
                          Pedido #{pedido.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}
                        >
                          {estadoInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Cliente: {pedido.cliente?.nombre}{" "}
                        {pedido.cliente?.apellido} | Pago: {pedido.metodoPago} |
                        Total:{" "}
                        <span className="font-bold text-slate-900">
                          ${Number(pedido.total).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
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
                          className="gap-2 text-sm"
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
                          <Boton
                            variante="fantasma"
                            onClick={() =>
                              handleCambiarEstado(pedido.id, "CANCELADO")
                            }
                            className="text-red-600 hover:bg-red-50 gap-2 text-sm"
                          >
                            <XCircle size={16} /> Cancelar
                          </Boton>
                        )}
                      {procesando === pedido.id && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      )}
                      <button
                        onClick={() =>
                          setExpandido(
                            expandido === pedido.id ? null : pedido.id,
                          )
                        }
                        className="p-2 hover:bg-slate-200 rounded-lg"
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
                    <div className="mt-4 pt-4 border-t border-slate-200 pl-4">
                      <h4 className="font-semibold text-sm text-slate-900 mb-2">
                        Productos:
                      </h4>
                      {pedido.detalles.map((det) => (
                        <div
                          key={det.id}
                          className="flex justify-between text-sm py-1"
                        >
                          <span>
                            {det.cantidad}x {det.producto.nombre}
                          </span>
                          <span className="font-mono">
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
