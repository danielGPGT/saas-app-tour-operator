'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Truck,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  truck: Truck,
  sparkles: Sparkles,
}

interface NavItem {
  title: string
  icon: keyof typeof iconMap
  route: string
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: "dashboard", route: "/" },
  { title: "Tours", icon: "calendar", route: "/tours" },
  { title: "Suppliers", icon: "truck", route: "/suppliers" },
  { title: "🆕 Inventory", icon: "sparkles", route: "/inventory" }
]

export function SideNav() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Acme Tours</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive = pathname === item.route
          
          return (
            <Link
              key={item.route}
              href={item.route}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}