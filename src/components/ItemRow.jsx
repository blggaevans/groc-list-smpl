import { useState, useRef } from 'react'
import { CheckIcon, TrashIcon, DragHandleIcon } from './icons'
import { useSettings } from '../contexts/SettingsContext'

const DELETE_THRESHOLD = 80

export default function ItemRow({ item, onToggle, onDelete, onUpdateNote, dragHandleProps }) {
  const [expanded, setExpanded] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [swipeX, setSwipeX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const { settings } = useSettings()
  const compact = settings.compactView

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const currentSwipeRef = useRef(0)  // ref copy avoids stale closure in touchEnd
  const committedRef = useRef(false)  // true once we've decided this is a horizontal swipe
  const scrollingRef = useRef(false)  // true if this touch is a vertical scroll

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

  function handleTouchStart(e) {
    if (expanded) return
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    committedRef.current = false
    scrollingRef.current = false
    currentSwipeRef.current = 0
  }

  function handleTouchMove(e) {
    if (expanded || scrollingRef.current) return

    const deltaX = e.touches[0].clientX - startXRef.current
    const deltaY = e.touches[0].clientY - startYRef.current

    // Wait until the gesture is large enough to determine direction
    if (!committedRef.current) {
      if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) return
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        scrollingRef.current = true
        return
      }
      committedRef.current = true
      setIsSwiping(true)
    }

    // Only track left swipes; clamp at -140px
    const x = Math.max(Math.min(deltaX, 0), -140)
    currentSwipeRef.current = x
    setSwipeX(x)
  }

  function handleTouchEnd() {
    if (currentSwipeRef.current < -DELETE_THRESHOLD) {
      // Slide row off to the left, then delete
      setSwipeX(-window.innerWidth)
      setIsSwiping(false) // enable CSS transition for the slide-off
      setTimeout(() => onDelete(), 220)
    } else {
      // Snap back
      setSwipeX(0)
      setIsSwiping(false)
    }
    currentSwipeRef.current = 0
    committedRef.current = false
    scrollingRef.current = false
  }

  // How far along the delete threshold we are (0–1)
  const deleteProgress = Math.min(Math.abs(swipeX) / DELETE_THRESHOLD, 1)

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Red delete zone — revealed as the row slides left */}
      <div
        className="absolute inset-0 flex items-center justify-end pr-5 text-white"
        style={{ backgroundColor: `rgba(239, 68, 68, ${0.4 + deleteProgress * 0.6})` }}
      >
        <TrashIcon />
      </div>

      {/* Sliding row */}
      <div
        className="relative bg-white dark:bg-gray-900"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
        </div>

        {/* Note editor — shown when item name is tapped */}
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
    </div>
  )
}
