import {
  FaBell,
  FaClipboardCheck,
  FaFileCirclePlus,
  FaMagnifyingGlass,
} from 'react-icons/fa6'

export const mockItems = [
  {
    id: 'lost-001',
    reportType: 'lost',
    name: 'Black leather wallet',
    category: 'Wallet',
    location: 'Library, second floor',
    description: 'A slim black leather wallet last seen near the quiet study tables on the second floor.',
    identifyingFeatures: 'Small embossed initials inside; contains several cards and no cash.',
    reportedBy: 'CampusFind student',
    reportedAt: '2026-07-11T10:24:00+08:00',
    displayDate: 'Today, 10:24 AM',
    status: 'Open',
  },
  {
    id: 'found-001',
    reportType: 'found',
    name: 'Wireless earbuds',
    category: 'Electronics',
    location: 'Cafeteria counter',
    description: 'A pair of wireless earbuds in a compact charging case, turned in after lunch service.',
    identifyingFeatures: 'The owner will be asked to identify the case color and device pairing name.',
    storageLocation: 'Student Affairs lost-and-found desk',
    reportedBy: 'Cafeteria staff',
    reportedAt: '2026-07-11T09:15:00+08:00',
    displayDate: 'Today, 9:15 AM',
    status: 'Unclaimed',
  },
  {
    id: 'lost-002',
    reportType: 'lost',
    name: 'Blue insulated tumbler',
    category: 'Container',
    location: 'Science Building',
    description: 'A blue insulated tumbler that may have been left in a ground-floor laboratory room.',
    identifyingFeatures: 'Has a removable straw lid and a small sticker near the base.',
    reportedBy: 'CampusFind student',
    reportedAt: '2026-07-10T15:10:00+08:00',
    displayDate: 'Yesterday, 3:10 PM',
    status: 'Possible match',
  },
  {
    id: 'found-002',
    reportType: 'found',
    name: 'Calculus notebook',
    category: 'School supplies',
    location: 'Room 204',
    description: 'A spiral-bound calculus notebook found beneath a desk after the afternoon class.',
    identifyingFeatures: 'The claimant should describe the cover and the name written on the first page.',
    storageLocation: 'Room 204 faculty table',
    reportedBy: 'Faculty member',
    reportedAt: '2026-07-10T13:45:00+08:00',
    displayDate: 'Yesterday, 1:45 PM',
    status: 'Matched',
  },
  {
    id: 'lost-003',
    reportType: 'lost',
    name: 'Student ID with blue lace',
    category: 'Identification',
    location: 'Main Gate',
    description: 'A student identification card with a blue lanyard, last noticed near the main gate.',
    identifyingFeatures: 'Identity details are hidden for privacy and will be verified during handover.',
    reportedBy: 'CampusFind student',
    reportedAt: '2026-07-08T08:40:00+08:00',
    displayDate: 'Jul 8, 8:40 AM',
    status: 'Open',
  },
  {
    id: 'found-003',
    reportType: 'found',
    name: 'Folding umbrella',
    category: 'Accessory',
    location: 'Gym lobby',
    description: 'A compact folding umbrella found on a bench in the gym lobby after closing time.',
    identifyingFeatures: 'The owner will be asked to describe its color, handle, and cover.',
    storageLocation: 'Gym reception desk',
    reportedBy: 'Gym staff',
    reportedAt: '2026-07-08T17:20:00+08:00',
    displayDate: 'Jul 8, 5:20 PM',
    status: 'Stored',
  },
  {
    id: 'lost-004',
    reportType: 'lost',
    name: 'Silver flash drive',
    category: 'Electronics',
    location: 'Computer Laboratory',
    description: 'A small silver USB flash drive believed to have been left at a laboratory workstation.',
    identifyingFeatures: 'The owner should identify its capacity and describe the files or label on it.',
    reportedBy: 'CampusFind student',
    reportedAt: '2026-07-07T11:05:00+08:00',
    displayDate: 'Jul 7, 11:05 AM',
    status: 'Open',
  },
]

export const mockClaims = [
  { id: 'claim-001', status: 'Under review' },
  { id: 'claim-002', status: 'Verification needed' },
  { id: 'claim-003', status: 'Completed' },
]

const lostItems = mockItems.filter((item) => item.reportType === 'lost')
const foundItems = mockItems.filter((item) => item.reportType === 'found')
const activeClaims = mockClaims.filter((claim) => claim.status !== 'Completed')

export const dashboardStats = [
  {
    id: 'lost',
    label: 'Open lost reports',
    value: lostItems.length,
    detail: '2 added in the last 48 hours',
    tone: 'blue',
    to: '/search-items?type=lost',
  },
  {
    id: 'found',
    label: 'Found item reports',
    value: foundItems.length,
    detail: '2 possible handovers',
    tone: 'amber',
    to: '/search-items?type=found',
  },
  {
    id: 'claims',
    label: 'Active claims',
    value: activeClaims.length,
    detail: '1 needs verification',
    tone: 'green',
    to: '/claims',
  },
]

export const recentLostItems = lostItems.slice(0, 3)
export const recentFoundItems = foundItems.slice(0, 3)

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
