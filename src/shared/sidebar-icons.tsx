import type { IconType } from "react-icons";
import { FiCalendar, FiGrid, FiMessageSquare, FiPercent, FiPlusCircle, FiShield, FiTag, FiUsers } from "react-icons/fi";
import { MdOutlineQrCode2, MdPalette } from "react-icons/md";

export const sidebarIcons: Record<string, IconType> = {
  dashboard: FiGrid,
  walkIn: FiPlusCircle,
  bookings: FiCalendar,
  customers: FiUsers,
  rates: FiTag,
  offers: FiPercent,
  staff: FiShield,
  sms: FiMessageSquare,
  qr: MdOutlineQrCode2,
  uiKit: MdPalette,
};

interface SidebarMenuIconProps {
  name: string;
  className?: string;
}

export function SidebarMenuIcon({ name, className }: SidebarMenuIconProps) {
  const IconComponent = sidebarIcons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} aria-hidden />;
}
