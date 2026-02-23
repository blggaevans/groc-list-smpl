import { useState, useEffect, useRef } from 'react'
import {
  collection, query, orderBy, limit, onSnapshot,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function AddItemSheet({ userId, onAdd, onClose }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [weight, setWeight] = useState('')
  const [comment, setComment] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [history, setHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)

  // Load item history for autocomplete
  useEffect(() => {
    const q = query(
      collection(db, 'users', userId, 'itemHistory'),
      orderBy('lastUsed', 'desc'),
      limit(100),
    )
    return onSnapshot(q, snap => {
      setHistory(snap.docs.map(d => d.data().name))
    })
  }, [userId])

  // Filter suggestions as user types
  useEffect(() => {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed) { setSuggestions([]); return }
    setSuggestions(
      history
        .filter(h => h.toLowerCase().includes(trimmed) && h.toLowerCase() !== trimmed)
        .slice(0, 5),
    )
  }, [name, history])

  useEffect(() => {
    // Small delay so the sheet animation settles before focusing
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({
      name: trimmed,
      quantity: quantity.trim(),
      weight: weight.trim(),
      comment: comment.trim(),
    })
    // Reset for quick re-add
    setName('')
    setQuantity('')
    setWeight('')
    setComment('')
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl px-4 pt-3 pb-8">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />

        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Add item</h2>

        {/* Name input */}
        <div className="relative mb-2">
          <input
            ref={inputRef}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white outline-none placeholder-gray-400"
            placeholder="Item name"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !expanded) handleAdd()
            }}
          />

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl mt-1 overflow-hidden shadow-lg z-10">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300 border-b last:border-b-0 border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                  onMouseDown={e => {
                    // Prevent input blur before this fires
                    e.preventDefault()
                    setName(s)
                    setSuggestions([])
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Optional fields toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-sm text-green-600 py-1.5 mb-2 font-medium"
        >
          {expanded ? 'Fewer options' : '+ Quantity, weight, or note'}
        </button>

        {expanded && (
          <div className="space-y-2 mb-3">
            <input
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white outline-none placeholder-gray-400"
              placeholder="Quantity (e.g. 2)"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
            <input
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white outline-none placeholder-gray-400"
              placeholder="Weight / size (e.g. 500g, large)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
            <input
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white outline-none placeholder-gray-400"
              placeholder="Note (e.g. organic, store brand)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            />
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full bg-green-600 text-white rounded-2xl py-4 font-semibold text-base active:bg-green-700 disabled:opacity-40 transition-opacity mt-2"
        >
          Add to list
        </button>
      </div>
    </div>
  )
}
