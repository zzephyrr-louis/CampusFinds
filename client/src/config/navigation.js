import {
  FaBell,
  FaClipboardCheck,
  FaFileCirclePlus,
  FaHouse,
  FaMagnifyingGlass,
  FaShieldHalved,
  FaUserCheck,
} from 'react-icons/fa6'

export const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: FaHouse, end: true },
  { label: 'Report Lost Item', to: '/report-lost', icon: FaFileCirclePlus },
  { label: 'Report Found Item', to: '/report-found', icon: FaClipboardCheck },
  { label: 'Search Items', to: '/search-items', icon: FaMagnifyingGlass },
  { label: 'My Claims', to: '/claims', icon: FaUserCheck },
  { label: 'Notifications', to: '/notifications', icon: FaBell },
  { label: 'Admin Panel', to: '/admin', icon: FaShieldHalved, roles: ['admin'] },
]
