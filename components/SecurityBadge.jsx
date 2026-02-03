/**
 * SecurityBadge component
 * Displays a visual indicator of the local-first security model
 */

export default function SecurityBadge() {
  return (
    <div className="security-badge flex items-center gap-2 p-3 bg-gray-700 rounded-lg border border-gray-600 text-sm">
      <div className="security-icon">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="security-text">
        <span className="font-medium text-green-400">Local-First Security</span>
        <p className="text-gray-300 text-xs mt-1">Your API keys and sequences never leave your device</p>
      </div>
    </div>
  );
}