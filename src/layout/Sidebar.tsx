import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip } from '../components/ui';
import { Routing } from '../routes/routing';
import { getSidebarRoutes } from '../shared/constants/sidebar-data';
import { SidebarMenuIcon } from '../shared/sidebar-icons';
import type { IApplicationState } from '../store/state/app-state';

const Sidebar = () => {
  const { pathname } = useLocation();
  const role = useSelector((state: IApplicationState) => state.UserData.role);
  const menus = getSidebarRoutes(role);

  return (
    <aside className="w-[250px] h-screen fixed top-0 left-0 z-40 flex flex-col overflow-hidden transition-all duration-300 ease-linear [.hide-sidebar_&]:w-[64px] bg-primary-900 text-white dark:border-r dark:border-content2">
      <Link
        to={Routing.Dashboard}
        className="shrink-0 h-[70px] flex items-center gap-3 px-4 border-b border-white/10 [.hide-sidebar_&]:justify-center [.hide-sidebar_&]:px-0"
      >
        <img className="w-10 h-10 rounded-xl" src="/favicon.svg" alt="" />
        <span className="leading-tight [.hide-sidebar_&]:hidden">
          <span className="block font-display text-[22px] font-extrabold tracking-wide">
            The <span className="text-secondary">Riverside</span>
          </span>
          <span className="block text-[11px] uppercase tracking-[0.16em] text-white/60">Counter desk</span>
        </span>
      </Link>

      <nav className="flex-1 w-full px-2.5 py-3 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Admin">
        <ul className="flex flex-col gap-1 m-0 p-0 list-none">
          {menus.map((menu) => {
            const isActive = pathname === menu.route || pathname.startsWith(`${menu.route}/`);
            return (
              <li key={menu.module}>
                <Tooltip
                  placement="right"
                  color="primary"
                  showArrow
                  offset={19}
                  radius="md"
                  triggerClassName="w-full"
                  className="hidden [.hide-sidebar_&]:block"
                  content={menu.name}
                >
                  <Link
                    to={menu.route}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium no-underline transition-colors duration-150 [.hide-sidebar_&]:justify-center [.hide-sidebar_&]:px-0 ${isActive
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {menu.icon && <SidebarMenuIcon name={menu.icon} className="h-5 w-5 shrink-0" />}
                    <span className="truncate [.hide-sidebar_&]:hidden">{menu.name}</span>
                  </Link>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/10 px-4 py-3 text-[11px] text-white/45 [.hide-sidebar_&]:hidden">
        Ashmavati Riverfront · Porbandar
      </div>
    </aside>
  );
};

export default Sidebar;
