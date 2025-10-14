'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  FileText, 
  Package, 
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data for dashboard
  const stats = {
    suppliers: 12,
    contracts: 28,
    products: 156,
    allocations: 1240,
    bookings: 89,
    revenue: 45600,
    activeContracts: 22,
    pendingRequests: 7
  }

  const recentActivity = [
    {
      id: 1,
      type: 'contract',
      message: 'New contract created with NH Hotels',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'booking',
      message: 'Booking confirmed for Hotel Madrid Central',
      time: '4 hours ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'allocation',
      message: 'Allocation updated for May 2025',
      time: '6 hours ago',
      status: 'info'
    },
    {
      id: 4,
      type: 'supplier',
      message: 'Supplier BookingWholesale updated',
      time: '1 day ago',
      status: 'info'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your tour operator inventory management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suppliers}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contracts}</div>
            <div className="flex items-center gap-2">
              <Badge variant="default">{stats.activeContracts} active</Badge>
              <Badge variant="secondary">{stats.pendingRequests} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.allocations} allocations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookings}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">€{stats.revenue.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mb-4">
              Total revenue this month
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Contracts</span>
                <Badge variant="default">{stats.activeContracts}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Requests</span>
                <Badge variant="secondary">{stats.pendingRequests}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  All Systems Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/commercial/suppliers" className="flex flex-col items-center gap-2">
                <Building2 className="h-6 w-6" />
                <span>Add Supplier</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/commercial/contracts" className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Create Contract</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/inventory/products" className="flex flex-col items-center gap-2">
                <Package className="h-6 w-6" />
                <span>Manage Products</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/sales/search" className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>Search Inventory</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' :
                  activity.status === 'info' ? 'bg-blue-500' : 'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}