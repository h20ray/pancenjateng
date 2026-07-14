import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  Settings,
} from 'lucide-react';
import { type MenuConfig } from './types';

const MENU_SIDEBAR: MenuConfig = [
  {
    heading: 'Menu',
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    rootPath: '/admin',
  },
  {
    title: 'Pengaduan',
    icon: MessageSquareText,
    path: '/admin/aduan',
    rootPath: '/admin/aduan',
  },
  {
    heading: 'Lainnya',
  },
  {
    title: 'Dokumentasi',
    icon: FileText,
    path: '/docs',
    disabled: true,
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    path: '/admin/settings',
    rootPath: '/admin/settings',
  },
];

const MENU_MEGA: MenuConfig = [];
const MENU_MEGA_MOBILE: MenuConfig = [];

export { MENU_SIDEBAR, MENU_MEGA, MENU_MEGA_MOBILE };
