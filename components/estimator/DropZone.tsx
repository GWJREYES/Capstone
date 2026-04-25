'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Image as ImageIcon, X, Camera } from 'lucide-react'

interface DropZoneProps {
  onFile: (file: File, base64: string) => void
  preview?: string | null
  onClear?: () => void
}

export default function DropZone({ onFile, preview, onClear }: DropZoneProps) {
  const [dragging, setDragging] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const base64 = result.split(',')[1]
      onFile(file, base64)
    }
    reader.readAsDataURL(file)
  }, [onFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  if (preview) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-[#c8922a]/30">
        <img src={preview} alt="Project photo" className="w-full h-48 object-cover" />
        <button
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-[#09090b]/80 text-[#e8e8ee] hover:bg-[#b83232] transition-colors"
        >
          <X size={14} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-[#09090b]/80 to-transparent">
          <p className="font-nav text-xs text-[#e8aa40]">Photo ready for analysis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => uploadRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          dragging
            ? 'border-[#c8922a] bg-[#c8922a]/5'
            : 'border-[#2a2a32] hover:border-[#c8922a]/50 hover:bg-[#c8922a]/3'
        }`}
      >
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        {/* Hidden camera-capture input */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
          dragging ? 'border-[#c8922a] bg-[#c8922a]/10' : 'border-[#2a2a32] bg-[#151518]'
        }`}>
          {dragging ? (
            <Upload size={18} className="text-[#e8aa40]" />
          ) : (
            <ImageIcon size={18} className="text-[#606070]" />
          )}
        </div>
        <div className="text-center">
          <p className="font-nav text-sm font-semibold text-[#e8e8ee]">
            {dragging ? 'Drop photo here' : 'Upload project photo'}
          </p>
          <p className="font-body text-xs text-[#606070] mt-0.5">
            Drag &amp; drop or click to browse · JPG, PNG, HEIC
          </p>
        </div>
      </div>

      {/* Take Photo button — opens native camera (uses LiDAR depth on iPhone Pro) */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); cameraRef.current?.click() }}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#151518] border border-[#2a2a32] text-[#9090a0] hover:text-[#e8e8ee] hover:border-[#c8922a]/40 transition-colors font-nav text-xs font-semibold tracking-wide"
      >
        <Camera size={14} />
        TAKE PHOTO WITH CAMERA
      </button>
    </div>
  )
}
