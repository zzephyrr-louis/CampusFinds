import {
  FaCircleCheck,
  FaCircleInfo,
  FaCircleXmark,
  FaClipboardCheck,
} from 'react-icons/fa6'

export const notificationTypeConfig = {
  match: { icon: FaClipboardCheck, label: 'Possible match', tone: 'purple' },
  'claim-approved': { icon: FaCircleCheck, label: 'Claim update', tone: 'green' },
  'claim-rejected': { icon: FaCircleXmark, label: 'Claim update', tone: 'amber' },
  system: { icon: FaCircleInfo, label: 'CampusFind update', tone: 'blue' },
}

export function formatNotificationDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
