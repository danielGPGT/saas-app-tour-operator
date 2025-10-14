'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react'

interface BookingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: any
}

export function BookingSheet({ open, onOpenChange, booking }: BookingSheetProps) {
  if (!booking) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[700px] !sm:!max-w-[900px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Booking {booking.id}</SheetTitle>
              <SheetDescription>
                Booking details and pricing information
              </SheetDescription>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(booking.status)}
                {booking.status}
              </div>
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Booking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Booking ID</div>
                      <div className="text-sm text-muted-foreground">{booking.id}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Product</div>
                      <div className="text-sm text-muted-foreground">{booking.product_id}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Dates</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Quantity</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {booking.qty} units
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Created</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(booking.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Last Updated</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(booking.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {booking.pricing_snapshot ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Currency</div>
                          <div className="text-sm text-muted-foreground">{booking.pricing_snapshot.currency}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Contract Currency</div>
                          <div className="text-sm text-muted-foreground">{booking.pricing_snapshot.contract_currency}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Room Subtotal (NET)</span>
                          <span>€{booking.pricing_snapshot.room_subtotal_net}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Supplier Commission</span>
                          <span>-€{booking.pricing_snapshot.supplier_commission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Supplier VAT</span>
                          <span>+€{booking.pricing_snapshot.supplier_vat}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fees Included</span>
                          <span>+€{booking.pricing_snapshot.fees_included}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fees at Property</span>
                          <span>€{booking.pricing_snapshot.fees_pay_at_property}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                          <span>Markup</span>
                          <span>+€{booking.pricing_snapshot.markup_amount}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Due Now</span>
                            <span>€{booking.pricing_snapshot.total_due_now}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No pricing information available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Booking Confirmed</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {booking.status === 'CANCELLED' && (
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Booking Cancelled</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(booking.updated_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
