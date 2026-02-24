import { CheckIcon, TrashIcon, DragHandleIcon } from './icons'

export default function ItemRow({ item, onToggle, onDelete, dragHandleProps }) {
  const details = [item.quantity, item.weight, item.comment].filter(Boolean).join(' · ')

  return (
    <div className="flex items-center bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
      {/* Drag handle */}
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          className="pl-3 pr-1 py-4 text-gray-200 dark:text-gray-800 touch-none cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <DragHandleIcon />
        </button>
      )}

      {/* Check + name */}
      <button
        onClick={onToggle}
        className="flex items-center flex-1 gap-3 px-4 py-4 text-left min-h-[56px]"
        aria-label={item.checked ? 'Uncheck item' : 'Check item'}
      >
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            item.checked
              ? 'bg-green-600 border-green-600'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {item.checked && <CheckIcon />}
        </span>
        <span className="flex flex-col min-w-0">
          <span
            className={`text-base leading-snug ${
              item.checked
                ? 'line-through text-gray-400 dark:text-gray-600'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {item.name}
          </span>
          {details && (
            <span className="text-xs text-gray-400 dark:text-gray-600 mt-0.5 truncate">
              {details}
            </span>
          )}
        </span>
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="px-4 py-4 text-gray-300 dark:text-gray-700 active:text-red-500 min-h-[56px] flex items-center"
        aria-label="Delete item"
      >
        <TrashIcon />
      </button>
    </div>
  )
}
