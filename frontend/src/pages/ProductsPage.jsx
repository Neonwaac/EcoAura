import { useEffect, useState } from 'react';
import { Eye, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react';
import { api, parseCurrency, parseNumber } from '../api/client';
import SectionBlock from '../components/SectionBlock';
import EntityModal from '../components/EntityModal';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', sale_price: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', sale_price: '' });

  async function loadProducts() {
    const response = await api.get('/products');
    setProducts(response.data);
  }

  useEffect(() => {
    loadProducts().catch(() => setError('No se pudo cargar la lista de productos.'));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/products', {
        name: form.name,
        sale_price: Number(form.sale_price),
      });
      setForm({ name: '', sale_price: '' });
      setMessage('Producto creado correctamente.');
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo crear el producto.');
    }
  }

  async function openProductModal(mode, productId) {
    setError('');
    setMessage('');

    try {
      const response = await api.get(`/products/${productId}`);
      const current = response.data;
      setSelectedProduct(current);
      setEditForm({
        name: current.name,
        sale_price: String(current.sale_price),
      });
      setModalMode(mode);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo cargar el producto.');
    }
  }

  function closeModal() {
    setModalMode('');
    setSelectedProduct(null);
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await api.put(`/products/${selectedProduct.id}`, {
        name: editForm.name,
        sale_price: Number(editForm.sale_price),
      });
      setMessage('Producto actualizado correctamente.');
      closeModal();
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo actualizar el producto.');
    }
  }

  async function removeProduct() {
    if (!selectedProduct) return;

    try {
      await api.delete(`/products/${selectedProduct.id}`);
      setMessage('Producto eliminado correctamente.');
      closeModal();
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo eliminar el producto.');
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-green-950 md:text-3xl">Productos</h1>
        <p className="text-sm font-medium text-green-900">Crea productos y define su precio de venta.</p>
      </div>

      {message ? <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <SectionBlock title="Nuevo producto" subtitle="Registra un nuevo item de inventario">
        <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Herbaria extracto de plantas"
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            required
          />
          <input
            type="number"
            min="0"
            step="100"
            value={form.sale_price}
            onChange={(e) => setForm((prev) => ({ ...prev, sale_price: e.target.value }))}
            placeholder="Precio de venta"
            className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
            required
          />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <PlusCircle size={16} />
            Guardar producto
          </button>
        </form>
      </SectionBlock>

      <SectionBlock title="Listado" subtitle="Resumen de stock y rentabilidad por producto">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-green-200 text-left font-semibold text-green-900">
                <th className="py-2 pr-3">Producto</th>
                <th className="py-2 pr-3">Precio venta</th>
                <th className="py-2 pr-3">Compradas</th>
                <th className="py-2 pr-3">Vendidas</th>
                <th className="py-2 pr-3">Stock</th>
                <th className="py-2 pr-3">Utilidad</th>
                <th className="py-2 pr-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-green-50 text-green-900">
                  <td className="py-3 pr-3 font-semibold">{product.name}</td>
                  <td className="py-3 pr-3">{parseCurrency(product.sale_price)}</td>
                  <td className="py-3 pr-3">{parseNumber(product.total_purchased)}</td>
                  <td className="py-3 pr-3">{parseNumber(product.total_sold)}</td>
                  <td className="py-3 pr-3">{parseNumber(product.stock)}</td>
                  <td className="py-3 pr-3">{parseCurrency(product.profit)}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openProductModal('view', product.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                      <button
                        onClick={() => openProductModal('edit', product.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-green-700 px-2 py-1 text-xs font-semibold text-white hover:bg-green-800"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => openProductModal('delete', product.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-green-700">
                    Aun no hay productos registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionBlock>

      <EntityModal
        open={Boolean(modalMode && selectedProduct)}
        title={
          modalMode === 'view'
            ? 'Detalle de producto'
            : modalMode === 'edit'
              ? 'Editar producto'
              : 'Eliminar producto'
        }
        subtitle={selectedProduct?.name}
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
                onClick={removeProduct}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          ) : null
        }
      >
        {modalMode === 'view' && selectedProduct ? (
          <div className="grid gap-2 rounded-2xl bg-green-100/70 p-3 text-sm text-green-950">
            <p><strong>ID:</strong> {selectedProduct.id}</p>
            <p><strong>Producto:</strong> {selectedProduct.name}</p>
            <p><strong>Precio de venta:</strong> {parseCurrency(selectedProduct.sale_price)}</p>
            <p><strong>Unidades compradas:</strong> {parseNumber(selectedProduct.total_purchased)}</p>
            <p><strong>Unidades vendidas:</strong> {parseNumber(selectedProduct.total_sold)}</p>
            <p><strong>Stock:</strong> {parseNumber(selectedProduct.stock)}</p>
            <p><strong>Utilidad estimada:</strong> {parseCurrency(selectedProduct.profit)}</p>
          </div>
        ) : null}

        {modalMode === 'edit' ? (
          <form id="product-edit-form" onSubmit={submitEdit} className="grid gap-3">
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
              placeholder="Nombre del producto"
              required
            />
            <input
              type="number"
              min="0"
              step="100"
              value={editForm.sale_price}
              onChange={(e) => setEditForm((prev) => ({ ...prev, sale_price: e.target.value }))}
              className="rounded-2xl border border-green-300 bg-white px-3 py-2 text-sm text-green-950 outline-none ring-green-600 focus:ring"
              placeholder="Precio de venta"
              required
            />
          </form>
        ) : null}

        {modalMode === 'delete' ? (
          <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
            Esta accion eliminara el producto seleccionado. Si tiene compras o ventas relacionadas, la eliminacion no sera permitida.
          </p>
        ) : null}
      </EntityModal>
    </div>
  );
}
