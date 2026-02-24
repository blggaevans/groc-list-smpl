import { useState } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SortableItemRow from './SortableItemRow'
import { DragHandleIcon, TrashIcon, PlusIcon } from './icons'

export default function SectionGroup({
  section,
  items,
  onToggleItem,
  onDeleteItem,
  onDeleteSection,
  isOwner,
  isOver,         // true when an item is being dragged over this section
}) {
  const [collapsed, setCollapsed] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `section-${section.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const unchecked = items.filter(i => !i.checked).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const checked = items.filter(i => i.checked).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const total = items.length

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      {/* Section header */}
      <div className="flex items-center gap-1 mb-1.5">
        {/* Drag handle for reordering sections */}
        {isOwner && (
          <button
            {...listeners}
            {...attributes}
            className="p-1 text-gray-300 dark:text-gray-700 touch-none cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder section"
            tabIndex={-1}
          >
            <DragHandleIcon />
          </button>
        )}

        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex-1 flex items-center gap-2 py-1 text-left"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {section.name}
          </span>
          {total > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-600">({total})</span>
          )}
          <span className="text-xs text-gray-300 dark:text-gray-700 ml-auto pr-1">
            {collapsed ? '▸' : '▾'}
          </span>
        </button>

        {isOwner && (
          <button
            onClick={() => onDeleteSection(section.id)}
            className="p-1 text-gray-300 dark:text-gray-700 active:text-red-400"
            aria-label={`Delete ${section.name} section`}
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* Items */}
      {!collapsed && (
        <SortableContext
          items={unchecked.map(i => `item-${i.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className={`space-y-1.5 transition-colors rounded-2xl ${isOver ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
            {unchecked.map(item => (
              <SortableItemRow
                key={item.id}
                item={item}
                onToggle={() => onToggleItem(item.id, item.checked)}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))}

            {/* Drop zone shown when section is empty or item is being dragged over */}
            {(unchecked.length === 0) && (
              <div className="h-12 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center">
                <span className="text-xs text-gray-300 dark:text-gray-700">Drop items here</span>
              </div>
            )}
          </div>

          {/* Checked items within section */}
          {checked.length > 0 && (
            <div className="space-y-1.5 mt-1.5 opacity-50">
              {checked.map(item => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => onToggleItem(item.id, item.checked)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      )}
    </div>
  )
}
