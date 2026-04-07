import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import PurchasesPage from './pages/PurchasesPage';
import SalesPage from './pages/SalesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/compras" element={<PurchasesPage />} />
          <Route path="/ventas" element={<SalesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
