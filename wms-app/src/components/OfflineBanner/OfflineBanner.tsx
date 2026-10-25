import { RefreshCw, WifiOff } from 'lucide-react'
import type { DataSource } from '../../hooks/useItems'
import './OfflineBanner.css'

interface OfflineBannerProps {
  source: DataSource
  onRetry: () => void
}

// ჩანს, როცა სერვერი გათიშულია და მონაცემები ლოკალურია
function OfflineBanner({ source, onRetry }: OfflineBannerProps) {
  if (source === 'server') return null

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={20} aria-hidden="true" className="offline-banner__icon" />
      <p className="offline-banner__text">
        <strong>
          ⚠ ნაჩვენებია ლოკალური {source === 'cache' ? 'ქეშირებული' : 'დემო'} მონაცემები.
        </strong>{' '}
        სერვერი მიუწვდომელია — ცვლილებების შენახვა დროებით შეუძლებელია.
      </p>
      <button className="btn-secondary offline-banner__btn" onClick={onRetry}>
        <RefreshCw size={16} aria-hidden="true" />
        ხელახლა ცდა
      </button>
    </div>
  )
}

export default OfflineBanner
