import { resolveAssetUrl } from './api'

export function asArray(data, key) {
  if (Array.isArray(data)) return data
  if (key && Array.isArray(data?.[key])) return data[key]
  if (Array.isArray(data?.content)) return data.content
  return []
}

export function formatEnumLabel(value, fallback = 'Unknown') {
  if (value === null || value === undefined || value === '') return fallback

  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function normalizeReportType(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized === 'found' ? 'found' : 'lost'
}

export function toItemView(item = {}) {
  const reporter = item.reporter || item.reported_by || {}
  const rawId = item.item_id ?? item.id
  const reportedAt = item.created_at || item.date_reported || item.reported_at || item.event_date

  return {
    id: rawId === null || rawId === undefined ? '' : String(rawId),
    itemId: rawId,
    reportType: normalizeReportType(item.report_type ?? item.reportType ?? item.status),
    name: item.item_name || item.name || item.title || 'Untitled item',
    category: item.category || 'Other',
    location: item.location || 'Location not provided',
    description: item.description || 'No description was provided.',
    eventDate: item.event_date || item.eventDate || '',
    identifyingFeatures:
      item.identifying_features ||
      item.identifyingFeatures ||
      'No additional identifying details were provided.',
    condition: item.condition || '',
    storageLocation: item.storage_location || item.storageLocation || '',
    relatedItemId: item.related_item_id ?? item.relatedItemId ?? '',
    imageUrl: resolveAssetUrl(item.image_url || item.image || item.imageUrl),
    reportedBy:
      (typeof reporter === 'string' ? reporter : reporter.fullname || reporter.name) ||
      item.reporter_name ||
      'CampusFind member',
    reporterId:
      (typeof reporter === 'object' ? reporter.user_id ?? reporter.id : null) ??
      item.reporter_id ??
      item.reported_by_id ??
      null,
    reportedAt,
    updatedAt: item.updated_at || item.updatedAt || reportedAt,
    status: formatEnumLabel(item.status, 'Open'),
    raw: item,
  }
}

export function toClaimView(claim = {}) {
  const item = claim.item || {}
  const rawClaimId = claim.claim_id ?? claim.id

  return {
    ...claim,
    claim_id: rawClaimId,
    item: {
      ...item,
      item_id: item.item_id ?? item.id,
      item_name: item.item_name || item.name || item.title || 'Unknown item',
      category: item.category || 'Other',
      status: formatEnumLabel(item.status, ''),
      report_type: normalizeReportType(item.report_type ?? item.reportType),
      image_url: resolveAssetUrl(item.image_url || item.image),
    },
    reason: claim.reason || claim.claim_message || claim.proof_description || '',
    status: formatEnumLabel(claim.status, 'Pending'),
    created_at: claim.created_at || claim.claim_date || claim.createdAt,
    proof_image_url: resolveAssetUrl(claim.proof_image_url || claim.proofImageUrl),
    moderator_remarks: claim.moderator_remarks || claim.moderatorRemarks || '',
  }
}

export function toNotificationView(notification = {}) {
  const rawType = String(notification.type || 'SYSTEM').toLowerCase().replace(/_/g, '-')

  return {
    id: notification.notification_id ?? notification.id,
    type: rawType,
    title: notification.title || formatEnumLabel(rawType, 'CampusFind update'),
    message: notification.message || '',
    itemId: notification.item_id ?? notification.itemId ?? null,
    claimId: notification.claim_id ?? notification.claimId ?? null,
    createdAt: notification.created_at || notification.createdAt,
    read: Boolean(notification.is_read ?? notification.read),
  }
}

export function toUserView(user = {}) {
  const rawId = user.user_id ?? user.id

  return {
    id: rawId,
    user_id: rawId,
    student_id: user.student_id || user.studentId || '',
    name: user.fullname || user.name || 'CampusFind user',
    fullname: user.fullname || user.name || 'CampusFind user',
    email: user.email || '',
    role: String(user.role || 'student').toLowerCase(),
    status: formatEnumLabel(user.status, 'Active'),
  }
}
