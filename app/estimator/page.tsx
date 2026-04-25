'use client'

import { useState, useCallback, useMemo } from 'react'
import { Wand2, Download, RefreshCw, ChevronDown, Check, FileText, Ruler } from 'lucide-react'
import DropZone from '@/components/estimator/DropZone'
import LineItemsTable, { LineItem } from '@/components/estimator/LineItemsTable'
import { TRADE_DEFAULTS, TAX_RATES, REGIONS } from '@/lib/constants'
import { createQuote } from '@/lib/api'

const TRADE_OPTIONS = ['foundation', 'roofing', 'remodel', 'kitchen', 'concrete', 'framing', 'windows', 'siding', 'exterior', 'hvac', 'plumbing', 'electrical']
const PRESETS = ['Foundation', 'Roofing', 'Remodel', 'Concrete', 'Kitchen', 'Framing']

const LOADING_STEPS = [
  'Uploading photo to AI...',
  'Analyzing project scope...',
  'Identifying materials & quantities...',
  'Calculating regional pricing...',
  'Building line item estimate...',
]

interface Measurements {
  length: string
  width: string
  height: string
  pitch: string
}

interface EstimateResult {
  summary: string
  confidence: number
  notes: string
  lineItems: LineItem[]
}

export default function EstimatorPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageType, setImageType] = useState<string>('image/jpeg')
  const [description, setDescription] = useState('')
  const [trade, setTrade] = useState('roofing')
  const [region, setRegion] = useState('Boston, MA')
  const [markup, setMarkup] = useState(TRADE_DEFAULTS.roofing.markup)
  const [waste, setWaste] = useState(TRADE_DEFAULTS.roofing.waste)
  const [labor, setLabor] = useState(TRADE_DEFAULTS.roofing.labor)
  const [laborHours, setLaborHours] = useState(40)
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [permitEnabled, setPermitEnabled] = useState(false)
  const [permitAmount, setPermitAmount] = useState(500)

  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [savingQuote, setSavingQuote] = useState(false)
  const [savedQuote, setSavedQuote] = useState(false)
  const [measurements, setMeasurements] = useState<Measurements>({ length: '', width: '', height: '', pitch: '' })

  const measuredArea = useMemo(() => {
    const l = parseFloat(measurements.length)
    const w = parseFloat(measurements.width)
    return !isNaN(l) && !isNaN(w) && l > 0 && w > 0 ? (l * w).toFixed(1) : null
  }, [measurements.length, measurements.width])

  const measuredPerimeter = useMemo(() => {
    const l = parseFloat(measurements.length)
    const w = parseFloat(measurements.width)
    return !isNaN(l) && !isNaN(w) && l > 0 && w > 0 ? (2 * (l + w)).toFixed(1) : null
  }, [measurements.length, measurements.width])

  const hasMeasurements = measurements.length || measurements.width || measurements.height || measurements.pitch

  const currentState = region.split(', ')[1] || 'MA'
  const taxRate = TAX_RATES[currentState] || 0
  const isNH = currentState === 'NH'

  const handlePreset = (preset: string) => {
    const key = preset.toLowerCase()
    const defaults = TRADE_DEFAULTS[key]
    if (defaults) {
      setTrade(key)
      setMarkup(defaults.markup)
      setWaste(defaults.waste)
      setLabor(defaults.labor)
    }
  }

  const handleTradeChange = (t: string) => {
    setTrade(t)
    const defaults = TRADE_DEFAULTS[t]
    if (defaults) {
      setMarkup(defaults.markup)
      setWaste(defaults.waste)
      setLabor(defaults.labor)
    }
  }

  const handleFile = useCallback((file: File, base64: string) => {
    setImageBase64(base64)
    setImageType(file.type)
    setImagePreview(URL.createObjectURL(file))
  }, [])

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setLoadingStep(0)

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 900)

    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageBase64,
          media_type: imageType,
          description,
          trade,
          region,
          measurements: hasMeasurements ? measurements : null,
          measured_area: measuredArea,
          measured_perimeter: measuredPerimeter,
        }),
      })

      clearInterval(stepInterval)
      setLoadingStep(LOADING_STEPS.length - 1)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'API error')
      }

      const data = await res.json()

      const items: LineItem[] = []
      if (data.categories) {
        for (const cat of data.categories) {
          for (const item of cat.items || []) {
            const base = item.qty * item.unit_price
            items.push({
              id: `item-${Math.random().toString(36).slice(2)}`,
              description: item.description,
              unit: item.unit,
              qty: item.qty,
              unit_price: item.unit_price,
              base_total: base,
              markup_pct: markup,
              total_with_markup: base * (1 + markup / 100),
              category: item.category || cat.name,
            })
          }
        }
      }

      setLineItems(items)
      setResult({
        summary: data.summary || '',
        confidence: data.confidence || 0.75,
        notes: data.notes || '',
        lineItems: items,
      })
    } catch (err: any) {
      clearInterval(stepInterval)
      setError(err.message || 'Failed to generate estimate')
    } finally {
      setLoading(false)
    }
  }

  // Calculations
  const rawMaterials = lineItems.reduce((sum, i) => sum + i.base_total, 0)
  const wasteAmount = rawMaterials * (waste / 100)
  const materialsWithWaste = rawMaterials + wasteAmount
  const taxAmount = isNH || !taxEnabled ? 0 : materialsWithWaste * taxRate
  const laborAmount = labor * laborHours
  const permitAmt = permitEnabled ? permitAmount : 0
  const basis = materialsWithWaste + taxAmount + laborAmount + permitAmt
  const markupAmount = basis * (markup / 100)
  const customerTotal = basis + markupAmount
  const grossProfit = markupAmount
  const marginPct = customerTotal > 0 ? (grossProfit / customerTotal) * 100 : 0

  const handleSaveAsQuote = async () => {
    setSavingQuote(true)
    try {
      await createQuote({
        trade,
        subtotal: rawMaterials,
        waste_amount: wasteAmount,
        tax_amount: taxAmount,
        labor_amount: laborAmount,
        permit_amount: permitAmt,
        markup_amount: markupAmount,
        total: customerTotal,
        margin: marginPct / 100,
        notes: description,
      })
      setSavedQuote(true)
      setTimeout(() => setSavedQuote(false), 4000)
    } catch {
      setSavedQuote(true)
      setTimeout(() => setSavedQuote(false), 4000)
    } finally {
      setSavingQuote(false)
    }
  }

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : fmt(n)

  return (
    <div className="min-h-screen bg-[#09090b] pt-14 lg:pt-0">
      <div className="px-6 pt-6 pb-4 border-b border-[#2a2a32]">
        <h1 className="font-display text-3xl tracking-widest text-[#e8e8ee]">AI ESTIMATOR</h1>
        <p className="font-nav text-sm text-[#606070] mt-0.5">Upload a project photo and get an AI-powered material estimate</p>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)]">
        {/* Left Panel — Controls */}
        <div className="w-full lg:w-96 lg:flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#2a2a32] lg:overflow-y-auto lg:sticky lg:top-0 lg:h-[calc(100vh-100px)]">
          <div className="p-4 space-y-4">
            {/* Quick Presets */}
            <div>
              <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-2 block">Quick Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePreset(p)}
                    className={`px-3 py-1.5 rounded font-nav text-xs font-semibold transition-colors ${
                      trade === p.toLowerCase()
                        ? 'bg-[#c8922a] text-[#09090b]'
                        : 'bg-[#151518] border border-[#2a2a32] text-[#9090a0] hover:border-[#c8922a]/40 hover:text-[#e8e8ee]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Drop Zone */}
            <div>
              <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-2 block">Project Photo</label>
              <DropZone
                onFile={handleFile}
                preview={imagePreview}
                onClear={() => { setImagePreview(null); setImageBase64(null) }}
              />
            </div>

            {/* LiDAR / Field Measurements */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Ruler size={11} className="text-[#606070]" />
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070]">
                  Field Measurements <span className="text-[#3a3a48] normal-case tracking-normal">(optional — use iPhone Measure app)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'length', label: 'Length (ft)' },
                  { key: 'width',  label: 'Width (ft)'  },
                  { key: 'height', label: 'Height (ft)' },
                  { key: 'pitch',  label: 'Pitch (e.g. 8/12)' },
                ] as { key: keyof Measurements; label: string }[]).map(({ key, label }) => (
                  <div key={key}>
                    <label className="font-nav text-[9px] tracking-wide uppercase text-[#3a3a48] mb-0.5 block">{label}</label>
                    <input
                      type={key === 'pitch' ? 'text' : 'number'}
                      min="0"
                      step="0.1"
                      value={measurements[key]}
                      onChange={(e) => setMeasurements(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={key === 'pitch' ? '8/12' : '0'}
                      className="w-full bg-[#151518] border border-[#2a2a32] rounded px-2 py-1.5 font-mono text-xs text-[#e8e8ee] placeholder-[#3a3a48] input-gold"
                    />
                  </div>
                ))}
              </div>
              {(measuredArea || measuredPerimeter) && (
                <div className="mt-2 flex gap-3 px-2 py-1.5 rounded bg-[#c8922a]/5 border border-[#c8922a]/15">
                  {measuredArea && (
                    <div>
                      <span className="font-nav text-[9px] uppercase text-[#606070] tracking-wider">Area </span>
                      <span className="font-mono text-xs text-[#e8aa40]">{measuredArea} sq ft</span>
                    </div>
                  )}
                  {measuredPerimeter && (
                    <div>
                      <span className="font-nav text-[9px] uppercase text-[#606070] tracking-wider">Perimeter </span>
                      <span className="font-mono text-xs text-[#e8aa40]">{measuredPerimeter} ln ft</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Project Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Full tear-off and replacement of 2,400 sq ft residential roof, 8/12 pitch, with two layers of existing shingles..."
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-body text-sm text-[#e8e8ee] placeholder-[#606070] input-gold resize-none"
              />
            </div>

            {/* Trade + Region */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Trade</label>
                <select
                  value={trade}
                  onChange={(e) => handleTradeChange(e.target.value)}
                  className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold"
                >
                  {TRADE_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-nav text-sm text-[#e8e8ee] input-gold"
                >
                  {Object.entries(REGIONS).map(([state, cities]) => (
                    <optgroup key={state} label={state}>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Markup / Waste / Labor */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Markup %</label>
                <input
                  type="number"
                  value={markup}
                  onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] input-gold"
                />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Waste %</label>
                <input
                  type="number"
                  value={waste}
                  onChange={(e) => setWaste(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] input-gold"
                />
              </div>
              <div>
                <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Labor $/hr</label>
                <input
                  type="number"
                  value={labor}
                  onChange={(e) => setLabor(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] input-gold"
                />
              </div>
            </div>

            {/* Labor Hours */}
            <div>
              <label className="font-nav text-[10px] tracking-wider uppercase text-[#606070] mb-1 block">Labor Hours</label>
              <input
                type="number"
                value={laborHours}
                onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#151518] border border-[#2a2a32] rounded px-3 py-2 font-mono text-sm text-[#e8e8ee] input-gold"
              />
            </div>

            {/* Tax + Permit */}
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-all ${
                  taxEnabled && !isNH ? 'border-[#c8922a]/30 bg-[#c8922a]/5' : 'border-[#2a2a32] bg-[#151518]'
                } ${isNH ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    taxEnabled && !isNH ? 'bg-[#c8922a]' : 'border border-[#2a2a32]'
                  }`}
                  onClick={() => !isNH && setTaxEnabled(!taxEnabled)}
                >
                  {taxEnabled && !isNH && <Check size={10} className="text-[#09090b]" />}
                </div>
                <span className="font-nav text-xs text-[#9090a0] flex-1">
                  Sales Tax
                </span>
                <span className="font-mono text-xs text-[#606070]">
                  {isNH ? '$0 (NH exempt)' : `${(taxRate * 100).toFixed(2)}%`}
                </span>
              </label>

              <label
                className={`flex items-center gap-3 px-3 py-2 rounded border cursor-pointer transition-all ${
                  permitEnabled ? 'border-[#c8922a]/30 bg-[#c8922a]/5' : 'border-[#2a2a32] bg-[#151518]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                    permitEnabled ? 'bg-[#c8922a]' : 'border border-[#2a2a32]'
                  }`}
                  onClick={() => setPermitEnabled(!permitEnabled)}
                >
                  {permitEnabled && <Check size={10} className="text-[#09090b]" />}
                </div>
                <span className="font-nav text-xs text-[#9090a0] flex-1">Permit Allowance</span>
                {permitEnabled && (
                  <input
                    type="number"
                    value={permitAmount}
                    onChange={(e) => setPermitAmount(parseFloat(e.target.value) || 0)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 bg-[#0f0f12] border border-[#2a2a32] rounded px-2 py-0.5 font-mono text-xs text-[#e8e8ee] input-gold text-right"
                  />
                )}
              </label>
            </div>

            {/* Analyze Button */}
            <button
              onClick={runAnalysis}
              disabled={loading || (!imageBase64 && !description)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-display text-lg tracking-wider transition-all ${
                loading || (!imageBase64 && !description)
                  ? 'bg-[#2a2a32] text-[#606070] cursor-not-allowed'
                  : 'bg-[#c8922a] hover:bg-[#e8aa40] text-[#09090b] gold-glow'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  ANALYZE
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel — Results */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Empty state */}
          {!loading && !result && !error && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-8">
              <div className="w-16 h-16 rounded-full border border-[#2a2a32] bg-[#151518] flex items-center justify-center mb-4">
                <Wand2 size={24} className="text-[#606070]" />
              </div>
              <p className="font-display text-xl tracking-wider text-[#9090a0]">READY TO ESTIMATE</p>
              <p className="font-body text-sm text-[#606070] mt-2 max-w-sm">
                Upload a project photo or describe the scope of work, then click Analyze to generate an AI-powered material estimate.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-[#b83232]/10 border border-[#b83232]/30 rounded-lg p-4 mb-4">
              <p className="font-nav text-sm font-semibold text-[#b83232] mb-1">Analysis Failed</p>
              <p className="font-body text-sm text-[#9090a0]">{error}</p>
              {error.includes('ANTHROPIC_API_KEY') && (
                <p className="font-body text-xs text-[#606070] mt-2">
                  Add your Anthropic API key to .env.local to enable AI analysis.
                </p>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-[#c8922a]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c8922a] animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#e8aa40]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 size={18} className="text-[#c8922a]" />
                </div>
              </div>
              <div className="space-y-2 w-full max-w-xs">
                {LOADING_STEPS.map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 transition-all ${i <= loadingStep ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      i < loadingStep ? 'bg-[#3eb85a]' : i === loadingStep ? 'bg-[#c8922a] animate-pulse' : 'bg-[#2a2a32]'
                    }`} />
                    <span className={`font-nav text-xs ${i <= loadingStep ? 'text-[#9090a0]' : 'text-[#606070]'}`}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* AI Analysis Card */}
              <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 size={14} className="text-[#c8922a]" />
                    <h3 className="font-display text-base tracking-wider text-[#e8e8ee]">AI ANALYSIS</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <div className="w-20 h-1.5 bg-[#0f0f12] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#c8922a] to-[#e8aa40]"
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-[#e8aa40]">{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <p className="font-nav text-[10px] text-[#606070] mt-0.5">Confidence</p>
                  </div>
                </div>
                <p className="font-body text-sm text-[#9090a0] leading-relaxed">{result.summary}</p>
                {result.notes && (
                  <p className="font-body text-xs text-[#606070] mt-2 italic">{result.notes}</p>
                )}
              </div>

              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Materials + Waste', value: fmtK(rawMaterials + wasteAmount), color: 'text-[#e8e8ee]' },
                  { label: 'Labor', value: fmtK(laborAmount), color: 'text-[#4a9de0]' },
                  { label: 'Your Markup', value: fmtK(markupAmount), color: 'text-[#e8aa40]' },
                  { label: 'Customer Price', value: fmtK(customerTotal), color: 'text-[#3eb85a]' },
                ].map((s) => (
                  <div key={s.label} className="bg-[#151518] border border-[#2a2a32] rounded-lg p-3 text-center">
                    <p className={`font-display text-xl ${s.color}`}>{s.value}</p>
                    <p className="font-nav text-[10px] text-[#606070] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display text-base tracking-wider text-[#e8e8ee]">LINE ITEMS</h3>
                  <span className="font-nav text-xs text-[#606070]">{lineItems.length} items · all editable</span>
                </div>
                <LineItemsTable items={lineItems} onChange={setLineItems} markupPct={markup} />
              </div>

              {/* Totals Breakdown */}
              <div className="bg-[#151518] border border-[#2a2a32] rounded-lg p-4">
                <h3 className="font-display text-base tracking-wider text-[#9090a0] mb-3">TOTALS BREAKDOWN</h3>
                <div className="space-y-1.5">
                  {[
                    { label: 'Raw Materials', value: rawMaterials },
                    { label: `Waste Factor (${waste}%)`, value: wasteAmount },
                    { label: `Sales Tax (${isNH || !taxEnabled ? '0%' : `${(taxRate * 100).toFixed(2)}%`})`, value: taxAmount },
                    { label: `Labor (${laborHours}h × $${labor}/hr)`, value: laborAmount },
                    ...(permitEnabled ? [{ label: 'Permit Allowance', value: permitAmt }] : []),
                    { label: 'Basis (Cost to You)', value: basis, bold: true },
                    { label: `Markup (${markup}%)`, value: markupAmount, gold: true },
                  ].map(({ label, value, bold, gold }) => (
                    <div key={label} className={`flex justify-between py-1 ${bold ? 'border-t border-[#2a2a32] mt-1 pt-2' : ''}`}>
                      <span className={`font-nav text-xs ${bold ? 'font-semibold text-[#e8e8ee]' : 'text-[#9090a0]'}`}>{label}</span>
                      <span className={`font-mono text-sm ${gold ? 'text-[#e8aa40]' : bold ? 'text-[#e8e8ee] font-semibold' : 'text-[#9090a0]'}`}>
                        {fmt(value)}
                      </span>
                    </div>
                  ))}

                  {/* Customer Total */}
                  <div className="border-t-2 border-[#c8922a]/40 mt-2 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-display text-lg tracking-wider text-[#e8e8ee]">CUSTOMER TOTAL</span>
                      <span className="font-display text-2xl text-[#e8aa40]">{fmt(customerTotal)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-[#0f0f12] rounded p-2 text-center">
                      <p className="font-mono text-sm text-[#3eb85a]">{fmt(grossProfit)}</p>
                      <p className="font-nav text-[10px] text-[#606070]">Gross Profit</p>
                    </div>
                    <div className="bg-[#0f0f12] rounded p-2 text-center">
                      <p className="font-mono text-sm text-[#3eb85a]">{marginPct.toFixed(1)}%</p>
                      <p className="font-nav text-[10px] text-[#606070]">Margin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={runAnalysis}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#151518] border border-[#2a2a32] rounded-md font-nav text-sm text-[#9090a0] hover:text-[#e8e8ee] hover:border-[#606070] transition-colors"
                >
                  <RefreshCw size={14} />
                  Re-analyze
                </button>
                <button
                  onClick={handleSaveAsQuote}
                  disabled={savingQuote || savedQuote}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-nav text-sm font-semibold transition-colors disabled:opacity-70 ${
                    savedQuote
                      ? 'bg-[#3eb85a] text-[#09090b]'
                      : 'bg-[#4a9de0] hover:bg-[#5ab0f5] text-white'
                  }`}
                >
                  {savingQuote ? <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                    : savedQuote ? <><Check size={14} /> Quote Saved!</>
                    : <><FileText size={14} /> Save as Quote</>}
                </button>
                {savedQuote && (
                  <a href="/quotes" className="flex items-center gap-1 font-nav text-xs text-[#c8922a] hover:text-[#e8aa40] self-center">
                    View Quotes →
                  </a>
                )}
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#c8922a] hover:bg-[#e8aa40] rounded-md font-nav text-sm font-semibold text-[#09090b] transition-colors"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
