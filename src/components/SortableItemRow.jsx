import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ItemRow from './ItemRow'

export default function SortableItemRow({ item, onToggle, onDelete, onUpdateNote }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Hide the original row while a drag overlay is shown
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ItemRow
        item={item}
        onToggle={onToggle}
        onDelete={onDelete}
        onUpdateNote={onUpdateNote}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  )
}
