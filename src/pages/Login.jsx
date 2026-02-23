import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { GoogleIcon } from '../components/icons'

export default function Login() {
  async function handleGoogleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-6">
      <div className="w-full max-w-xs text-center">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">groc-list</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">
          Simple grocery lists for the store
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-4 px-4 text-gray-700 dark:text-gray-200 font-medium shadow-sm active:scale-95 transition-transform"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
