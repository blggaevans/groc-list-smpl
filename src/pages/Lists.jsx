import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, addDoc, deleteDoc, doc, query,
  where, onSnapshot, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { db, auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { PencilIcon, TrashIcon } from '../components/icons'

export default function Lists() {
  const user = useAuth()
  const navigate = useNavigate()
  const [lists, setLists] = useState([])
  const [showInput, setShowInput] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [createError, setCreateError] = useState('')

  // Hold latest results from each query so we can merge them on every update
  const ownedRef = useRef([])
  const sharedRef = useRef([])

  function mergeLists() {
    const seen = new Set()
    const merged = [...ownedRef.current, ...sharedRef.current].filter(l => {
      if (seen.has(l.id)) return false
      seen.add(l.id)
      return true
    })
    merged.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
    setLists(merged)
  }

  useEffect(() => {
    if (!user) return

    // Query 1: lists the user owns
    const ownedQ = query(collection(db, 'lists'), where('ownerId', '==', user.uid))
    const unsubOwned = onSnapshot(ownedQ, snap => {
      ownedRef.current = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      mergeLists()
    }, err => console.error('Owned lists error:', err))

    // Query 2: lists shared with the user (by their Google email)
    const sharedQ = query(collection(db, 'lists'), where('collaborators', 'array-contains', user.email))
    const unsubShared = onSnapshot(sharedQ, snap => {
      sharedRef.current = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      mergeLists()
    }, err => console.error('Shared lists error:', err))

    return () => { unsubOwned(); unsubShared() }
  }, [user])

  async function createList() {
    const name = newListName.trim()
    if (!name) return
    const duplicate = lists.some(l => l.name.toLowerCase() === name.toLowerCase())
    if (duplicate) {
      setCreateError(`You already have a list called "${name}"`)
      return
    }
    try {
      await addDoc(collection(db, 'lists'), {
        name,
        ownerId: user.uid,
        collaborators: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setNewListName('')
      setShowInput(false)
      setCreateError('')
    } catch (err) {
      console.error('Failed to create list:', err)
      setCreateError(err.message)
    }
  }

  async function deleteList(listId) {
    await deleteDoc(doc(db, 'lists', listId))
  }

  async function saveRename(listId) {
    const name = editingName.trim()
    if (!name) { setEditingId(null); return }
    await updateDoc(doc(db, 'lists', listId), { name, updatedAt: serverTimestamp() })
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">My Lists</h1>
        <button
          onClick={() => signOut(auth)}
          className="text-sm text-gray-500 dark:text-gray-400 py-2 px-3 rounded-xl active:bg-gray-100 dark:active:bg-gray-800"
        >
          Sign out
        </button>
      </header>

      <main className="px-4 py-4 space-y-2 max-w-lg mx-auto w-full">
        {lists.length === 0 && !showInput && (
          <p className="text-center text-gray-400 dark:text-gray-600 mt-16 text-sm">
            No lists yet. Tap below to create one.
          </p>
        )}

        {lists.map(list => {
          const isOwner = list.ownerId === user.uid

          return (
            <div
              key={list.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              {editingId === list.id ? (
                <div className="flex items-center px-4 py-3.5 gap-2">
                  <input
                    className="flex-1 text-base text-gray-900 dark:text-white bg-transparent outline-none"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveRename(list.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => saveRename(list.id)}
                    className="text-green-600 font-medium text-sm py-1 px-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-400 text-sm py-1 px-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => navigate(`/list/${list.id}`)}
                    className="flex-1 text-left px-4 py-4 min-h-[56px]"
                  >
                    <span className="text-base font-medium text-gray-900 dark:text-white">
                      {list.name}
                    </span>
                    {!isOwner && (
                      <span className="ml-2 text-xs text-gray-400 dark:text-gray-600 font-normal">
                        Shared
                      </span>
                    )}
                  </button>

                  {isOwner ? (
                    <>
                      <button
                        onClick={() => { setEditingId(list.id); setEditingName(list.name) }}
                        className="p-4 text-gray-400 dark:text-gray-600 active:text-gray-600 dark:active:text-gray-400"
                        aria-label="Rename list"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => deleteList(list.id)}
                        className="p-4 text-gray-400 dark:text-gray-600 active:text-red-500"
                        aria-label="Delete list"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  ) : (
                    <span className="px-4 text-xs text-gray-300 dark:text-gray-700">
                      collab
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* New list input */}
        {showInput && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 py-3.5 flex items-center gap-2">
            <input
              className="flex-1 text-base text-gray-900 dark:text-white bg-transparent outline-none placeholder-gray-400"
              placeholder="List name"
              value={newListName}
              onChange={e => { setNewListName(e.target.value); setCreateError('') }}
              onKeyDown={e => {
                if (e.key === 'Enter') createList()
                if (e.key === 'Escape') { setShowInput(false); setNewListName(''); setCreateError('') }
              }}
              autoFocus
            />
            <button onClick={createList} className="text-green-600 font-medium text-sm py-1 px-2">
              Add
            </button>
            <button
              onClick={() => { setShowInput(false); setNewListName(''); setCreateError('') }}
              className="text-gray-400 text-sm py-1 px-2"
            >
              Cancel
            </button>
          </div>
        )}

        {createError && (
          <p className="text-red-500 text-sm px-1">{createError}</p>
        )}

        {/* New list button */}
        {!showInput && (
          <button
            onClick={() => setShowInput(true)}
            className="w-full flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-4 text-green-600 font-medium text-base active:bg-gray-50 dark:active:bg-gray-800 min-h-[56px]"
          >
            <span className="text-xl leading-none font-light">+</span>
            New list
          </button>
        )}
      </main>
    </div>
  )
}
