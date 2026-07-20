// client/src/data/claimData.js
//
// Local mock data used as a fallback so the Claims page has something to
// render (and can be visually tested) even when the /items/claimable and
// /claims/mine API endpoints aren't available yet.
//
// Shape matches what Claims.jsx expects from the real API responses.
 
export const claimableItems = [
  {
    item_id: 1,
    item_name: 'Blue North Face Backpack',
    category: 'Bags',
    status: 'Found',
  },
  {
    item_id: 2,
    item_name: 'Silver iPhone 13',
    category: 'Electronics',
    status: 'Found',
  },
  {
    item_id: 3,
    item_name: 'Black Umbrella',
    category: 'Accessories',
    status: 'Found',
  },
  {
    item_id: 4,
    item_name: "Student ID Card - Dela Cruz, J.",
    category: 'Documents',
    status: 'Found',
  },
  {
    item_id: 5,
    item_name: 'Wired Earphones (White)',
    category: 'Electronics',
    status: 'Found',
  },
]
 
export const claimHistory = [
  {
    claim_id: 101,
    item: {
      item_id: 1,
      item_name: 'Blue North Face Backpack',
      category: 'Bags',
    },
    reason: 'It has a small tear near the bottom-left pocket and a keychain shaped like a cat clipped to the zipper.',
    status: 'Pending',
    created_at: '2026-07-15T09:24:00Z',
  },
  {
    claim_id: 98,
    item: {
      item_id: 2,
      item_name: 'Silver iPhone 13',
      category: 'Electronics',
    },
    reason: 'Lock screen wallpaper is a photo of my dog, and the case has a small crack on the top right corner.',
    status: 'Approved',
    created_at: '2026-07-10T14:02:00Z',
  },
  {
    claim_id: 87,
    item: {
      item_id: 5,
      item_name: 'Wired Earphones (White)',
      category: 'Electronics',
    },
    reason: 'Left earbud has a faded blue dot of nail polish I added to tell mine apart from my roommate\'s.',
    status: 'Rejected',
    created_at: '2026-07-02T08:47:00Z',
  },
]
 
export default { claimableItems, claimHistory }