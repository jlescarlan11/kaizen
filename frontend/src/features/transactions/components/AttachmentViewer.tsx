import { type ReactElement } from 'react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import type { AttachmentResponse } from '../../../app/store/api/transactionApi'
import { cn } from '../../../shared/lib/cn'

interface AttachmentViewerProps {
  attachments: AttachmentResponse[]
  className?: string
}

export function AttachmentViewer({
  attachments,
  className,
}: AttachmentViewerProps): ReactElement | null {
  if (attachments.length === 0) return null

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Attachments
      </p>
      <div className="flex flex-wrap gap-3">
        {attachments.map((att) => (
          <a
            key={att.id}
            href={`${import.meta.env.VITE_API_BASE_URL}/uploads/receipts/${att.storageReference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative h-24 w-24 rounded-2xl border border-ui-border-subtle overflow-hidden bg-ui-surface group hover:border-ui-border transition-colors flex flex-col items-center justify-center p-2 text-center"
          >
            {att.mimeType.startsWith('image/') ? (
              <SharedIcon
                type="ui"
                name="image"
                size={32}
                className="text-primary/60 group-hover:text-primary transition-colors"
              />
            ) : (
              <SharedIcon
                type="ui"
                name="note"
                size={32}
                className="text-primary/60 group-hover:text-primary transition-colors"
              />
            )}
            <span className="mt-1 text-xs font-medium truncate w-full px-1 text-muted-foreground group-hover:text-foreground transition-colors">
              {att.filename}
            </span>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <SharedIcon
                type="ui"
                name="external-link"
                size={12}
                className="text-muted-foreground"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
