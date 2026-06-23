import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-data-table"
import { Button } from "@/components/ui/button"
import { FileText, LayoutTemplate, Phone } from "lucide-react"

const LINKS = [
  {
    href: "/admin/site/contact",
    label: "Contact & FAQ",
    description: "Email, address, office hours, WhatsApp, and FAQ",
    icon: Phone,
  },
  {
    href: "/admin/site/footer",
    label: "Footer",
    description: "Brand copy, links, social profiles, and copyright",
    icon: LayoutTemplate,
  },
  {
    href: "/admin/site/pages",
    label: "Static pages",
    description: "About, Terms, Privacy, Refund, Cookies",
    icon: FileText,
  },
]

export default function AdminSitePage() {
  return (
    <div>
      <AdminPageHeader
        title="Site content"
        description="Manage contact info, footer, and static pages."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {LINKS.map((item) => (
          <div
            key={item.href}
            className="flex flex-col rounded-[20px] bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">{item.label}</h2>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p>
            <Button className="mt-4 w-fit rounded-xl" asChild>
              <Link href={item.href}>Open</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
