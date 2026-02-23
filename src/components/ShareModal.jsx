import { useState } from 'react'
import { arrayUnion, arrayRemove, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export default function ShareModal({ listId, list, onClose }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // 'added' | 'error'

  const collaborators = list?.collaborators ?? []

  async function addCollaborator() {
    const e = email.trim().toLowerCase()
    if (!e || collaborators.includes(e)) return
    try {
      await updateDoc(doc(db, 'lists', listId), {
        collaborators: arrayUnion(e),
        updatedAt: serverTimestamp(),
      })
      setEmail('')
      setStatus('added')
      setTimeout(() => setStatus(null), 2500)
    } catch {
      setStatus('error')
    }
  }

  async function removeCollaborator(e) {
    await updateDoc(doc(db, 'lists', listId), {
      collaborators: arrayRemove(e),
      updatedAt: serverTimestamp(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl px-4 pt-3 pb-8">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Share list</h2>

        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3.5 text-base text-gray-900 dark:text-white outline-none placeholder-gray-400"
            placeholder="Collaborator's Google email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCollaborator() }}
          />
          <button
            onClick={addCollaborator}
            disabled={!email.trim()}
            className="bg-green-600 text-white rounded-xl px-5 font-medium disabled:opacity-40"
          >
            Add
          </button>
        </div>

        {status === 'added' && (
          <p className="text-green-600 text-sm mb-3">Collaborator added. They can now access this list.</p>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-sm mb-3">Something went wrong. Try again.</p>
        )}

        {collaborators.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider font-medium mb-2">
              Shared with
            </p>
            <div className="space-y-1">
              {collaborators.map(c => (
                <div key={c} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{c}</span>
                  <button
                    onClick={() => removeCollaborator(c)}
                    className="text-xs text-red-500 font-medium px-2 py-1 active:opacity-70"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
