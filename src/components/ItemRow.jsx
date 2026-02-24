import { useState } from 'react'
import { CheckIcon, TrashIcon, DragHandleIcon } from './icons'
import { useSettings } from '../contexts/SettingsContext'

export default function ItemRow({ item, onToggle, onDelete, onUpdateNote, dragHandleProps }) {
  const [expanded, setExpanded] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const { settings } = useSettings()
  const compact = settings.compactView

  const details = [item.quantity, item.weight, item.comment].filter(Boolean).join(' · ')

  function handleExpand() {
    if (!expanded) {
      setNoteInput(item.comment ?? '')
      setExpanded(true)
    }
  }

  function saveNote() {
    onUpdateNote?.(item.id, noteInput)
    setExpanded(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
      <div className="flex items-center">
        {/* Drag handle */}
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            className={`pl-3 pr-1 ${compact ? 'py-2' : 'py-4'} text-gray-200 dark:text-gray-800 touch-none cursor-grab active:cursor-grabbing`}
            aria-label="Drag to reorder"
            tabIndex={-1}
          >
            <DragHandleIcon />
          </button>
        )}

        {/* Check circle */}
        <button
          onClick={onToggle}
          className={`pl-4 pr-2 ${compact ? 'py-2' : 'py-4'} flex-shrink-0`}
          aria-label={item.checked ? 'Uncheck item' : 'Check item'}
        >
          <span
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              item.checked
                ? 'bg-green-600 border-green-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {item.checked && <CheckIcon />}
          </span>
        </button>

        {/* Name + details — tap to add/edit a note */}
        <button
          onClick={handleExpand}
          className={`flex-1 flex flex-col min-w-0 px-2 ${compact ? 'py-2 min-h-[40px]' : 'py-4 min-h-[56px]'} text-left justify-center`}
        >
          <span
            className={`${compact ? 'text-sm' : 'text-base'} leading-snug ${
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
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className={`px-4 ${compact ? 'py-2 min-h-[40px]' : 'py-4 min-h-[56px]'} text-gray-300 dark:text-gray-700 active:text-red-500 flex items-center`}
          aria-label="Delete item"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Note editor — shown when item is tapped */}
      {expanded && (
        <div className="px-4 pb-3">
          <input
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder-gray-400"
            placeholder="Add a note…"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            onBlur={saveNote}
            onKeyDown={e => {
              if (e.key === 'Enter') saveNote()
              if (e.key === 'Escape') setExpanded(false)
            }}
            autoFocus
          />
        </div>
      )}
    </div>
  )
}
