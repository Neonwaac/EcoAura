export default function PanelCard({ title, value, icon: Icon, help }) {
  return (
    <article className="rounded-3xl border border-green-200 bg-white p-4 shadow-lg shadow-green-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-900">{title}</p>
          <p className="mt-2 font-display text-2xl font-bold text-green-950">{value}</p>
          {help ? <p className="mt-1 text-xs text-green-800">{help}</p> : null}
        </div>
        <div className="rounded-2xl border border-green-300 bg-green-200 p-2 text-green-900">
          <Icon size={18} />
        </div>
      </div>
    </article>
  );
}
