import React from 'react';
import { FiLock, FiLogOut, FiSmartphone, FiUser } from "react-icons/fi";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Routing } from '../../routes/routing';
import { StaffRoleLabel } from '../../shared/enums/user';
import type { IApplicationState } from '../../store/state/app-state';
import { Avatar, Chip, Dropdown, DropdownMenu, DropdownTrigger } from '../ui';

interface UserMenuProps {
  onLogout: () => void | Promise<void>
}

const itemClass = 'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-default-900 hover:bg-default-100 dark:text-default-800 dark:hover:bg-default-50';

const UserMenu: React.FC<UserMenuProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const user = useSelector((state: IApplicationState) => state.UserData);
  const [isOpen, setIsOpen] = React.useState(false);
  const displayName = user.name || user.email || 'Staff';

  const go = (path: string, tab?: string) => {
    setIsOpen(false);
    navigate(path, tab ? { state: { tab } } : undefined);
  };

  return (
    <Dropdown placement="bottom-end" isOpen={isOpen} onOpenChange={setIsOpen} showArrow>
      <DropdownTrigger>
        <Avatar size="sm" name={displayName} color="primary" isBordered className="cursor-pointer" title="Open user menu" />
      </DropdownTrigger>
      <DropdownMenu variant="flat" ariaLabel="User menu" className="w-[calc(100vw-90px)] sm:w-72 max-w-[18rem] p-0 flex flex-col gap-0 border-0 outline-none select-none">
        <div className="border-b border-default-100 px-4 py-4 dark:border-default-800">
          <div className="flex items-center gap-3">
            <Avatar size="md" name={displayName} color="primary" isBordered />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-default-900 dark:text-white">{displayName}</p>
              <p className="truncate text-xs text-default-700">{user.email}</p>
              {user.role && (
                <Chip size="sm" variant="flat" color={user.role === 'admin' ? 'primary' : 'default'} className="mt-1">
                  {StaffRoleLabel[user.role]}
                </Chip>
              )}
            </div>
          </div>
        </div>
        <div className="py-1">
          <button type="button" className={itemClass} onClick={() => go(Routing.MyAccount)}>
            <FiUser className="h-4 w-4" aria-hidden /> My account
          </button>
          <button type="button" className={itemClass} onClick={() => go(Routing.MyAccount, 'password')}>
            <FiLock className="h-4 w-4" aria-hidden /> Change password
          </button>
          <button type="button" className={itemClass} onClick={() => go(Routing.MyAccount, 'sessions')}>
            <FiSmartphone className="h-4 w-4" aria-hidden /> Signed-in devices
          </button>
        </div>
        <div className="border-t border-default-100 py-1 dark:border-default-800">
          <button
            type="button"
            className={`${itemClass} text-danger dark:text-danger`}
            onClick={async () => {
              setIsOpen(false);
              await onLogout();
            }}
          >
            <FiLogOut className="h-4 w-4" aria-hidden /> Log out
          </button>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserMenu;
