'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { AppNotification } from '@/types'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api'

const TYPE_DOT: Record<string, string> = {
  new_application: 'bg-[#c8922a]',
  work_complete:   'bg-[#3eb85a]',
  daily_update:    'bg-[#3eb85a]',
  permit_update:   'bg-[#d4880a]',
  status_change:   'bg-[#4a9de0]',
  job_assigned:    'bg-[#4a9de0]',
}

const REFERENCE_LINKS: Record<string, string> = {
  sub_application: '/admin/applications',
  job:             '/jobs',
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.read).length

  const load = async () => {
    setLoading(true)
    const data = await fetchNotifications('admin')
    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications((n) => n.map((x) => ({ ...x, read: true })))
  }

  const handleRead = async (id: string) => {
    await markNotificationRead(id)
    setNotifications((n) => n.map((x) => x.id === id ? { ...x, read: true } : x))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-md text-[#606070] hover:text-[#e8e8ee] hover:bg-[#151518] transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full bg-[#c8922a] flex items-center justify-center font-mono text-[9px] font-bold text-[#09090b]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-[#0f0f12] border border-[#2a2a32] rounded-lg shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a2a32]">
            <span className="font-display text-sm tracking-wider text-[#e8e8ee]">NOTIFICATIONS</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 font-nav text-[10px] text-[#606070] hover:text-[#e8aa40] transition-colors">
                <CheckCheck size={11} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="space-y-2 p-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[#151518] rounded animate-pulse" />)}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={20} className="text-[#2a2a32] mx-auto mb-2" />
                <p className="font-nav text-xs text-[#606070]">All clear — no notifications.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const dot = TYPE_DOT[n.type] ?? 'bg-[#606070]'
                const link = n.reference_type ? REFERENCE_LINKS[n.reference_type] : null
                return (
                  <div
                    key={n.id}
                    onClick={() => handleRead(n.id)}
                    className={`flex items-start gap-3 px-3 py-2.5 border-b border-[#1a1a22] cursor-pointer hover:bg-[#151518] transition-colors ${!n.read ? 'bg-[#c8922a]/3' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${n.read ? 'bg-[#2a2a32]' : dot}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-nav text-xs font-semibold ${n.read ? 'text-[#606070]' : 'text-[#e8e8ee]'}`}>{n.title}</p>
                      {n.body && <p className="font-body text-[11px] text-[#606070] mt-0.5 leading-relaxed">{n.body}</p>}
                      <p className="font-mono text-[9px] text-[#3a3a48] mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' '}
                        {new Date(n.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    {link && (
                      <a href={link} onClick={(e) => e.stopPropagation()} className="flex-shrink-0 text-[#606070] hover:text-[#e8aa40] transition-colors mt-1">
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
