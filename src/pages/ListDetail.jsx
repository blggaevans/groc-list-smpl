import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp, setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import ItemRow from '../components/ItemRow'
import AddItemSheet from '../components/AddItemSheet'
import ShareModal from '../components/ShareModal'
import { BackIcon, ShareIcon } from '../components/icons'

export default function ListDetail() {
  const { listId } = useParams()
  const user = useAuth()
  const navigate = useNavigate()

  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  // Listen to list document
  useEffect(() => {
    return onSnapshot(doc(db, 'lists', listId), snap => {
      if (snap.exists()) {
        const data = snap.data()
        setList({ id: snap.id, ...data })
        // Only update input if user isn't currently editing
        setNameInput(prev => editingName ? prev : data.name)
      }
    })
  }, [listId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen to items subcollection
  useEffect(() => {
    const q = query(
      collection(db, 'lists', listId, 'items'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [listId])

  async function saveListName() {
    const name = nameInput.trim()
    if (!name || name === list?.name) { setEditingName(false); return }
    await updateDoc(doc(db, 'lists', listId), { name, updatedAt: serverTimestamp() })
    setEditingName(false)
  }

  async function addItem({ name, quantity, weight, comment }) {
    // Write item to list
    await addDoc(collection(db, 'lists', listId, 'items'), {
      name,
      quantity,
      weight,
      comment,
      checked: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      addedBy: user.uid,
    })
    // Save to per-user item history for autocomplete
    const historyKey = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    await setDoc(
      doc(db, 'users', user.uid, 'itemHistory', historyKey),
      { name, lastUsed: serverTimestamp() },
      { merge: true },
    )
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

  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)

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
              if (e.key === 'Escape') {
                setNameInput(list?.name ?? '')
                setEditingName(false)
              }
            }}
            autoFocus
          />
        ) : (
          <button
            className="flex-1 text-left text-lg font-semibold text-gray-900 dark:text-white px-1 py-1 rounded-xl active:bg-gray-100 dark:active:bg-gray-800 truncate"
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

      {/* Items */}
      <main className="flex-1 px-4 py-3 max-w-lg mx-auto w-full pb-24">
        {items.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-600 mt-16 text-sm">
            No items yet. Tap + to add one.
          </p>
        )}

        {/* Unchecked items */}
        <div className="space-y-1.5">
          {unchecked.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id, item.checked)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>

        {/* Divider between unchecked and checked */}
        {unchecked.length > 0 && checked.length > 0 && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400 dark:text-gray-600">In cart</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>
        )}

        {/* Checked items */}
        {checked.length > 0 && unchecked.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-600 mb-3 text-center">All done</p>
        )}
        <div className="space-y-1.5 opacity-50">
          {checked.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id, item.checked)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
      </main>

      {/* Add item FAB */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowAddSheet(true)}
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Add item"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {showAddSheet && (
        <AddItemSheet
          userId={user.uid}
          onAdd={async item => { await addItem(item) }}
          onClose={() => setShowAddSheet(false)}
        />
      )}

      {showShare && (
        <ShareModal listId={listId} list={list} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
