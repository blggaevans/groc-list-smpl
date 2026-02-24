export const LIST_TYPES = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'department_store', label: 'Department Store' },
  { value: 'other', label: 'Other' },
]

const GROCERY_SECTIONS = [
  'Produce',
  'Bakery',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Seafood',
  'Deli',
  'Frozen',
  'Canned & Dry Goods',
  'Snacks',
  'Beverages',
  'Condiments & Spices',
  'Cleaning Supplies',
  'Personal Care',
  'Uncategorized',
]

const HARDWARE_SECTIONS = [
  'Lumber & Building Materials',
  'Electrical',
  'Plumbing',
  'Paint & Supplies',
  'Fasteners & Hardware',
  'Tools',
  'Flooring',
  'Lighting',
  'Outdoor & Garden',
  'Uncategorized',
]

const DEFAULT_SECTIONS = {
  grocery: GROCERY_SECTIONS,
  hardware: HARDWARE_SECTIONS,
  department_store: ['Uncategorized'],
  other: ['Uncategorized'],
}

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export function buildDefaultSections(type) {
  const names = DEFAULT_SECTIONS[type] ?? ['Uncategorized']
  return names.map((name, i) => ({
    id: generateId(),
    name,
    order: i,
  }))
}

export function labelForType(value) {
  return LIST_TYPES.find(t => t.value === value)?.label ?? value
}
