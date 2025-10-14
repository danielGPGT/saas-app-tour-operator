'use client'

import { useState } from 'react'
import { Calendar, DollarSign, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RateBand } from '@/types/domain'

interface RateBandTimelineProps {
  rateBands: RateBand[]
  onEdit: (rateBand: RateBand) => void
}

export function RateBandTimeline({ rateBands, onEdit }: RateBandTimelineProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getWeekdayMaskText = (mask: number) => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    return days.map((day, index) => 
      mask & (1 << index) ? day : '-'
    ).join('')
  }

  const getRateDisplay = (rateBand: any) => {
    if (!rateBand.base_rate || rateBand.base_rate <= 0) return 'No price set'
    const unit = rateBand.pricing_unit?.replace('per_', '') || 'unit'
    return `€${rateBand.base_rate} per ${unit}`
  }

  const getRateBandForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return rateBands.find(rb => 
      rb.active &&
      dateStr >= rb.band_start && 
      dateStr <= rb.band_end
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentMonth(newDate)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const startDay = (firstDay.getDay() + 6) % 7 // Convert to Monday-based week

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{getMonthName(currentMonth)}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {rateBands.filter(rb => rb.active).length} active rate bands
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Rate Band Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`empty-${index}`} className="h-12 border rounded"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const rateBand = getRateBandForDate(date)
              
              return (
                <div
                  key={day}
                  className={`h-12 border rounded p-1 cursor-pointer hover:bg-secondary/20 ${
                    rateBand ? 'bg-primary/10 border-primary' : 'bg-muted/50'
                  }`}
                  onClick={() => rateBand && onEdit(rateBand)}
                >
                  <div className="text-xs font-medium">{day}</div>
                  {rateBand && (
                    <div className="text-xs text-primary truncate">
                      {rateBand.markup.b2c_pct}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Rate Band Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rateBands.filter(rb => rb.active).map((rateBand) => (
          <Card key={rateBand.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">Active</Badge>
                  <span className="text-sm font-medium">{rateBand.contract_id}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(rateBand)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Period:</span>
                <span>
                  {new Date(rateBand.band_start).toLocaleDateString()} - {new Date(rateBand.band_end).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days:</span>
                <span className="font-mono text-xs">{getWeekdayMaskText(rateBand.weekday_mask)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price:</span>
                <span className="text-xs">{getRateDisplay(rateBand)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Markup:</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">B2C: {rateBand.markup.b2c_pct}%</Badge>
                  <Badge variant="outline" className="text-xs">B2B: {rateBand.markup.b2b_pct}%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rateBands.filter(rb => rb.active).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No active rate bands found. Create one to get started.
        </div>
      )}
    </div>
  )
}
