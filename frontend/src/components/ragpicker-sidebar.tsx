"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, Recycle, Settings, Star, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function RagpickerSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/ragpicker-dashboard",
      icon: LayoutDashboard,
      title: "Dashboard",
    },
    {
      href: "/ragpicker-dashboard/requests",
      icon: Recycle,
      title: "Pickup Requests",
    },
    {
      href: "/ragpicker-dashboard/reviews",
      icon: Star,
      title: "My Reviews",
    },
    {
      href: "/ragpicker-dashboard/profile",
      icon: User,
      title: "Profile",
    },
    {
      href: "/ragpicker-dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className="flex h-full flex-col border-r bg-green-50">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/ragpicker-dashboard" className="flex items-center gap-2 font-semibold">
          <Recycle className="h-6 w-6 text-green-600" />
          <span>EcoCollect</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                pathname === route.href && "bg-green-100 text-green-900",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <Link href="/">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </Button>
      </div>
    </div>
  )
}
