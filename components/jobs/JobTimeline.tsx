'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRight, MessageSquare, UserCheck, FileCheck,
  ClipboardList, Star, Paperclip, Clock,
} from 'lucide-react'
import { JobTimelineEvent, TimelineEventType } from '@/types'
import { fetchJobTimeline, addTimelineEvent } from '@/lib/api'
import { MOCK_TIMELINE } from '@/lib/constants'

const EVENT_ICONS: Record<TimelineEventType, React.ReactNode> = {
  status_change: <ArrowRight size={12} />,
  note:          <MessageSquare size={12} />,
  assignment:    <UserCheck size={12} />,
  permit_update: <FileCheck size={12} />,
  daily_update:  <ClipboardList size={12} />,
  milestone:     <Star size={12} />,
  document:      <Paperclip size={12} />,
}

const EVENT_COLORS: Record<TimelineEventType, string> = {
  status_change: 'bg-[#4a9de0]/20 border-[#4a9de0]/40 text-[#4a9de0]',
  note:          'bg-[#606070]/20 border-[#606070]/40 text-[#9090a0]',
  assignment:    'bg-[#c8922a]/20 border-[#c8922a]/40 text-[#e8aa40]',
  permit_update: 'bg-amber-900/30 border-amber-800/40 text-[#d4880a]',
  daily_update:  'bg-green-900/20 border-green-dim/30 text-[#3eb85a]',
  milestone:     'bg-[#c8922a]/20 border-[#c8922a]/40 text-[#e8aa40]',
  document:      'bg-[#606070]/20 border-[#606070]/40 text-[#9090a0]',
}

const ACTOR_BADGE: Record<string, string> = {
  admin:          'bg-[#4a9de0]/10 text-[#4a9de0] border-[#4a9de0]/30',
  subcontractor:  'bg-[#c8922a]/10 text-[#e8aa40] border-[#c8922a]/30',
  system:         'bg-[#151518] text-[#606070] border-[#2a2a32]',
}

interface Props { jobId: string }

export default function JobTimeline({ jobId }: Props) {
  const [events, setEvents]     = useState<JobTimelineEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [addingNote, setAddingNote] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    fetchJobTimeline(jobId)
      .then((data) => setEvents(data.length > 0 ? data : (MOCK_TIMELINE[jobId] ?? [])))
      .finally(() => setLoading(false))
  }, [jobId])

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setSaving(true)
    const event = await addTimelineEvent({
      job_id: jobId,
      event_type: 'note',
      description: noteText,
      actor: 'Admin',
      actor_type: 'admin',
      metadata: {},
    })
    if (event) {
      setEvents((e) => [event, ...e])
    } else {
      // Optimistic fallback
      setEvents((e) => [{
        id: `local-${Date.now()}`,
        job_id: jobId,
        event_type: 'note',
        from_status: null,
        to_status: null,
        description: noteText,
        actor: 'Admin',
        actor_type: 'admin',
        metadata: {},
        created_at: new Date().toISOString(),
      }, ...e])
    }
    setNoteText('')
    setAddingNote(false)
    setSaving(false)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#c8922a]" />
          <span className="font-display text-sm tracking-wider text-[#9090a0]">TIMELINE</span>
        </div>
        <button
          onClick={() => setAddingNote(!addingNote)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#151518] border border-[#2a2a32] hover:border-[#c8922a]/40 rounded-md font-nav text-xs text-[#9090a0] hover:text-[#e8e8ee] transition-colors"
        >
          <MessageSquare size={12} /> Add Note
        </button>
      </div>

      {/* Add note form */}
      {addingNote && (
        <div className="bg-[#0f0f12] border border-[#c8922a]/20 rounded-lg p-3 space-y-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
            placeholder="Add a note to the job timeline..."
            className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#3a3a48] input-gold resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleAddNote} disabled={saving || !noteText.trim()}
              className="px-4 py-1.5 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-md font-nav text-xs font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Post Note'}
            </button>
            <button onClick={() => { setAddingNote(false); setNoteText('') }}
              className="px-4 py-1.5 bg-[#151518] border border-[#2a2a32] text-[#9090a0] rounded-md font-nav text-xs transition-colors hover:text-[#e8e8ee]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Events */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-[#151518] rounded animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <Clock size={24} className="text-[#2a2a32] mx-auto mb-2" />
          <p className="font-nav text-xs text-[#606070]">No events yet. Timeline is auto-populated as the job progresses.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-[#2a2a32]" />
          <div className="space-y-3">
            {events.map((ev) => {
              const iconStyle = EVENT_COLORS[ev.event_type] ?? EVENT_COLORS.note
              return (
                <div key={ev.id} className="flex gap-3">
                  {/* Icon dot */}
                  <div className={`relative z-10 w-[38px] h-[38px] flex-shrink-0 rounded-full border flex items-center justify-center ${iconStyle}`}>
                    {EVENT_ICONS[ev.event_type] ?? <Clock size={12} />}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 bg-[#151518] border border-[#2a2a32] rounded-lg px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {ev.event_type === 'status_change' && ev.from_status && ev.to_status && (
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="font-nav text-[10px] bg-[#0f0f12] border border-[#2a2a32] px-2 py-0.5 rounded text-[#9090a0] capitalize">
                              {ev.from_status.replace('_', ' ')}
                            </span>
                            <ArrowRight size={10} className="text-[#606070] flex-shrink-0" />
                            <span className="font-nav text-[10px] bg-[#c8922a]/10 border border-[#c8922a]/30 px-2 py-0.5 rounded text-[#e8aa40] capitalize">
                              {ev.to_status.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                        <p className="font-body text-xs text-[#9090a0] leading-relaxed">{ev.description}</p>
                        {ev.metadata?.completion_pct != null && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-[#0f0f12] rounded-full overflow-hidden">
                              <div className="h-full pipeline-bar rounded-full" style={{ width: `${ev.metadata.completion_pct}%` }} />
                            </div>
                            <span className="font-mono text-[10px] text-[#e8aa40]">{ev.metadata.completion_pct}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded border font-nav text-[9px] font-semibold tracking-wider capitalize ${ACTOR_BADGE[ev.actor_type] ?? ACTOR_BADGE.system}`}>
                          {ev.actor_type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-nav text-[10px] text-[#3a3a48]">{ev.actor}</span>
                      <span className="font-mono text-[10px] text-[#3a3a48]">
                        {new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' '}
                        {new Date(ev.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
