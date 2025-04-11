import type React from "react"
import { RagpickerSidebar } from "@/components/ragpicker-sidebar"

export default function RagpickerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <RagpickerSidebar />
      <div className="flex flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
      </div>
    </div>
  )
}
