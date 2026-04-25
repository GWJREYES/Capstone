'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { HardHat, Send, CheckCircle, ArrowLeft } from 'lucide-react'

const TRADES = ['foundation','roofing','remodel','kitchen','concrete','framing','windows','siding','exterior','hvac','plumbing','electrical']
const STATES = ['MA','RI','CT','NH','ME','VT','NY']

export default function SubPortalRegister() {
  const router  = useRouter()
  const [step, setStep]       = useState<'form' | 'success'>('form')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [form, setForm] = useState({
    company: '', contact_name: '', trade: 'roofing', crew_size: 1,
    license_number: '', license_expiry: '', hourly_rate: '',
    phone: '', email: '', city: '', state: 'MA',
    bio: '', years_experience: '', insurance_carrier: '', insurance_policy: '',
    references_text: '',
  })

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/sub-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          crew_size: parseInt(form.crew_size as any) || 1,
          hourly_rate: parseFloat(form.hourly_rate) || null,
          years_experience: parseInt(form.years_experience) || 0,
          license_expiry: form.license_expiry || null,
        }),
      })
      if (!res.ok) throw new Error('Submission failed. Please try again.')
      setStep('success')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-[#3eb85a]/10 border border-[#3eb85a]/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[#3eb85a]" />
          </div>
          <h2 className="font-display text-2xl tracking-widest text-[#e8e8ee] mb-2">APPLICATION SUBMITTED</h2>
          <p className="font-body text-sm text-[#9090a0] max-w-xs mx-auto leading-relaxed">
            We'll review your application within 1–2 business days and reach out to the email you provided.
          </p>
          <button
            onClick={() => router.push('/sub-portal')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-lg font-nav text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={14} /> Back to Portal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Capstone General Contracting" className="h-16 w-auto mx-auto mb-4" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <h1 className="font-display text-2xl tracking-widest text-[#e8e8ee]">SUBCONTRACTOR APPLICATION</h1>
          <p className="font-nav text-sm text-[#606070] mt-1">Apply to work with Capstone General Contracting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Info */}
          <Section title="Company Information">
            <Field label="Company Name *" required>
              <input type="text" value={form.company} onChange={(e) => set('company', e.target.value)}
                required placeholder="Your company name" className={fieldClass} />
            </Field>
            <Field label="Primary Contact *" required>
              <input type="text" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)}
                required placeholder="Full name" className={fieldClass} />
            </Field>
            <Field label="Phone *" required>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
                required placeholder="617-555-0100" className={fieldClass} />
            </Field>
            <Field label="Email *" required>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                required placeholder="you@company.com" className={fieldClass} />
            </Field>
            <Field label="City *" required>
              <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                required placeholder="City" className={fieldClass} />
            </Field>
            <Field label="State">
              <select value={form.state} onChange={(e) => set('state', e.target.value)} className={fieldClass}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </Section>

          {/* Trade & Capacity */}
          <Section title="Trade & Capacity">
            <Field label="Primary Trade *" required>
              <select value={form.trade} onChange={(e) => set('trade', e.target.value)} className={fieldClass}>
                {TRADES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Crew Size">
              <input type="number" min="1" value={form.crew_size} onChange={(e) => set('crew_size', e.target.value)}
                className={fieldClass} />
            </Field>
            <Field label="Years in Business">
              <input type="number" min="0" value={form.years_experience} onChange={(e) => set('years_experience', e.target.value)}
                placeholder="0" className={fieldClass} />
            </Field>
            <Field label="Hourly Rate ($/hr)">
              <input type="number" min="0" step="0.50" value={form.hourly_rate} onChange={(e) => set('hourly_rate', e.target.value)}
                placeholder="85" className={fieldClass} />
            </Field>
          </Section>

          {/* Licensing & Insurance */}
          <Section title="Licensing & Insurance">
            <Field label="License Number">
              <input type="text" value={form.license_number} onChange={(e) => set('license_number', e.target.value)}
                placeholder="MA-ROF-00000" className={fieldClass} />
            </Field>
            <Field label="License Expiry">
              <input type="date" value={form.license_expiry} onChange={(e) => set('license_expiry', e.target.value)}
                className={fieldClass} />
            </Field>
            <Field label="Insurance Carrier">
              <input type="text" value={form.insurance_carrier} onChange={(e) => set('insurance_carrier', e.target.value)}
                placeholder="Travelers, Liberty Mutual, etc." className={fieldClass} />
            </Field>
            <Field label="Policy Number">
              <input type="text" value={form.insurance_policy} onChange={(e) => set('insurance_policy', e.target.value)}
                placeholder="Policy #" className={fieldClass} />
            </Field>
          </Section>

          {/* Bio & References */}
          <Section title="About Your Company">
            <div className="col-span-2">
              <label className={labelClass}>Tell us about your experience</label>
              <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4}
                placeholder="Describe your experience, specialties, and the types of projects you typically work on..."
                className={`${fieldClass} resize-none`} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>References (company names or contacts)</label>
              <textarea value={form.references_text} onChange={(e) => set('references_text', e.target.value)} rows={2}
                placeholder="e.g. Smith Builders, Boston MA · Jones Renovations, Worcester MA"
                className={`${fieldClass} resize-none`} />
            </div>
          </Section>

          {error && (
            <div className="px-4 py-3 bg-[#b83232]/10 border border-[#b83232]/30 rounded-lg">
              <p className="font-body text-sm text-[#b83232]">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] rounded-lg font-display text-xl tracking-wider transition-colors disabled:opacity-60">
              <Send size={18} />
              {saving ? 'SUBMITTING…' : 'SUBMIT APPLICATION'}
            </button>
            <a href="/sub-portal"
              className="px-4 py-3 bg-[#151518] border border-[#2a2a32] rounded-lg font-nav text-sm text-[#9090a0] hover:text-[#e8e8ee] transition-colors flex items-center">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldClass = 'w-full bg-[#0f0f12] border border-[#2a2a32] rounded-lg px-3 py-2.5 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold'
const labelClass = 'font-nav text-[10px] uppercase tracking-wider text-[#606070] mb-1.5 block'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#151518] border border-[#2a2a32] rounded-xl p-5">
      <h3 className="font-display text-sm tracking-wider text-[#9090a0] mb-4">{title.toUpperCase()}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className={labelClass}>
        {label}{required && <span className="text-[#b83232] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
