import { type ReactElement, useRef, useState, useEffect } from 'react'
import { cn } from '../../../shared/lib/cn'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import type { AttachmentResponse } from '../../../app/store/api/transactionApi'

interface ReceiptPickerProps {
  file: File | null
  onFileChange: (file: File | null) => void
  existingAttachments?: AttachmentResponse[]
}

export function ReceiptPicker({
  file,
  onFileChange,
  existingAttachments = [],
}: ReceiptPickerProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Initialize and cleanup preview URLs
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreviewUrl(null)
    }
  }, [file])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    onFileChange(selectedFile)
  }

  const removeFile = () => {
    onFileChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const hasExisting = existingAttachments.length > 0

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium leading-none text-foreground text-left">
        Receipt Attachment (Optional)
      </p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
        className="hidden"
      />

      <div className="flex flex-wrap gap-3">
        {/* Attachment Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ui-border-subtle bg-ui-surface-muted transition-colors hover:border-primary/50 hover:bg-primary/5',
            file && 'border-primary/30 bg-primary/5',
          )}
        >
          <SharedIcon type="ui" name="camera" size={24} className="text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {file || hasExisting ? 'Replace' : 'Attach'}
          </span>
        </button>

        {/* Selected File Preview */}
        {file && (
          <div className="relative h-24 w-24 rounded-2xl border border-ui-border-subtle overflow-hidden bg-ui-surface group">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                <SharedIcon type="ui" name="note" size={32} className="text-primary" />
                <span className="text-xs font-medium truncate w-full px-1">{file.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <SharedIcon type="ui" name="close" size={16} />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-primary/80 py-0.5 text-xs font-semibold text-white text-center uppercase">
              New
            </div>
          </div>
        )}

        {/* Existing Attachments (if not replaced by new file) */}
        {!file &&
          existingAttachments.map((att) => (
            <div
              key={att.id}
              className="relative h-24 w-24 rounded-2xl border border-ui-border-subtle overflow-hidden bg-ui-surface"
            >
              {att.mimeType.startsWith('image/') ? (
                <div className="h-full w-full flex items-center justify-center bg-muted/20">
                  <SharedIcon
                    type="ui"
                    name="image"
                    size={32}
                    className="text-muted-foreground/40"
                  />
                  {/* In a real app we'd show the actual image here, but for now just an icon */}
                </div>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center">
                  <SharedIcon type="ui" name="note" size={32} className="text-primary/60" />
                  <span className="text-xs font-medium truncate w-full px-1 text-muted-foreground">
                    {att.filename}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-ui-border-subtle py-0.5 text-xs font-semibold text-muted-foreground text-center uppercase">
                Stored
              </div>
            </div>
          ))}
      </div>

      {(file || hasExisting) && (
        <p className="text-xs text-muted-foreground">
          {file
            ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
            : 'Receipt currently attached.'}
        </p>
      )}
    </div>
  )
}
