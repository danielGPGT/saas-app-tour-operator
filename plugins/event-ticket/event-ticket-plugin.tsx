'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Ticket, Users, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { DayOfWeekSelector } from '@/components/ui/day-of-week-selector'
import { recordToDaySelection, daySelectionToRecord } from '@/types/unified-inventory'
import type { ContractPlugin, ContractFormProps, RateMetaFormProps, PricingContext } from '@/core/types'
import type { EventTicketContract, EventTicketRate, EventTicketAllocation, AgeBand, Channel } from './event-ticket-types'

export const EventTicketPlugin: ContractPlugin = {
  id: 'event_ticket',
  label: 'Event Ticket',
  description: 'Event ticket contract and rate management for sports, concerts, and other events',
  
  // Contract form component
  ContractForm: ({ formData, setFormData, onSave, onCancel }: ContractFormProps) => {
    const [eventDates, setEventDates] = useState<string[]>(formData.plugin_meta?.event_dates || [])
    const [paymentSchedule, setPaymentSchedule] = useState(formData.plugin_meta?.payment_schedule || [])
    
    const addEventDate = (date: string) => {
      if (!eventDates.includes(date)) {
        setEventDates([...eventDates, date])
        setFormData({
          ...formData,
          plugin_meta: {
            ...formData.plugin_meta,
            event_dates: [...eventDates, date]
          }
        })
      }
    }
    
    const removeEventDate = (date: string) => {
      const newDates = eventDates.filter(d => d !== date)
      setEventDates(newDates)
      setFormData({
        ...formData,
        plugin_meta: {
          ...formData.plugin_meta,
          event_dates: newDates
        }
      })
    }
    
    const addPaymentMilestone = () => {
      const newSchedule = [...paymentSchedule, { due_date: '', percentage: 0 }]
      setPaymentSchedule(newSchedule)
      setFormData({
        ...formData,
        plugin_meta: {
          ...formData.plugin_meta,
          payment_schedule: newSchedule
        }
      })
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Event Details
            </CardTitle>
            <CardDescription>Configure the event information and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Name</Label>
                <Input
                  value={formData.plugin_meta?.event_name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    plugin_meta: { ...formData.plugin_meta, event_name: e.target.value }
                  })}
                  placeholder="F1 Abu Dhabi 2025"
                />
              </div>
              <div>
                <Label>Venue Name</Label>
                <Input
                  value={formData.plugin_meta?.venue_name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    plugin_meta: { ...formData.plugin_meta, venue_name: e.target.value }
                  })}
                  placeholder="Yas Marina Circuit"
                />
              </div>
            </div>
            
            <div>
              <Label>Timezone</Label>
              <Select
                value={formData.plugin_meta?.timezone || 'UTC+4'}
                onValueChange={(value) => setFormData({
                  ...formData,
                  plugin_meta: { ...formData.plugin_meta, timezone: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC+4">UTC+4 (GST)</SelectItem>
                  <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
                  <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
                  <SelectItem value="UTC-5">UTC-5 (EST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Event Dates</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {eventDates.map(date => (
                  <Badge key={date} variant="outline" className="flex items-center gap-1">
                    {date}
                    <button
                      onClick={() => removeEventDate(date)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Add Date
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      onSelect={(date) => {
                        if (date) {
                          addEventDate(date.toISOString().split('T')[0])
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contract Terms
            </CardTitle>
            <CardDescription>Set up pricing, fees, and payment terms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Supplier Commission (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.plugin_meta?.supplier_commission_rate || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    plugin_meta: { ...formData.plugin_meta, supplier_commission_rate: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="5.00"
                />
              </div>
              <div>
                <Label>VAT Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.plugin_meta?.vat_rate || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    plugin_meta: { ...formData.plugin_meta, vat_rate: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="5.00"
                />
              </div>
              <div>
                <Label>Service Fee per Ticket</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.plugin_meta?.service_fee_per_ticket || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    plugin_meta: { ...formData.plugin_meta, service_fee_per_ticket: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="2.50"
                />
              </div>
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Payment Schedule</Label>
                <Button size="sm" variant="outline" onClick={addPaymentMilestone}>
                  Add Milestone
                </Button>
              </div>
              <div className="space-y-2">
                {paymentSchedule.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="date"
                      value={milestone.due_date}
                      onChange={(e) => {
                        const newSchedule = [...paymentSchedule]
                        newSchedule[index].due_date = e.target.value
                        setPaymentSchedule(newSchedule)
                        setFormData({
                          ...formData,
                          plugin_meta: { ...formData.plugin_meta, payment_schedule: newSchedule }
                        })
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Percentage"
                      value={milestone.percentage}
                      onChange={(e) => {
                        const newSchedule = [...paymentSchedule]
                        newSchedule[index].percentage = parseFloat(e.target.value) || 0
                        setPaymentSchedule(newSchedule)
                        setFormData({
                          ...formData,
                          plugin_meta: { ...formData.plugin_meta, payment_schedule: newSchedule }
                        })
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newSchedule = paymentSchedule.filter((_, i) => i !== index)
                        setPaymentSchedule(newSchedule)
                        setFormData({
                          ...formData,
                          plugin_meta: { ...formData.plugin_meta, payment_schedule: newSchedule }
                        })
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ticket Terms
            </CardTitle>
            <CardDescription>Configure ticket transferability and refunds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="transferable"
                  checked={formData.plugin_meta?.ticket_terms?.transferable || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    plugin_meta: {
                      ...formData.plugin_meta,
                      ticket_terms: { ...formData.plugin_meta?.ticket_terms, transferable: !!checked }
                    }
                  })}
                />
                <Label htmlFor="transferable">Transferable</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="refundable"
                  checked={formData.plugin_meta?.ticket_terms?.refundable || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    plugin_meta: {
                      ...formData.plugin_meta,
                      ticket_terms: { ...formData.plugin_meta?.ticket_terms, refundable: !!checked }
                    }
                  })}
                />
                <Label htmlFor="refundable">Refundable</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name Change Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.plugin_meta?.ticket_terms?.name_change_fee || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    plugin_meta: {
                      ...formData.plugin_meta,
                      ticket_terms: { ...formData.plugin_meta?.ticket_terms, name_change_fee: parseFloat(e.target.value) || 0 }
                    }
                  })}
                  placeholder="10.00"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resale_allowed"
                  checked={formData.plugin_meta?.ticket_terms?.resale_allowed || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    plugin_meta: {
                      ...formData.plugin_meta,
                      ticket_terms: { ...formData.plugin_meta?.ticket_terms, resale_allowed: !!checked }
                    }
                  })}
                />
                <Label htmlFor="resale_allowed">Resale Allowed</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  },
  
  // Rate form component
  RateMetaForm: ({ rate, setRate, onSave, onCancel }: RateMetaFormProps) => {
    const [rateBands, setRateBands] = useState(rate?.plugin_meta?.rate_bands || [])
    const [channelPricing, setChannelPricing] = useState(rate?.plugin_meta?.channel_pricing || {})
    
    const ageBands: AgeBand[] = ['adult', 'child', 'senior', 'student', 'infant']
    const channels: Channel[] = ['web', 'b2b', 'internal', 'box_office', 'reseller']
    
    const addRateBand = () => {
      const newBand = { age_band: 'adult', price: 0, availability: 0 }
      setRateBands([...rateBands, newBand])
      setRate({
        ...rate,
        plugin_meta: { ...rate?.plugin_meta, rate_bands: [...rateBands, newBand] }
      })
    }
    
    const updateRateBand = (index: number, field: string, value: any) => {
      const newBands = [...rateBands]
      newBands[index] = { ...newBands[index], [field]: value }
      setRateBands(newBands)
      setRate({
        ...rate,
        plugin_meta: { ...rate?.plugin_meta, rate_bands: newBands }
      })
    }
    
    const updateChannelPricing = (channel: Channel, price: number) => {
      const newPricing = { ...channelPricing, [channel]: price }
      setChannelPricing(newPricing)
      setRate({
        ...rate,
        plugin_meta: { ...rate?.plugin_meta, channel_pricing: newPricing }
      })
    }
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Rate Bands
            </CardTitle>
            <CardDescription>Set up different pricing for different age groups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Age Band Pricing</Label>
              <Button size="sm" variant="outline" onClick={addRateBand}>
                Add Rate Band
              </Button>
            </div>
            
            <div className="space-y-3">
              {rateBands.map((band, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded">
                  <Select
                    value={band.age_band}
                    onValueChange={(value) => updateRateBand(index, 'age_band', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ageBands.map(ageBand => (
                        <SelectItem key={ageBand} value={ageBand}>
                          {ageBand.charAt(0).toUpperCase() + ageBand.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={band.price}
                    onChange={(e) => updateRateBand(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                  
                  <Input
                    type="number"
                    placeholder="Availability"
                    value={band.availability}
                    onChange={(e) => updateRateBand(index, 'availability', parseInt(e.target.value) || 0)}
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newBands = rateBands.filter((_, i) => i !== index)
                      setRateBands(newBands)
                      setRate({
                        ...rate,
                        plugin_meta: { ...rate?.plugin_meta, rate_bands: newBands }
                      })
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Channel Pricing
            </CardTitle>
            <CardDescription>Set different prices for different sales channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {channels.map(channel => (
                <div key={channel} className="space-y-2">
                  <Label>{channel.charAt(0).toUpperCase() + channel.slice(1)} Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={channelPricing[channel] || 0}
                    onChange={(e) => updateChannelPricing(channel, parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Package Rules</CardTitle>
            <CardDescription>Configure group discounts and booking rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Tickets</Label>
                <Input
                  type="number"
                  value={rate?.plugin_meta?.package_rules?.min_tickets || 1}
                  onChange={(e) => setRate({
                    ...rate,
                    plugin_meta: {
                      ...rate?.plugin_meta,
                      package_rules: { ...rate?.plugin_meta?.package_rules, min_tickets: parseInt(e.target.value) || 1 }
                    }
                  })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label>Maximum Tickets</Label>
                <Input
                  type="number"
                  value={rate?.plugin_meta?.package_rules?.max_tickets || 10}
                  onChange={(e) => setRate({
                    ...rate,
                    plugin_meta: {
                      ...rate?.plugin_meta,
                      package_rules: { ...rate?.plugin_meta?.package_rules, max_tickets: parseInt(e.target.value) || 10 }
                    }
                  })}
                  placeholder="10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Group Discount (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={rate?.plugin_meta?.package_rules?.group_discount_percentage || 0}
                  onChange={(e) => setRate({
                    ...rate,
                    plugin_meta: {
                      ...rate?.plugin_meta,
                      package_rules: { ...rate?.plugin_meta?.package_rules, group_discount_percentage: parseFloat(e.target.value) || 0 }
                    }
                  })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Early Bird Discount (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={rate?.plugin_meta?.package_rules?.early_bird_discount?.discount_percentage || 0}
                  onChange={(e) => setRate({
                    ...rate,
                    plugin_meta: {
                      ...rate?.plugin_meta,
                      package_rules: {
                        ...rate?.plugin_meta?.package_rules,
                        early_bird_discount: {
                          ...rate?.plugin_meta?.package_rules?.early_bird_discount,
                          discount_percentage: parseFloat(e.target.value) || 0
                        }
                      }
                    }
                  })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
