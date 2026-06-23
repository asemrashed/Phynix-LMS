/** Strip HTML tags for plain-text previews and validation. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Wrap plain text in a paragraph when migrating to the rich text editor. */
export function toRichTextHtml(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return "<p></p>"
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed
  return `<p>${trimmed.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>`
}
