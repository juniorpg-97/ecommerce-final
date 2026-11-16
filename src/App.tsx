import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LayoutCliente from "./componentes/LayoutCliente";
import LayoutStaff from "./componentes/LayoutStaff";
import { RutaProtegida } from "./componentes/RutaProtegida";
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";
import VitrinaPage from "./pages/VitrinaPage";
import CheckoutPage from "./pages/CheckoutPage";
import MisPedidosPage from "./pages/MisPedidosPage";
import DashboardPage from "./pages/DashboardPage";
import ProductosPage from "./pages/ProductosPage";
import NuevoProductoPage from "./pages/NuevoProductoPage";
import POSPage from "./pages/POSPage";
import HistorialVentasPage from "./pages/HistorialVentasPage";
import PedidosPage from "./pages/PedidosPage";
import SinAccesoPage from "./pages/SinAcceso";

const CajerosPage = lazy(() => import("./pages/CajerosPage"));
const AbrirCajaPage = lazy(() => import("./pages/AbrirCajaPage"));
const CerrarCajaPage = lazy(() => import("./pages/CerrarCajaPage"));

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-[#0F172A]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
      <p className="mt-4 text-[#94A3B8]">Cargando módulo...</p>
    </div>
  </div>
);

function App() {
  const verificarSesion = useAuthStore((s) => s.verificarSesion);
  const verificandoSesion = useAuthStore((s) => s.verificandoSesion);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  if (verificandoSesion) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
          <p className="mt-4 text-[#94A3B8]">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutCliente />}>
          <Route path="/" element={<VitrinaPage />} />
          <Route path="/registro" element={<RegistroPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sin-acceso" element={<SinAccesoPage />} />
        <Route element={<RutaProtegida rolesPermitidos={["CLIENTE"]} />}>
          <Route element={<LayoutCliente />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>
        </Route>
        <Route
          element={
            <RutaProtegida rolesPermitidos={["ADMINISTRADOR", "CAJERO"]} />
          }
        >
          <Route element={<LayoutStaff />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/productos/nuevo" element={<NuevoProductoPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/historial-ventas" element={<HistorialVentasPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />

            <Route
              element={<RutaProtegida rolesPermitidos={["ADMINISTRADOR"]} />}
            >
              <Route
                path="/cajeros"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CajerosPage />
                  </Suspense>
                }
              />
              <Route
                path="/cajas/abrir"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AbrirCajaPage />
                  </Suspense>
                }
              />
              <Route
                path="/cajas/cerrar"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CerrarCajaPage />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
