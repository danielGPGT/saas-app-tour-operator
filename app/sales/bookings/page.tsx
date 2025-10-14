'use client'

import { useState } from 'react'
import { Search, Filter, MoreHorizontal, Clock, CheckCircle, XCircle, Eye, Download } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingSheet } from '@/components/sales/booking-sheet'
import { useBookings } from '@/hooks/use-bookings'
import { useHolds } from '@/hooks/use-holds'

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('holds')

  const { data: bookings, isLoading: bookingsLoading } = useBookings()
  const { data: holds, isLoading: holdsLoading } = useHolds()

  const filteredBookings = bookings?.filter(booking =>
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.product_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const filteredHolds = holds?.filter(hold =>
    hold.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hold.product_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking)
    setIsSheetOpen(true)
  }

  const handleConfirmHold = (hold: any) => {
    // TODO: Implement hold confirmation
    console.log('Confirm hold:', hold.id)
  }

  const handleReleaseHold = (hold: any) => {
    // TODO: Implement hold release
    console.log('Release hold:', hold.id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'EXPIRED': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  const formatTTL = (ttlAt: string) => {
    const now = new Date()
    const ttl = new Date(ttlAt)
    const diffMs = ttl.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffMs <= 0) return 'Expired'
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`
    return `${diffMinutes}m`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings & Holds</h1>
          <p className="text-muted-foreground">
            Manage customer bookings and temporary holds
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Holds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {holds?.filter(h => h.status === 'ACTIVE').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings?.filter(b => b.status === 'CONFIRMED').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{bookings?.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + (b.pricing_snapshot?.total_due_now || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings?.filter(b => b.status === 'CANCELLED').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings & Holds</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="holds">
                <Clock className="h-4 w-4 mr-2" />
                Holds ({holds?.filter(h => h.status === 'ACTIVE').length || 0})
              </TabsTrigger>
              <TabsTrigger value="bookings">
                <CheckCircle className="h-4 w-4 mr-2" />
                Bookings ({bookings?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="holds" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search holds..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hold ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="h-12">
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredHolds.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No holds found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHolds.map((hold) => (
                          <TableRow key={hold.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{hold.id}</TableCell>
                            <TableCell>{hold.product_id}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{new Date(hold.start_date).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">
                                  to {new Date(hold.end_date).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{hold.qty}</TableCell>
                            <TableCell>
                              <div className={`text-sm ${hold.status === 'ACTIVE' ? 'text-yellow-600' : 'text-gray-500'}`}>
                                {formatTTL(hold.ttl_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(hold.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(hold.status)}
                                  {hold.status}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  {hold.status === 'ACTIVE' && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleConfirmHold(hold)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Confirm Booking
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleReleaseHold(hold)}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Release Hold
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
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
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="h-12">
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-muted rounded animate-pulse" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No bookings found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBookings.map((booking) => (
                          <TableRow key={booking.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{booking.product_id}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                                <div className="text-muted-foreground">
                                  to {new Date(booking.end_date).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{booking.qty}</TableCell>
                            <TableCell>
                              €{booking.pricing_snapshot?.total_due_now?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {booking.status}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {booking.status === 'CONFIRMED' && (
                                    <DropdownMenuItem className="text-red-600">
                                      Cancel Booking
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Booking Sheet */}
      <BookingSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        booking={selectedBooking}
      />
    </div>
  )
}
