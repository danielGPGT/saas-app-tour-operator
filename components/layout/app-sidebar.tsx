'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  FileText,
  Package,
  Calendar,
  Search,
  BookOpen,
  Upload,
  Calculator,
  Shield,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Settings,
  MapPin
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navigation: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Tours',
    href: '/tours',
    icon: MapPin,
  },
  {
    title: 'Commercial',
    icon: Building2,
    children: [
      {
        title: 'Suppliers',
        href: '/commercial/suppliers',
        icon: Users,
      },
      {
        title: 'Contracts',
        href: '/commercial/contracts',
        icon: FileText,
      },
    ],
  },
  {
    title: 'Inventory',
    icon: Package,
    children: [
      {
        title: 'Resources',
        href: '/inventory/resources',
        icon: Building2,
      },
      {
        title: 'Products',
        href: '/inventory/products',
        icon: Package,
      },
      {
        title: 'Allocations',
        href: '/inventory/allocations',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Sales',
    icon: Search,
    children: [
      {
        title: 'Search',
        href: '/sales/search',
        icon: Search,
      },
      {
        title: 'Bookings',
        href: '/sales/bookings',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'Tools',
    icon: Settings,
    children: [
      {
        title: 'Imports',
        href: '/tools/imports',
        icon: Upload,
      },
      {
        title: 'Simulator',
        href: '/tools/simulator',
        icon: Calculator,
      },
      {
        title: 'Audit',
        href: '/tools/audit',
        icon: Shield,
      },
    ],
  },
]

interface SidebarProps {
  className?: string
}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Commercial', 'Inventory'])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href
  }

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false
    return item.children.some(child => 
      child.href ? isActive(child.href) : hasActiveChild(child)
    )
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const hasActive = hasActiveChild(item)

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-8 px-3",
              level > 0 && "pl-6",
              hasActive && "bg-accent text-accent-foreground"
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            <span className="flex-1 text-left">{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && (
            <div className="space-y-1 ml-2">
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        className={cn(
          "w-full justify-start h-8 px-3",
          level > 0 && "pl-6",
          isActive(item.href) && "bg-accent text-accent-foreground"
        )}
        asChild
      >
        <Link href={item.href!}>
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          <span className="flex-1 text-left">{item.title}</span>
        </Link>
      </Button>
    )
  }

  return (
    <aside className={cn("fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 flex-col border-r bg-sidebar hidden lg:flex", className)}>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map(item => renderNavItem(item))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
