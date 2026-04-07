import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, DollarSign, Leaf, PackageOpen, TrendingUp } from 'lucide-react';
import { api, parseCurrency, parseNumber } from '../api/client';
import PanelCard from '../components/PanelCard';
import SectionBlock from '../components/SectionBlock';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const byProduct = data?.byProduct || [];

  const chartData = useMemo(
    () =>
      byProduct.map((item) => ({
        producto: item.name,
        ventas: Number(item.revenue || 0),
        utilidad: Number(item.profit || 0),
        stock: Number(item.stock || 0),
      })),
    [byProduct]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/dashboard');
        setData(response.data);
      } catch (_error) {
        setError('No se pudo cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function exportSales() {
    try {
      const response = await api.get('/reports/sales');
      const rows = response.data.rows || [];

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
      XLSX.writeFile(workbook, `reporte_ventas_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (_error) {
      setError('No se pudo exportar el reporte de ventas.');
    }
  }

  async function exportSummary() {
    try {
      const response = await api.get('/reports/summary');
      const summary = response.data;

      const resumeRows = [
        { indicador: 'Total ventas', valor: Number(summary.totalSales || 0) },
        { indicador: 'Utilidad total', valor: Number(summary.totalProfit || 0) },
        { indicador: 'Unidades vendidas', valor: Number(summary.unitsSold || 0) },
        { indicador: 'Unidades disponibles', valor: Number(summary.unitsAvailable || 0) },
      ];

      const productsRows = (summary.byProduct || []).map((product) => ({
        producto: product.name,
        precio_venta: product.sale_price,
        compradas: product.total_purchased,
        vendidas: product.total_sold,
        stock: product.stock,
        ventas: product.revenue,
        utilidad: product.profit,
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumeRows), 'Resumen');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(productsRows), 'Productos');
      XLSX.writeFile(workbook, `resumen_negocio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (_error) {
      setError('No se pudo exportar el resumen.');
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-green-950 md:text-3xl">Dashboard</h1>
        <p className="text-sm font-medium text-green-900">Visibilidad total del negocio en tiempo real.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <PanelCard title="Ventas" value={loading ? '...' : parseCurrency(data?.totalSales)} icon={DollarSign} />
        <PanelCard title="Utilidad" value={loading ? '...' : parseCurrency(data?.totalProfit)} icon={TrendingUp} />
        <PanelCard title="Unidades vendidas" value={loading ? '...' : parseNumber(data?.unitsSold)} icon={Leaf} />
        <PanelCard title="Stock disponible" value={loading ? '...' : parseNumber(data?.unitsAvailable)} icon={PackageOpen} />
      </div>

      <SectionBlock
        title="Reportes"
        subtitle="Exporta ventas y resumen del negocio en Excel"
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportSales}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
            >
              <Download size={16} />
              Ventas
            </button>
            <button
              onClick={exportSummary}
              className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-950 hover:bg-green-100"
            >
              <Download size={16} />
              Resumen
            </button>
          </div>
        }
      >
        <p className="text-sm text-green-800">Descarga tus reportes para control financiero y seguimiento de inventario.</p>
      </SectionBlock>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <SectionBlock title="Ventas por producto" subtitle="Comparativo de ingresos por linea">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="producto" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => parseCurrency(value)} />
                <Bar dataKey="ventas" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionBlock>

        <SectionBlock title="Utilidad estimada" subtitle="Rentabilidad dinamica por producto">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#15803d" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="producto" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => parseCurrency(value)} />
                <Area type="monotone" dataKey="utilidad" stroke="#15803d" fill="url(#gain)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
