'use client'

import { useState } from 'react'
import { Check, Clipboard } from 'lucide-react'

const CHECKLISTS: Record<string, { label: string; severity: 'HIGH' | 'MED' | 'LOW' }[]> = {
  Foundation: [
    { label: 'Footing depth meets frost line (42" min MA/NH/CT/RI)', severity: 'HIGH' },
    { label: 'Concrete strength verified (≥3000 PSI)', severity: 'HIGH' },
    { label: 'Waterproofing membrane applied to exterior walls', severity: 'HIGH' },
    { label: 'Drainage tile/pipe installed at base of footing', severity: 'HIGH' },
    { label: 'Anchor bolts placed per plan (within 12" of corners)', severity: 'MED' },
    { label: 'Sump pump pit formed and located', severity: 'MED' },
    { label: 'Insulation R-value meets code (R-10 min below grade)', severity: 'MED' },
    { label: 'Pier footings installed and level', severity: 'MED' },
    { label: 'Radon mitigation stub-up installed', severity: 'LOW' },
    { label: 'Form stripping completed and forms removed', severity: 'LOW' },
    { label: 'Backfill compacted in lifts (no machinery on fresh pour)', severity: 'MED' },
    { label: 'Matterport scan completed before backfill', severity: 'HIGH' },
  ],
  Roofing: [
    { label: 'Existing decking inspected for rot, delamination', severity: 'HIGH' },
    { label: 'All existing layers removed (if tear-off)', severity: 'HIGH' },
    { label: 'Ice & water shield installed (min 24" from eave)', severity: 'HIGH' },
    { label: 'Drip edge installed at eaves and rakes', severity: 'HIGH' },
    { label: 'Underlayment installed per mfr specs', severity: 'MED' },
    { label: 'Valley flashing installed (W-metal or closed cut)', severity: 'HIGH' },
    { label: 'Step flashing at all wall transitions', severity: 'HIGH' },
    { label: 'Ridge vent or attic ventilation adequate', severity: 'MED' },
    { label: 'Shingles nailed 6 per shingle (high-wind)', severity: 'MED' },
    { label: 'Pipe boots and penetration flashing sealed', severity: 'MED' },
    { label: 'Gutters re-attached plumb and slope to downspout', severity: 'LOW' },
    { label: 'Matterport 3D scan of finished roof', severity: 'HIGH' },
  ],
  Remodel: [
    { label: 'Permit pulled and posted on-site', severity: 'HIGH' },
    { label: 'Demo scope agreed and documented', severity: 'HIGH' },
    { label: 'Asbestos/lead testing completed (pre-1980 homes)', severity: 'HIGH' },
    { label: 'Structural walls identified before demo', severity: 'HIGH' },
    { label: 'MEP rough-ins inspected before closing walls', severity: 'HIGH' },
    { label: 'Blocking installed for future fixture locations', severity: 'MED' },
    { label: 'Insulation installed and inspected', severity: 'MED' },
    { label: 'Drywall fire blocking at penetrations', severity: 'HIGH' },
    { label: 'Flooring transitions and thresholds installed', severity: 'LOW' },
    { label: 'Punch list walkthrough completed with customer', severity: 'HIGH' },
    { label: 'All fixtures operational and tested', severity: 'MED' },
    { label: 'Matterport before/after 3D scan', severity: 'MED' },
  ],
  Exterior: [
    { label: 'House wrap / WRB installed continuous', severity: 'HIGH' },
    { label: 'Flashing at all windows and doors', severity: 'HIGH' },
    { label: 'Window and door installation plumb, level, square', severity: 'HIGH' },
    { label: 'Siding nailed per mfr specs (not overdriven)', severity: 'MED' },
    { label: 'Corner trim and J-channel sealed', severity: 'MED' },
    { label: 'Expansion gaps maintained (vinyl siding)', severity: 'MED' },
    { label: 'Caulking at all penetrations and transitions', severity: 'MED' },
    { label: 'Trim paint or stain applied (if wood)', severity: 'LOW' },
    { label: 'Grade slopes away from foundation (6" per 10ft)', severity: 'HIGH' },
    { label: 'Hose bibs and exterior outlets checked', severity: 'LOW' },
  ],
}

const SEVERITY_STYLES: Record<string, string> = {
  HIGH: 'bg-red-900/30 text-[#b83232] border-red-800/40',
  MED: 'bg-amber-900/30 text-[#d4880a] border-amber-800/40',
  LOW: 'bg-[#151518] text-[#606070] border-[#2a2a32]',
}

const TABS = ['Foundation', 'Roofing', 'Remodel', 'Exterior']

export default function InspectPage() {
  const [activeTab, setActiveTab] = useState('Roofing')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [jobId, setJobId] = useState('')
  const [inspector, setInspector] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [matterport, setMatterport] = useState('')
  const [onedrive, setOnedrive] = useState('')
  const [rilla, setRilla] = useState('')

  const items = CHECKLISTS[activeTab] || []
  const doneCount = items.filter((_, i) => checked[`${activeTab}-${i}`]).length

  const toggleItem = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">INSPECTION FORMS</h1>
        <p className="font-nav text-sm text-[#606070] mt-0.5">Pre-inspection checklists by trade</p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Checklist panel */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Tab bar */}
          <div className="flex gap-1 mb-4 bg-[#0f0f12] border border-[#2a2a32] p-1 rounded-lg">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded font-nav text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab
                    ? 'bg-[#c8922a] text-[#09090b]'
                    : 'text-[#9090a0] hover:text-[#e8e8ee]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-1.5 bg-[#0f0f12] rounded-full overflow-hidden border border-[#2a2a32]">
              <div
                className="h-full rounded-full bg-[#3eb85a] transition-all duration-500"
                style={{ width: `${items.length > 0 ? (doneCount / items.length) * 100 : 0}%` }}
              />
            </div>
            <span className="font-mono text-xs text-[#606070] whitespace-nowrap">
              {doneCount}/{items.length}
            </span>
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {items.map((item, i) => {
              const key = `${activeTab}-${i}`
              const isChecked = !!checked[key]
              return (
                <button
                  key={key}
                  onClick={() => toggleItem(key)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                    isChecked
                      ? 'border-[#3eb85a]/20 bg-[#3eb85a]/5'
                      : 'border-[#2a2a32] bg-[#151518] hover:border-[#606070]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isChecked ? 'bg-[#3eb85a] border-[#3eb85a]' : 'border-[#2a2a32]'
                  }`}>
                    {isChecked && <Check size={12} className="text-[#09090b]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-sm leading-snug ${isChecked ? 'text-[#3eb85a] line-through decoration-[#3eb85a]/40' : 'text-[#e8e8ee]'}`}>
                      {item.label}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-nav font-semibold px-2 py-0.5 rounded border ${SEVERITY_STYLES[item.severity]}`}>
                    {item.severity}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Attach panel */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#2a2a32] p-4 lg:p-6 space-y-4">
          <div>
            <h3 className="font-display text-base tracking-wider text-[#9090a0] mb-3 flex items-center gap-2">
              <Clipboard size={14} className="text-[#c8922a]" />
              ATTACH TO JOB
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Job ID</label>
                <input value={jobId} onChange={(e) => setJobId(e.target.value)}
                  placeholder="JOB-0001"
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Inspector Name</label>
                <input value={inspector} onChange={(e) => setInspector(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold" />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Inspection Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] input-gold" />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows={2} placeholder="Inspection notes..."
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold resize-none" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm tracking-wider text-[#9090a0] mb-3">DOCUMENTATION</h3>
            <div className="space-y-2">
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Matterport URL</label>
                <input type="url" value={matterport} onChange={(e) => setMatterport(e.target.value)}
                  placeholder="https://matterport.com/..."
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-xs text-[#e8e8ee] placeholder-[#606070] input-gold" />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">OneDrive URL</label>
                <input type="url" value={onedrive} onChange={(e) => setOnedrive(e.target.value)}
                  placeholder="https://onedrive.com/..."
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-xs text-[#e8e8ee] placeholder-[#606070] input-gold" />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Rilla URL</label>
                <input type="url" value={rilla} onChange={(e) => setRilla(e.target.value)}
                  placeholder="https://app.rilla.com/..."
                  className="w-full bg-[#0f0f12] border border-[#2a2a32] rounded px-3 py-2 font-mono text-xs text-[#e8e8ee] placeholder-[#606070] input-gold" />
              </div>
            </div>
          </div>

          <button
            className="w-full px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors"
          >
            Save Inspection
          </button>
        </div>
      </div>
    </div>
  )
}
