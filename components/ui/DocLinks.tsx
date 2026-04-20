import { ExternalLink } from 'lucide-react'

interface DocLinksProps {
  matterport_url?: string
  onedrive_url?: string
  rilla_url?: string
  has3d?: boolean
  compact?: boolean
}

const BADGES = [
  { key: '3D', urlKey: 'matterport_url', label: '3D', title: 'Matterport 3D Scan' },
  { key: 'VID', urlKey: 'onedrive_url', label: 'VID', title: 'Video / OneDrive' },
  { key: 'RLA', urlKey: 'rilla_url', label: 'RLA', title: 'Rilla Sales Call' },
]

export default function DocLinks({ matterport_url, onedrive_url, rilla_url, compact }: DocLinksProps) {
  const urls: Record<string, string | undefined> = {
    matterport_url,
    onedrive_url,
    rilla_url,
  }

  return (
    <div className="flex items-center gap-1">
      {BADGES.map(({ key, urlKey, label, title }) => {
        const url = urls[urlKey]
        const linked = !!url

        if (linked) {
          return (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={title}
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#c8922a]/40 bg-[#c8922a]/10 text-[#e8aa40] hover:bg-[#c8922a]/20 transition-colors ${compact ? '' : ''}`}
            >
              {label}
              <ExternalLink size={8} />
            </a>
          )
        }

        return (
          <span
            key={key}
            title={`${title} — not linked`}
            className="inline-flex items-center font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#2a2a32] bg-[#151518] text-[#606070]"
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}
