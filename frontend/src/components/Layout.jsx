import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Box, Leaf, ShoppingCart, Truck } from 'lucide-react';

const menu = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/productos', icon: Box, label: 'Productos' },
  { to: '/compras', icon: Truck, label: 'Compras' },
  { to: '/ventas', icon: ShoppingCart, label: 'Ventas' },
];

function MenuLink({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-green-600 text-white shadow-md' : 'text-green-900 hover:bg-green-100'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#dcfce7,transparent_42%),radial-gradient(circle_at_100%_0%,#bbf7d0,transparent_30%),linear-gradient(180deg,#f7fff9_0%,#f0fdf4_55%,#ffffff_100%)] pb-24 md:pb-0">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-8 pt-4 md:px-8 md:pt-8">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-green-100 bg-white/90 p-4 shadow-xl shadow-green-100/60 backdrop-blur md:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <img src="/ecoaura-logo.jpg" alt="Logo Eco Aura" className="h-12 w-12 object-cover" />
            <div>
              <p className="font-display text-xl font-bold text-green-900">Eco Aura</p>
              <p className="text-xs text-green-700">Gestion de ventas</p>
            </div>
          </div>
          <nav className="space-y-1">
            {menu.map((item) => (
              <MenuLink key={item.to} {...item} />
            ))}
          </nav>
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-4 text-green-50">
            <Leaf className="mb-2" size={20} />
            <p className="text-sm font-semibold">Control simple y natural</p>
            <p className="mt-1 text-xs text-green-100">Monitorea stock, ventas y utilidad en tiempo real.</p>
          </div>
        </aside>

        <main className="w-full">
          <header className="mb-5 rounded-3xl border border-green-100 bg-white/90 px-4 py-3 shadow-md shadow-green-100/50 md:hidden">
            <div className="flex items-center gap-3">
              <img src="/ecoaura-logo.jpg" alt="Logo Eco Aura" className="h-10 w-10 rounded-xl object-cover" />
              <div>
                <p className="font-display text-lg font-bold text-green-900">Eco Aura</p>
                <p className="text-xs text-green-700">Panel de gestion</p>
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-3 z-20 mx-auto flex w-[calc(100%-1.5rem)] max-w-lg items-center justify-between rounded-2xl border border-green-100 bg-white/95 p-2 shadow-2xl shadow-green-200/60 backdrop-blur md:hidden">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition ${
                isActive ? 'bg-green-600 text-white' : 'text-green-800'
              }`
            }
          >
            <item.icon size={16} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
