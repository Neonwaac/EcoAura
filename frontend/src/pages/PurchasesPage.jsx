import { useEffect, useState } from 'react';
import { Eye, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react';
import { api, formatDate, parseCurrency, parseNumber } from '../api/client';
import SectionBlock from '../components/SectionBlock';
import EntityModal from '../components/EntityModal';

export default function PurchasesPage() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editForm, setEditForm] = useState({
    product_id: '',
    quantity: '',
    purchase_price: '',
    shipping_cost: '',
  });
  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    purchase_price: '',
    shipping_cost: '',
  });

  async function loadData() {
    const [productsResponse, purchasesResponse] = await Promise.all([
      api.get('/products'),
      api.get('/purchases'),
    ]);

    setProducts(productsResponse.data);
    setPurchases(purchasesResponse.data);

    if (!form.product_id && productsResponse.data.length) {
      setForm((prev) => ({ ...prev, product_id: String(productsResponse.data[0].id) }));
    }
  }

  useEffect(() => {
    loadData().catch(() => setError('No se pudo cargar la informacion de compras.'));
  }, []);

  async function submitForm(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/purchases', {
        product_id: Number(form.product_id),
        quantity: Number(form.quantity),
        purchase_price: Number(form.purchase_price),
        shipping_cost: Number(form.shipping_cost || 0),
      });

      setMessage('Compra registrada correctamente.');
      setForm((prev) => ({ ...prev, quantity: '', purchase_price: '', shipping_cost: '' }));
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo registrar la compra.');
    }
  }

  async function openPurchaseModal(mode, purchaseId) {
    setError('');
    setMessage('');
    try {
      const response = await api.get(`/purchases/${purchaseId}`);
      const current = response.data;
      setSelectedPurchase(current);
      setEditForm({
        product_id: String(current.product_id),
        quantity: String(current.quantity),
        purchase_price: String(current.purchase_price),
        shipping_cost: String(current.shipping_cost),
      });
      setModalMode(mode);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo cargar la compra.');
    }
  }

  function closeModal() {
    setModalMode('');
    setSelectedPurchase(null);
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!selectedPurchase) return;

    try {
      await api.put(`/purchases/${selectedPurchase.id}`, {
        product_id: Number(editForm.product_id),
        quantity: Number(editForm.quantity),
        purchase_price: Number(editForm.purchase_price),
        shipping_cost: Number(editForm.shipping_cost || 0),
      });

      setMessage('Compra actualizada correctamente.');
      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo actualizar la compra.');
    }
  }

  async function removePurchase() {
    if (!selectedPurchase) return;

    try {
      await api.delete(`/purchases/${selectedPurchase.id}`);
      setMessage('Compra eliminada correctamente.');
      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo eliminar la compra.');
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-green-950 md:text-3xl">Compras</h1>
        <p className="text-sm text-green-800">Ingresa inventario y registra costos de compra.</p>
      </div>

      {message ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <SectionBlock title="Registrar compra" subtitle="Cantidad, costo y envio por producto">
        <form onSubmit={submitForm} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={form.product_id}
            onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
            className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
            required
          >
            {products.map((product) => (
              <option value={product.id} key={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            placeholder="Cantidad"
            className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
            required
          />
          <input
            type="number"
            min="0"
            step="100"
            value={form.purchase_price}
            onChange={(e) => setForm((prev) => ({ ...prev, purchase_price: e.target.value }))}
            placeholder="Precio compra"
            className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
            required
          />
          <input
            type="number"
            min="0"
            step="100"
            value={form.shipping_cost}
            onChange={(e) => setForm((prev) => ({ ...prev, shipping_cost: e.target.value }))}
            placeholder="Costo envio"
            className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <PlusCircle size={16} />
            Guardar
          </button>
        </form>
      </SectionBlock>

      <SectionBlock title="Historial de compras" subtitle="Movimientos de ingreso de inventario">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-green-100 text-left text-green-700">
                <th className="py-2 pr-3">Fecha</th>
                <th className="py-2 pr-3">Producto</th>
                <th className="py-2 pr-3">Cantidad</th>
                <th className="py-2 pr-3">Precio compra</th>
                <th className="py-2 pr-3">Envio</th>
                <th className="py-2 pr-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-green-50 text-green-900">
                  <td className="py-3 pr-3">{formatDate(purchase.created_at)}</td>
                  <td className="py-3 pr-3 font-semibold">{purchase.product_name}</td>
                  <td className="py-3 pr-3">{parseNumber(purchase.quantity)}</td>
                  <td className="py-3 pr-3">{parseCurrency(purchase.purchase_price)}</td>
                  <td className="py-3 pr-3">{parseCurrency(purchase.shipping_cost)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openPurchaseModal('view', purchase.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-green-200 px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-50"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                      <button
                        onClick={() => openPurchaseModal('edit', purchase.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-green-200 px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-50"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => openPurchaseModal('delete', purchase.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!purchases.length ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-green-700">
                    Aun no hay compras registradas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionBlock>

      <EntityModal
        open={Boolean(modalMode && selectedPurchase)}
        title={
          modalMode === 'view'
            ? 'Detalle de compra'
            : modalMode === 'edit'
              ? 'Editar compra'
              : 'Eliminar compra'
        }
        subtitle={selectedPurchase ? `Registro #${selectedPurchase.id}` : ''}
        onClose={closeModal}
        footer={
          modalMode === 'edit' ? (
            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-green-800">
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
              <button onClick={closeModal} className="rounded-xl border border-green-200 px-3 py-2 text-sm font-semibold text-green-800">
                Cancelar
              </button>
              <button
                onClick={removePurchase}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          ) : null
        }
      >
        {modalMode === 'view' && selectedPurchase ? (
          <div className="grid gap-2 rounded-2xl bg-green-50/60 p-3 text-sm text-green-900">
            <p><strong>ID:</strong> {selectedPurchase.id}</p>
            <p><strong>Fecha:</strong> {formatDate(selectedPurchase.created_at)}</p>
            <p><strong>Producto:</strong> {selectedPurchase.product_name}</p>
            <p><strong>Cantidad:</strong> {parseNumber(selectedPurchase.quantity)}</p>
            <p><strong>Precio compra:</strong> {parseCurrency(selectedPurchase.purchase_price)}</p>
            <p><strong>Envio:</strong> {parseCurrency(selectedPurchase.shipping_cost)}</p>
          </div>
        ) : null}

        {modalMode === 'edit' ? (
          <form onSubmit={submitEdit} className="grid gap-3 md:grid-cols-2">
            <select
              value={editForm.product_id}
              onChange={(e) => setEditForm((prev) => ({ ...prev, product_id: e.target.value }))}
              className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
              required
            >
              {products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={editForm.quantity}
              onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
              placeholder="Cantidad"
              className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
              required
            />
            <input
              type="number"
              min="0"
              step="100"
              value={editForm.purchase_price}
              onChange={(e) => setEditForm((prev) => ({ ...prev, purchase_price: e.target.value }))}
              placeholder="Precio compra"
              className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
              required
            />
            <input
              type="number"
              min="0"
              step="100"
              value={editForm.shipping_cost}
              onChange={(e) => setEditForm((prev) => ({ ...prev, shipping_cost: e.target.value }))}
              placeholder="Costo envio"
              className="rounded-2xl border border-green-200 bg-green-50/40 px-3 py-2 text-sm text-green-900 outline-none ring-green-500 focus:ring"
            />
          </form>
        ) : null}

        {modalMode === 'delete' ? (
          <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
            Esta accion eliminara permanentemente el registro de compra seleccionado.
          </p>
        ) : null}
      </EntityModal>
    </div>
  );
}
