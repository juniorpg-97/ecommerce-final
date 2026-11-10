import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Layouts y Protección
import LayoutCliente from "./componentes/LayoutCliente";
import LayoutStaff from "./componentes/LayoutStaff";
import { RutaProtegida } from "./componentes/RutaProtegida";

// Páginas de Autenticación
import LoginPage from "./pages/LoginPage";
import RegistroPage from "./pages/RegistroPage";

// Páginas de Cliente
import VitrinaPage from "./pages/VitrinaPage";

// Páginas de Staff
import DashboardPage from "./pages/DashboardPage";
import ProductosPage from "./pages/ProductosPage";
import CajerosPage from "./pages/CajerosPage";
import NuevoProductoPage from "./pages/NuevoProductoPage";
import POSPage from "./pages/POSPage";
import HistorialVentasPage from "./pages/HistorialVentasPage"; // <-- NUEVO

// Páginas Generales
import SinAccesoPage from "./pages/SinAcceso";

function App() {
  const verificarSesion = useAuthStore((s) => s.verificarSesion);
  const verificandoSesion = useAuthStore((s) => s.verificandoSesion);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  if (verificandoSesion) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================================
            1. RUTAS PÚBLICAS (Cliente)
        ====================================================== */}
        <Route element={<LayoutCliente />}>
          <Route path="/" element={<VitrinaPage />} />
          <Route path="/registro" element={<RegistroPage />} />
        </Route>

        {/* ======================================================
            2. RUTAS DE AUTENTICACIÓN (Sin layout)
        ====================================================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sin-acceso" element={<SinAccesoPage />} />

        {/* ======================================================
            3. RUTAS PROTEGIDAS (Staff: ADMIN y CAJERO)
        ====================================================== */}
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

            {/* Rutas SOLO para Administrador (anidadas) */}
            <Route
              element={<RutaProtegida rolesPermitidos={["ADMINISTRADOR"]} />}
            >
              <Route path="/cajeros" element={<CajerosPage />} />
            </Route>
          </Route>
        </Route>

        {/* ======================================================
            4. RUTA COMODÍN
        ====================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
