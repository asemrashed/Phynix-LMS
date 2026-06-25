export const SUPPORT_EMAIL = "support@englishlms.com"

export const OFFICE_ADDRESS = {
  line1: "128 City Road",
  line2: "London, EC1V 2NX",
}

export const OFFICE_HOURS = "Mon–Sat, 10:00 AM – 6:00 PM (BDT)"

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

export function getWhatsAppUrl(message?: string, number?: string | null) {
  const source = number?.trim() || WHATSAPP_NUMBER
  if (!source) return null
  const digits = source.replace(/\D/g, "")
  if (!digits) return null
  const text = message ? `?text=${encodeURIComponent(message)}` : ""
  return `https://wa.me/${digits}${text}`
}

export const CONTACT_SUBJECTS = [
  { value: "GENERAL", label: "General inquiry" },
  { value: "COURSE", label: "Course & enrollment" },
  { value: "PAYMENT", label: "Payment / refund" },
  { value: "CONSULTATION", label: "Consultation booking" },
  { value: "TECHNICAL", label: "Technical / account issue" },
  { value: "PARTNERSHIP", label: "Partnership / media" },
] as const

export const CONTACT_FAQ = [
  {
    question: "How quickly will I get a reply?",
    answer:
      "We typically respond within 24–48 hours during Bangladesh business hours (Monday–Saturday, 10 AM–6 PM BDT).",
  },
  {
    question: "I have a payment or refund question — what should I include?",
    answer:
      "Include your registered email, order or transaction reference, and a short description of the issue. You can also review our refund policy before submitting.",
  },
  {
    question: "Can I get help choosing the right course?",
    answer:
      "Yes. Tell us your target band score, timeline, and current level in your message and our team will recommend a suitable learning path.",
  },
  {
    question: "Do I need an account to contact us?",
    answer:
      "No. Anyone can submit the contact form. If you are logged in, we automatically link your inquiry to your account for faster support.",
  },
  {
    question: "Where is PhynixEducation located?",
    answer:
      "Our office is at 128 City Road, London, EC1V 2NX. Online support is available for students worldwide.",
  },
]
