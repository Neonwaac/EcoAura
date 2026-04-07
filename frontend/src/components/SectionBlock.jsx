export default function SectionBlock({ title, subtitle, children, actions }) {
  return (
    <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-lg shadow-green-100/40 md:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-green-950">{title}</h2>
          {subtitle ? <p className="text-sm text-green-700">{subtitle}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
