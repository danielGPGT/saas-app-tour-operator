'use client'

import { useState } from 'react'
import { Search, Filter, Download, Eye, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBookings } from '@/hooks/use-bookings'
import { useHolds } from '@/hooks/use-holds'
import { useAllocations } from '@/hooks/use-allocations'

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all')

  const { data: bookings } = useBookings()
  const { data: holds } = useHolds()
  const { data: allocations } = useAllocations()

  // Combine all audit events
  const auditEvents = [
    ...(bookings || []).map(booking => ({
      id: booking.id,
      type: 'booking',
      action: booking.status === 'CONFIRMED' ? 'BOOKED' : booking.status === 'CANCELLED' ? 'CANCELLED' : 'UPDATED',
      product_id: booking.product_id,
      date: booking.created_at,
      details: `Booking ${booking.id} - ${booking.status}`,
      qty: booking.qty,
      amount: booking.pricing_snapshot?.total_due_now || 0,
      status: booking.status
    })),
    ...(holds || []).map(hold => ({
      id: hold.id,
      type: 'hold',
      action: hold.status === 'ACTIVE' ? 'HELD' : hold.status === 'CONVERTED' ? 'CONVERTED' : hold.status === 'EXPIRED' ? 'EXPIRED' : 'UPDATED',
      product_id: hold.product_id,
      date: hold.created_at,
      details: `Hold ${hold.id} - ${hold.status}`,
      qty: hold.qty,
      amount: 0,
      status: hold.status
    })),
    ...(allocations || []).map(allocation => ({
      id: allocation.id,
      type: 'allocation',
      action: 'CAPACITY_SET',
      product_id: allocation.product_id,
      date: allocation.created_at,
      details: `Allocation ${allocation.capacity} units for ${allocation.start_date} to ${allocation.end_date}`,
      qty: allocation.capacity,
      amount: 0,
      status: allocation.stop_sell ? 'STOP_SELL' : 'ACTIVE'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredEvents = auditEvents.filter(event => {
    const matchesSearch = 
      event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || event.type === selectedType
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus
    
    let matchesDate = true
    if (selectedDateRange !== 'all') {
      const eventDate = new Date(event.date)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (selectedDateRange) {
        case 'today':
          matchesDate = daysDiff === 0
          break
        case 'week':
          matchesDate = daysDiff <= 7
          break
        case 'month':
          matchesDate = daysDiff <= 30
          break
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BOOKED': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-600" />
      case 'HELD': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'CONVERTED': return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'EXPIRED': return <XCircle className="h-4 w-4 text-gray-600" />
      case 'CAPACITY_SET': return <AlertCircle className="h-4 w-4 text-purple-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BOOKED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'HELD': return 'bg-yellow-100 text-yellow-800'
      case 'CONVERTED': return 'bg-blue-100 text-blue-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      case 'CAPACITY_SET': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📋'
      case 'hold': return '⏰'
      case 'allocation': return '📊'
      default: return '📄'
    }
  }

  const handleExport = () => {
    const csvContent = [
      'Date,Type,Action,Product,Details,Quantity,Amount,Status',
      ...filteredEvents.map(event => 
        `${new Date(event.date).toLocaleString()},${event.type},${event.action},${event.product_id},"${event.details}",${event.qty},${event.amount},${event.status}`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Track all inventory changes, bookings, and system activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEvents.filter(e => e.type === 'booking').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEvents.filter(e => e.type === 'hold').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditEvents.filter(e => e.type === 'allocation').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search audit trail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="booking">Bookings</SelectItem>
                  <SelectItem value="hold">Holds</SelectItem>
                  <SelectItem value="allocation">Allocations</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredEvents.length} of {auditEvents.length} events
            </div>

            {/* Audit Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No audit events found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={`${event.type}-${event.id}`} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="text-sm">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getTypeIcon(event.type)}</span>
                            <span className="capitalize">{event.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActionColor(event.action)}>
                            <div className="flex items-center gap-1">
                              {getActionIcon(event.action)}
                              {event.action}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.product_id}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {event.details}
                        </TableCell>
                        <TableCell>
                          {event.qty > 0 ? event.qty : '-'}
                        </TableCell>
                        <TableCell>
                          {event.amount > 0 ? `€${event.amount.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                View Related Events
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Export Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
