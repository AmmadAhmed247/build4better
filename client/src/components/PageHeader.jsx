import { ArrowLeft } from 'lucide-react'
import { UI } from '../data/content'

// Dark glass keeps white text readable over any part of the hills.
export default function PageHeader({ lang, title, lead, onBack, media, children }) {
  return (
    <header className="page-hero">
      {onBack && (
        <button type="button" className="back-button" data-guide="page-back" onClick={onBack}>
          <ArrowLeft size="1.375rem" className="rtl:rotate-180" aria-hidden="true" /> {UI.back[lang]}
        </button>
      )}
      <div className="page-hero-row">
        {media && <span className="page-hero-media">{media}</span>}
        <div className="min-w-0">
          <h1 className="display">{title}</h1>
          {lead && <p className="page-hero-lead">{lead}</p>}
          {children}
        </div>
      </div>
    </header>
  )
}
