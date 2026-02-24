import { useSettings } from '../contexts/SettingsContext'

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-12 h-7 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export default function SettingsSheet({ onClose }) {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl shadow-xl px-4 pt-3 pb-10">
        <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5" />
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Settings</h2>

        <SettingRow
          label="Compact view"
          description="Reduce item height to see more of the list"
        >
          <Toggle
            value={settings.compactView}
            onChange={val => updateSetting('compactView', val)}
          />
        </SettingRow>

        {/* Future settings go here as additional <SettingRow> blocks */}
      </div>
    </div>
  )
}
