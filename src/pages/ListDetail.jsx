import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, limit, onSnapshot, serverTimestamp, setDoc,
} from 'firebase/firestore'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove as dndArrayMove,
} from '@dnd-kit/sortable'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import ItemRow from '../components/ItemRow'
import SectionGroup from '../components/SectionGroup'
import ShareModal from '../components/ShareModal'
import { BackIcon, ShareIcon, PlusIcon } from '../components/icons'
import { autoAssignSection } from '../utils/autoAssign'

export default function ListDetail() {
  const { listId } = useParams()
  const user = useAuth()
  const navigate = useNavigate()

  const [list, setList] = useState(null)
  const [sections, setSections] = useState([])
  const [items, setItems] = useState([])
  const [showShare, setShowShare] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [overSectionId, setOverSectionId] = useState(null)
  const [addingSection, setAddingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [itemHistory, setItemHistory] = useState([])
  const [quickAddValue, setQuickAddValue] = useState('')
  const [quickAddSuggestions, setQuickAddSuggestions] = useState([])
  const isDraggingRef = useRef(false)

  const isOwner = list?.ownerId === user?.uid

  // Listen to list document (sections live here)
  useEffect(() => {
    return onSnapshot(doc(db, 'lists', listId), snap => {
      if (!snap.exists()) return
      const data = snap.data()
      setList({ id: snap.id, ...data })
      if (!editingName) setNameInput(data.name)
      if (!isDraggingRef.current) {
        const sorted = [...(data.sections ?? [])].sort((a, b) => a.order - b.order)
        setSections(sorted)
      }
    })
  }, [listId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen to items subcollection
  useEffect(() => {
    const q = query(collection(db, 'lists', listId, 'items'), orderBy('createdAt', 'asc'))
    return onSnapshot(q, snap => {
      if (!isDraggingRef.current) {
        setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
    })
  }, [listId])

  // Load item history for autocomplete
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'itemHistory'),
      orderBy('lastUsed', 'desc'),
      limit(100),
    )
    return onSnapshot(q, snap => {
      setItemHistory(snap.docs.map(d => d.data().name))
    })
  }, [user])

  // Filter autocomplete suggestions as user types
  useEffect(() => {
    const trimmed = quickAddValue.trim().toLowerCase()
    if (!trimmed) { setQuickAddSuggestions([]); return }
    setQuickAddSuggestions(
      itemHistory
        .filter(h => h.toLowerCase().includes(trimmed) && h.toLowerCase() !== trimmed)
        .slice(0, 5),
    )
  }, [quickAddValue, itemHistory])

  async function saveListName() {
    const name = nameInput.trim()
    if (!name || name === list?.name) { setEditingName(false); return }
    await updateDoc(doc(db, 'lists', listId), { name, updatedAt: serverTimestamp() })
    setEditingName(false)
  }

  async function addItem(name, comment = '', targetSectionId = null) {
    const sectionId = targetSectionId ?? autoAssignSection(name, list?.type, sections)
    const sectionItems = items.filter(i => i.sectionId === sectionId)
    const maxOrder = sectionItems.reduce((max, i) => Math.max(max, i.order ?? 0), 0)

    await addDoc(collection(db, 'lists', listId, 'items'), {
      name,
      quantity: '',
      weight: '',
      comment,
      checked: false,
      sectionId,
      order: maxOrder + 1000,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      addedBy: user.uid,
    })

    const historyKey = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    await setDoc(
      doc(db, 'users', user.uid, 'itemHistory', historyKey),
      { name, lastUsed: serverTimestamp() },
      { merge: true },
    )
  }

  async function updateNote(itemId, comment) {
    await updateDoc(doc(db, 'lists', listId, 'items', itemId), {
      comment,
      updatedAt: serverTimestamp(),
    })
  }

  async function handleQuickAdd() {
    const name = quickAddValue.trim()
    if (!name) return
    setQuickAddValue('')
    setQuickAddSuggestions([])
    await addItem(name)
  }

  async function toggleItem(itemId, currentChecked) {
    await updateDoc(doc(db, 'lists', listId, 'items', itemId), {
      checked: !currentChecked,
      updatedAt: serverTimestamp(),
    })
  }

  async function deleteItem(itemId) {
    await deleteDoc(doc(db, 'lists', listId, 'items', itemId))
  }

  async function deleteSection(sectionId) {
    const fallback = sections.find(s => s.name.toLowerCase() === 'uncategorized')?.id
    const affected = items.filter(i => i.sectionId === sectionId)
    await Promise.all(affected.map(i =>
      updateDoc(doc(db, 'lists', listId, 'items', i.id), {
        sectionId: fallback ?? sectionId,
        updatedAt: serverTimestamp(),
      }),
    ))
    const newSections = sections
      .filter(s => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }))
    setSections(newSections)
    await updateDoc(doc(db, 'lists', listId), {
      sections: newSections,
      updatedAt: serverTimestamp(),
    })
  }

  async function addSection() {
    const name = newSectionName.trim()
    if (!name) return
    const id = Math.random().toString(36).slice(2, 11)
    const newSections = [...sections, { id, name, order: sections.length }]
    setSections(newSections)
    await updateDoc(doc(db, 'lists', listId), {
      sections: newSections,
      updatedAt: serverTimestamp(),
    })
    setNewSectionName('')
    setAddingSection(false)
  }

  // ── Drag and Drop ─────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart({ active }) {
    isDraggingRef.current = true
    setActiveId(active.id)
  }

  function handleDragOver({ active, over }) {
    if (!over) { setOverSectionId(null); return }
    const activeId = active.id
    const overId = over.id

    if (!activeId.startsWith('item-')) return

    const activeItemId = activeId.replace('item-', '')
    const activeItem = items.find(i => i.id === activeItemId)
    if (!activeItem) return

    let targetSectionId = activeItem.sectionId
    if (overId.startsWith('section-')) {
      targetSectionId = overId.replace('section-', '')
    } else if (overId.startsWith('item-')) {
      const overItemId = overId.replace('item-', '')
      const overItem = items.find(i => i.id === overItemId)
      if (overItem) targetSectionId = overItem.sectionId
    }

    setOverSectionId(targetSectionId)

    if (targetSectionId !== activeItem.sectionId) {
      setItems(prev => prev.map(i =>
        i.id === activeItemId ? { ...i, sectionId: targetSectionId } : i,
      ))
    }
  }

  async function handleDragEnd({ active, over }) {
    isDraggingRef.current = false
    setActiveId(null)
    setOverSectionId(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // ── Section reorder ──────────────────────────────────────────────────
    if (activeId.startsWith('section-') && overId.startsWith('section-')) {
      const fromId = activeId.replace('section-', '')
      const toId = overId.replace('section-', '')
      if (fromId === toId) return

      const oldIndex = sections.findIndex(s => s.id === fromId)
      const newIndex = sections.findIndex(s => s.id === toId)
      const reordered = dndArrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))
      setSections(reordered)
      await updateDoc(doc(db, 'lists', listId), {
        sections: reordered,
        updatedAt: serverTimestamp(),
      })
      return
    }

    // ── Item move/reorder ─────────────────────────────────────────────────
    if (!activeId.startsWith('item-')) return

    const activeItemId = activeId.replace('item-', '')
    const activeItem = items.find(i => i.id === activeItemId)
    if (!activeItem) return

    let targetSectionId = activeItem.sectionId

    if (overId.startsWith('section-')) {
      targetSectionId = overId.replace('section-', '')
    } else if (overId.startsWith('item-')) {
      const overItemId = overId.replace('item-', '')
      const overItem = items.find(i => i.id === overItemId)
      if (overItem) targetSectionId = overItem.sectionId
    }

    const sectionItems = items
      .filter(i => i.sectionId === targetSectionId && !i.checked && i.id !== activeItemId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

    let newOrder = activeItem.order ?? 0

    if (overId.startsWith('item-') && overId !== activeId) {
      const overItemId = overId.replace('item-', '')
      const overIndex = sectionItems.findIndex(i => i.id === overItemId)
      const prev = sectionItems[overIndex - 1]
      const next = sectionItems[overIndex]
      if (!prev) newOrder = (next?.order ?? 1000) - 1000
      else if (!next) newOrder = (prev.order ?? 0) + 1000
      else newOrder = ((prev.order ?? 0) + (next.order ?? 0)) / 2
    } else if (overId.startsWith('section-')) {
      const last = sectionItems[sectionItems.length - 1]
      newOrder = last ? (last.order ?? 0) + 1000 : 1000
    }

    await updateDoc(doc(db, 'lists', listId, 'items', activeItemId), {
      sectionId: targetSectionId,
      order: newOrder,
      updatedAt: serverTimestamp(),
    })
  }

  const activeItem = activeId?.startsWith('item-')
    ? items.find(i => i.id === activeId.replace('item-', ''))
    : null

  const hasSections = sections.length > 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-2 py-2 flex items-center gap-1">
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-600 dark:text-gray-400 rounded-xl active:bg-gray-100 dark:active:bg-gray-800"
          aria-label="Back"
        >
          <BackIcon />
        </button>

        {editingName ? (
          <input
            className="flex-1 text-lg font-semibold bg-transparent text-gray-900 dark:text-white outline-none border-b-2 border-green-500 py-1 mx-1"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={saveListName}
            onKeyDown={e => {
              if (e.key === 'Enter') saveListName()
              if (e.key === 'Escape') { setNameInput(list?.name ?? ''); setEditingName(false) }
            }}
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left text-lg font-semibold text-gray-900 dark:text-white px-1 py-1 rounded-xl truncate"
            onClick={() => { setNameInput(list?.name ?? ''); setEditingName(true) }}
          >
            {list?.name ?? '…'}
          </button>
        )}

        <button
          onClick={() => setShowShare(true)}
          className="p-2 text-gray-500 dark:text-gray-400 rounded-xl active:bg-gray-100 dark:active:bg-gray-800"
          aria-label="Share list"
        >
          <ShareIcon />
        </button>
      </header>

      {/* Content */}
      <main className={`flex-1 px-4 py-3 max-w-lg mx-auto w-full ${isOwner && hasSections ? 'pb-20' : 'pb-6'}`}>
        {items.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-600 mt-16 text-sm">
            No items yet. Type below to add one.
          </p>
        )}

        {hasSections ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => `section-${s.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map(section => {
                const sectionItems = items.filter(i => i.sectionId === section.id)
                if (sectionItems.length === 0 && overSectionId !== section.id && !isDraggingRef.current) {
                  return null
                }
                return (
                  <SectionGroup
                    key={section.id}
                    section={section}
                    items={sectionItems}
                    onToggleItem={toggleItem}
                    onDeleteItem={deleteItem}
                    onDeleteSection={deleteSection}
                    onAddToSection={addItem}
                    onUpdateNote={updateNote}
                    isOwner={isOwner}
                    isOver={overSectionId === section.id}
                  />
                )
              })}
            </SortableContext>

            <DragOverlay>
              {activeItem ? (
                <div className="shadow-xl rounded-2xl opacity-95">
                  <ItemRow item={activeItem} onToggle={() => {}} onDelete={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="space-y-1.5">
            {items.filter(i => !i.checked).map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id, item.checked)}
                onDelete={() => deleteItem(item.id)}
                onUpdateNote={updateNote}
              />
            ))}
            {items.filter(i => i.checked).map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id, item.checked)}
                onDelete={() => deleteItem(item.id)}
                onUpdateNote={updateNote}
              />
            ))}
          </div>
        )}

        {/* Add item input — sits below the last item */}
        <div className="relative mt-3">
          {/* Autocomplete suggestions — drops down below the input */}
          {quickAddSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg z-10">
              {quickAddSuggestions.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b last:border-b-0 border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                  onMouseDown={e => {
                    e.preventDefault()
                    setQuickAddValue(s)
                    setQuickAddSuggestions([])
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <input
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-base text-gray-900 dark:text-white outline-none placeholder-gray-400"
            placeholder="Add item…"
            value={quickAddValue}
            onChange={e => setQuickAddValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleQuickAdd()
              if (e.key === 'Escape') { setQuickAddValue(''); setQuickAddSuggestions([]) }
            }}
          />
        </div>
      </main>

      {/* Sticky bottom add-section bar */}
      {isOwner && hasSections && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 px-4 py-3"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          <div className="max-w-lg mx-auto">
            {addingSection ? (
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3">
                <input
                  className="flex-1 text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400"
                  placeholder="Section name"
                  value={newSectionName}
                  onChange={e => setNewSectionName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addSection()
                    if (e.key === 'Escape') { setAddingSection(false); setNewSectionName('') }
                  }}
                  autoFocus
                />
                <button onClick={addSection} className="text-green-600 text-sm font-medium px-2">Add</button>
                <button onClick={() => { setAddingSection(false); setNewSectionName('') }} className="text-gray-400 text-sm px-2">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSection(true)}
                className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-600 py-2 px-1"
              >
                <PlusIcon />
                Add section
              </button>
            )}
          </div>
        </div>
      )}

      {showShare && (
        <ShareModal listId={listId} list={list} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
