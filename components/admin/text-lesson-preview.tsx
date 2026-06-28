"use client"

function toPreviewHtml(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return ""
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed
  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("")
}

interface TextLessonPreviewProps {
  content: string
}

export function TextLessonPreview({ content }: TextLessonPreviewProps) {
  const html = toPreviewHtml(content)
  if (!html) {
    return (
      <p className="text-sm text-muted-foreground italic">Nothing to preview yet.</p>
    )
  }

  return (
    <div
      className="prose prose-sm max-w-none rounded-xl border bg-muted/20 p-4 font-sans text-foreground dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
