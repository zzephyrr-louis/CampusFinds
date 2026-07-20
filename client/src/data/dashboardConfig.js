import {
  FaBell,
  FaClipboardCheck,
  FaFileCirclePlus,
  FaMagnifyingGlass,
} from 'react-icons/fa6'

export const quickActions = [
  {
    label: 'Report a lost item',
    description: 'Tell the campus community what went missing.',
    to: '/report-lost',
    icon: FaFileCirclePlus,
    tone: 'blue',
  },
  {
    label: 'Report a found item',
    description: 'Record an item you found and where it is stored.',
    to: '/report-found',
    icon: FaClipboardCheck,
    tone: 'green',
  },
  {
    label: 'Search all items',
    description: 'Browse lost and found reports using filters.',
    to: '/search-items',
    icon: FaMagnifyingGlass,
    tone: 'amber',
  },
  {
    label: 'View notifications',
    description: 'Check possible matches and claim updates.',
    to: '/notifications',
    icon: FaBell,
    tone: 'purple',
  },
]
