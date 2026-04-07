import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react';
import { api, formatDate, parseCurrency, parseNumber } from '../api/client';
import SectionBlock from '../components/SectionBlock';
import EntityModal from '../components/EntityModal';

const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'Daviplata'];
const paymentStatuses = ['Pagado', 'Pendiente', 'Parcial'];

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [editForm, setEditForm] = useState({
    product_id: '',
    customer_name: '',
    quantity: '',
    unit_price: '',
    payment_method: paymentMethods[0],
    payment_status: paymentStatuses[0],
  });
  const [form, setForm] = useState({
    product_id: '',
    customer_name: '',
    quantity: '',
    unit_price: '',
    payment_method: paymentMethods[0],
    payment_status: paymentStatuses[0],
  });

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === String(form.product_id)),
    [products, form.product_id]
  );

  async function loadData() {
    const [productsResponse, salesResponse] = await Promise.all([api.get('/products'), api.get('/sales')]);
    setProducts(productsResponse.data);
    setSales(salesResponse.data);

    if (!form.product_id && productsResponse.data.length) {
      const first = productsResponse.data[0];
      setForm((prev) => ({
        ...prev,
        product_id: String(first.id),
        unit_price: first.sale_price,
      }));
    }
  }

  useEffect(() => {
    loadData().catch(() => setError('No se pudo cargar la informacion de ventas.'));
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setForm((prev) => ({ ...prev, unit_price: selectedProduct.sale_price }));
    }
  }, [selectedProduct?.id]);

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/sales', {
        product_id: Number(form.product_id),
        customer_name: form.customer_name,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        payment_method: form.payment_method,
        payment_status: form.payment_status,
      });

      setMessage('Venta registrada correctamente.');
      setForm((prev) => ({ ...prev, customer_name: '', quantity: '' }));
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo registrar la venta.');
    }
  }

  async function openSaleModal(mode, saleId) {
    setError('');
    setMessage('');
    try {
      const response = await api.get(`/sales/${saleId}`);
      const current = response.data;
      setSelectedSale(current);
      setEditForm({
        product_id: String(current.product_id),
        customer_name: current.customer_name,
        quantity: String(current.quantity),
        unit_price: String(current.unit_price),
        payment_method: current.payment_method,
        payment_status: current.payment_status,
      });
      setModalMode(mode);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo cargar la venta.');
    }
  }

  function closeModal() {
    setModalMode('');
    setSelectedSale(null);
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!selectedSale) return;

    try {
      await api.put(`/sales/${selectedSale.id}`, {
        product_id: Number(editForm.product_id),
        customer_name: editForm.customer_name,
        quantity: Number(editForm.quantity),
        unit_price: Number(editForm.unit_price),
        payment_method: editForm.payment_method,
        payment_status: editForm.payment_status,
      });

      setMessage('Venta actualizada correctamente.');
      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo actualizar la venta.');
    }
  }

  async function removeSale() {
    if (!selectedSale) return;

    try {
      await api.delete(`/sales/${selectedSale.id}`);
      setMessage('Venta eliminada correctamente.');
      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo eliminar la venta.');
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-green-950 md:text-3xl">Ventas</h1>
        <p className="text-sm font-medium text-green-900">Registra clientes, forma de pago y salida de inventario.</p>
      </div>

      {message ? <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <SectionBlock title="Registrar venta" subtitle="El cliente se crea automaticamente si no existe">
        <form onSubmit={submitForm} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <select
            value={form.product_id}
            onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            required
          >
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            value={form.customer_name}
            onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
            placeholder="Nombre del cliente"
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            required
          />
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            placeholder="Cantidad"
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            required
          />
          <input
            type="number"
            min="0"
            step="100"
            value={form.unit_price}
            onChange={(e) => setForm((prev) => ({ ...prev, unit_price: e.target.value }))}
            placeholder="Precio unitario"
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            required
          />
          <select
            value={form.payment_method}
            onChange={(e) => setForm((prev) => ({ ...prev, payment_method: e.target.value }))}
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <select
            value={form.payment_status}
            onChange={(e) => setForm((prev) => ({ ...prev, payment_status: e.target.value }))}
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <div className="rounded-2xl border border-green-200 bg-green-100/70 px-3 py-2 text-sm text-green-900">
            Stock disponible:{' '}
            <span className="font-bold text-green-950">{parseNumber(selectedProduct?.stock || 0)}</span>
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-100/70 px-3 py-2 text-sm text-green-900">
            Precio sugerido:{' '}
            <span className="font-bold text-green-950">{parseCurrency(selectedProduct?.sale_price || 0)}</span>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <PlusCircle size={16} />
            Guardar venta
          </button>
        </form>
      </SectionBlock>

      <SectionBlock title="Historial de ventas" subtitle="Registro completo por cliente y estado de pago">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-green-200 text-left font-semibold text-green-900">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Producto</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Cantidad</th>
                <th className="py-2 pr-3">Unitario</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Metodo</th>
                <th className="py-2 pr-3">Estado</th>
                <th className="py-2 pr-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-green-50 text-green-900">
                  <td className="py-3 pr-3">{formatDate(sale.created_at)}</td>
                  <td className="py-3 pr-3 font-semibold">{sale.product_name}</td>
                  <td className="py-3 pr-3">{sale.customer_name}</td>
                  <td className="py-3 pr-3">{parseNumber(sale.quantity)}</td>
                  <td className="py-3 pr-3">{parseCurrency(sale.unit_price)}</td>
                  <td className="py-3 pr-3">{parseCurrency(sale.quantity * sale.unit_price)}</td>
                  <td className="py-3 pr-3">{sale.payment_method}</td>
                  <td className="py-3 pr-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        sale.payment_status === 'Pagado'
                          ? 'bg-green-100 text-green-800'
                          : sale.payment_status === 'Parcial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sale.payment_status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openSaleModal('view', sale.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                      <button
                        onClick={() => openSaleModal('edit', sale.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-green-700 px-2 py-1 text-xs font-semibold text-white hover:bg-green-800"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => openSaleModal('delete', sale.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sales.length ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-green-700">
                    Aun no hay ventas registradas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionBlock>

      <EntityModal
        open={Boolean(modalMode && selectedSale)}
        title={
          modalMode === 'view'
            ? 'Detalle de venta'
            : modalMode === 'edit'
              ? 'Editar venta'
              : 'Eliminar venta'
        }
        subtitle={selectedSale ? `Registro #${selectedSale.id}` : ''}
        onClose={closeModal}
        footer={
          modalMode === 'edit' ? (
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="rounded-xl border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-950 hover:bg-green-50">
                Cancelar
              </button>
              <button
                onClick={submitEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <Save size={15} />
                Guardar cambios
              </button>
            </div>
          ) : modalMode === 'delete' ? (
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="rounded-xl border border-green-300 bg-white px-3 py-2 text-sm font-semibold text-green-950 hover:bg-green-50">
                Cancelar
              </button>
              <button
                onClick={removeSale}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          ) : null
        }
      >
        {modalMode === 'view' && selectedSale ? (
          <div className="grid gap-2 rounded-2xl bg-green-100/70 p-3 text-sm text-green-950">
            <p><strong>ID:</strong> {selectedSale.id}</p>
            <p><strong>Fecha:</strong> {formatDate(selectedSale.created_at)}</p>
            <p><strong>Producto:</strong> {selectedSale.product_name}</p>
            <p><strong>Cliente:</strong> {selectedSale.customer_name}</p>
            <p><strong>Cantidad:</strong> {parseNumber(selectedSale.quantity)}</p>
            <p><strong>Precio unitario:</strong> {parseCurrency(selectedSale.unit_price)}</p>
            <p><strong>Total:</strong> {parseCurrency(selectedSale.quantity * selectedSale.unit_price)}</p>
            <p><strong>Metodo de pago:</strong> {selectedSale.payment_method}</p>
            <p><strong>Estado:</strong> {selectedSale.payment_status}</p>
          </div>
        ) : null}

        {modalMode === 'edit' ? (
          <form onSubmit={submitEdit} className="grid gap-3 md:grid-cols-2">
            <select
              value={editForm.product_id}
              onChange={(e) => setEditForm((prev) => ({ ...prev, product_id: e.target.value }))}
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
              required
            >
              {products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              value={editForm.customer_name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, customer_name: e.target.value }))}
              placeholder="Nombre del cliente"
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
              required
            />
            <input
              type="number"
              min="1"
              value={editForm.quantity}
              onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="Cantidad"
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
              required
            />
            <input
              type="number"
              min="0"
              step="100"
              value={editForm.unit_price}
              onChange={(e) => setEditForm((prev) => ({ ...prev, unit_price: e.target.value }))}
              placeholder="Precio unitario"
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
              required
            />
            <select
              value={editForm.payment_method}
              onChange={(e) => setEditForm((prev) => ({ ...prev, payment_method: e.target.value }))}
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <select
              value={editForm.payment_status}
              onChange={(e) => setEditForm((prev) => ({ ...prev, payment_status: e.target.value }))}
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </form>
        ) : null}

        {modalMode === 'delete' ? (
          <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
            Esta accion eliminara permanentemente la venta seleccionada.
          </p>
        ) : null}
      </EntityModal>
    </div>
  );
}
