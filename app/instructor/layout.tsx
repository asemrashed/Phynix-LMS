import { InstructorLayoutClient } from "@/components/instructor/instructor-layout-client"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <InstructorLayoutClient>{children}</InstructorLayoutClient>
}
