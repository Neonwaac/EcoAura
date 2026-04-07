import { X } from 'lucide-react';

export default function EntityModal({ open, title, subtitle, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-green-950/30 p-3 backdrop-blur-sm md:items-center md:justify-center">
      <div className="w-full rounded-3xl border border-green-100 bg-white shadow-2xl shadow-green-900/15 md:max-w-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-green-100 px-4 py-3 md:px-5">
          <div>
            <h3 className="font-display text-xl font-bold text-green-950">{title}</h3>
            {subtitle ? <p className="text-sm text-green-700">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-green-200 p-2 text-green-700 hover:bg-green-50"
            aria-label="Cerrar modal"
          >
            <X size={16} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-4 py-4 md:px-5">{children}</div>

        {footer ? <footer className="border-t border-green-100 px-4 py-3 md:px-5">{footer}</footer> : null}
      </div>
    </div>
  );
}
