export default function PanelCard({ title, value, icon: Icon, help }) {
  return (
    <article className="rounded-3xl border border-green-100 bg-white p-4 shadow-lg shadow-green-100/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-green-800">{title}</p>
          <p className="mt-2 font-display text-2xl font-bold text-green-950">{value}</p>
          {help ? <p className="mt-1 text-xs text-green-700">{help}</p> : null}
        </div>
        <div className="rounded-2xl bg-green-100 p-2 text-green-700">
          <Icon size={18} />
        </div>
      </div>
    </article>
  );
}
