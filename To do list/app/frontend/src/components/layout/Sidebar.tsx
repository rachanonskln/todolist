import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { useLocale } from "@/i18n/LocaleContext";

function useNavItems() {
  const { t } = useLocale();
  return [
    { to: "/", label: t.nav.dashboard, icon: "✨" },
    { to: "/calendar", label: t.nav.calendar, icon: "🗓️" },
    { to: "/tasks/new", label: t.nav.newTask, icon: "➕" },
    { to: "/settings", label: t.nav.settings, icon: "⚙️" },
  ];
}

export function Sidebar() {
  const { t } = useLocale();
  const navItems = useNavItems();

  return (
    <aside
      className="glass-panel hidden md:flex md:w-64 md:flex-col md:gap-2 md:p-4
        fixed left-4 top-4 bottom-4 z-20"
    >
      <div className="mb-6 flex items-center gap-2 px-2 pt-2">
        <span className="text-2xl">🌈</span>
        <span className="text-lg font-bold text-slate-700">{t.nav.brand}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                isActive
                  ? "bg-white/70 shadow-glass text-slate-800"
                  : "text-slate-600 hover:bg-white/40",
              )
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

/** Bottom tab bar shown on small screens instead of the sidebar. */
export function MobileTabBar() {
  const navItems = useNavItems();

  return (
    <nav
      className="glass-panel fixed bottom-3 left-3 right-3 z-20 flex justify-around
        p-2 md:hidden"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center rounded-xl px-3 py-1.5 text-xs",
              isActive ? "bg-white/70 text-slate-800" : "text-slate-500",
            )
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
