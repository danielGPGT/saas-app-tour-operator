'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useData, Tour, BoardType } from '@/contexts/data-context'
import { Plus, Hotel, Trash2, DollarSign, Check, Car, Ticket, PartyPopper, UtensilsCrossed, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { BOARD_TYPE_LABELS } from '@/lib/pricing'
import { toast } from 'sonner'

const getServiceIcon = (type: string) => {
  switch (type) {
    case 'transfer': return Car
    case 'ticket': return Ticket
    case 'activity': return PartyPopper
    case 'meal': return UtensilsCrossed
    case 'accommodation': return Hotel
    default: return Package
  }
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  accommodation: 'Accommodation',
  transfer: 'Transfer',
  ticket: 'Ticket / Event',
  activity: 'Activity / Tour',
  meal: 'Meal',
  other: 'Other Service'
}

export default function Tours() {
  const { tours, addTour, updateTour, deleteTour, tourComponents, addTourComponent, deleteTourComponent, hotels, suppliers } = useData()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [viewingTour, setViewingTour] = useState<Tour | null>(null)
  const [isComponentOpen, setIsComponentOpen] = useState(false)
  const [componentType, setComponentType] = useState<'accommodation' | 'service'>('accommodation')
  const [componentForm, setComponentForm] = useState({
    // Common
    component_type: 'accommodation' as 'accommodation' | 'transfer' | 'activity' | 'meal' | 'ticket' | 'other',
    label: '',
    check_in_date: '',
    check_out_date: '',
    included_in_base_price: true,
    pricing_mode: 'use_contract' as 'use_contract' | 'fixed_price' | 'use_service_inventory',
    
    // Hotel-specific
    hotel_id: 0,
    room_group_id: '',
    board_type: 'bed_breakfast' as BoardType,
    
    // Service-specific
    service_inventory_id: 0,
    service_name: '',
    provider_id: 0,
    inventory_source: 'buy_to_order' as 'contract' | 'buy_to_order',
    quantity_per_booking: 1,
    pricing_unit: 'per_person' as 'per_person' | 'per_vehicle' | 'per_group' | 'flat_rate',
    
    // Pricing
    fixed_cost_per_couple: 0,
    fixed_sell_per_couple: 0,
  })
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    description: '',
  })

  const columns = [
    { header: 'ID', accessor: 'id', width: 60 },
    { header: 'Name', accessor: 'name' },
    { header: 'Start Date', accessor: 'start_date', format: 'date' as const },
    { header: 'End Date', accessor: 'end_date', format: 'date' as const },
    { header: 'Description', accessor: 'description', truncate: true },
    { header: 'Actions', accessor: 'actions', type: 'actions' as const, actions: ['view', 'edit', 'delete'] },
  ]

  const handleCreate = () => {
    addTour(formData)
    setIsCreateOpen(false)
    setFormData({ name: '', start_date: '', end_date: '', description: '' })
  }

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour)
    setFormData({
      name: tour.name,
      start_date: tour.start_date,
      end_date: tour.end_date,
      description: tour.description,
    })
    setIsEditOpen(true)
  }

  const handleUpdate = () => {
    if (editingTour) {
      updateTour(editingTour.id, formData)
      setIsEditOpen(false)
      setEditingTour(null)
      setFormData({ name: '', start_date: '', end_date: '', description: '' })
    }
  }

  const handleView = (tour: Tour) => {
    setViewingTour(tour)
    setIsViewOpen(true)
    setComponentType('accommodation')
    resetComponentForm()
  }
  
  const handleOpenComponentDialog = (type: 'accommodation' | 'service') => {
    setComponentType(type)
    resetComponentForm()
    setIsComponentOpen(true)
  }

  const handleDelete = (tour: Tour) => {
    if (confirm(`Are you sure you want to delete "${tour.name}"?`)) {
      deleteTour(tour.id)
    }
  }

  const handleAddComponent = () => {
    if (!viewingTour) return
    
    if (!componentForm.check_in_date || !componentForm.check_out_date) {
      toast.error('Please fill in dates')
      return
    }
    
    // Calculate check_in_day from tour start date
    const tourStart = new Date(viewingTour.start_date)
    const componentCheckIn = new Date(componentForm.check_in_date)
    const componentCheckOut = new Date(componentForm.check_out_date)
    
    // Calculate day number (1-based: tour start = Day 1)
    const daysDiff = Math.ceil((componentCheckIn.getTime() - tourStart.getTime()) / (1000 * 60 * 60 * 24))
    const check_in_day = daysDiff + 1
    
    // Calculate nights
    const nights = Math.ceil((componentCheckOut.getTime() - componentCheckIn.getTime()) / (1000 * 60 * 60 * 24))
    
    // Build component data based on type
    const baseComponent = {
      tour_id: viewingTour.id,
      component_type: componentForm.component_type,
      check_in_day: check_in_day,
      nights: componentType === 'accommodation' ? nights : undefined,
      pricing_mode: componentForm.pricing_mode,
      included_in_base_price: componentForm.included_in_base_price,
      label: componentForm.label,
    }
    
    if (componentType === 'accommodation') {
      // Hotel component
    addTourComponent({
        ...baseComponent,
      hotel_id: componentForm.hotel_id,
      room_group_id: componentForm.room_group_id,
      board_type: componentForm.board_type,
        nights: nights,
        fixed_cost_per_couple: componentForm.pricing_mode === 'fixed_price' ? componentForm.fixed_cost_per_couple : undefined,
        fixed_sell_per_couple: componentForm.pricing_mode === 'fixed_price' ? componentForm.fixed_sell_per_couple : undefined,
      })
    } else {
      // Service component
      addTourComponent({
        ...baseComponent,
        service_inventory_id: componentForm.pricing_mode === 'use_service_inventory' ? componentForm.service_inventory_id : undefined,
        service_name: componentForm.service_name,
        provider: suppliers.find(s => s.id === componentForm.provider_id)?.name,
        inventory_source: componentForm.inventory_source,
        quantity_per_booking: componentForm.quantity_per_booking,
        pricing_unit: componentForm.pricing_unit,
        cost_per_couple: componentForm.pricing_mode === 'fixed_price' ? componentForm.fixed_cost_per_couple : undefined,
        sell_per_couple: componentForm.pricing_mode === 'fixed_price' ? componentForm.fixed_sell_per_couple : undefined,
      })
    }
    
    toast.success('Component added to tour')
    setIsComponentOpen(false)
    resetComponentForm()
  }
  
  const resetComponentForm = () => {
    setComponentForm({
      component_type: componentType === 'accommodation' ? 'accommodation' : 'transfer',
      label: '',
      check_in_date: viewingTour?.start_date || '',
      check_out_date: viewingTour?.end_date || '',
      included_in_base_price: true,
      pricing_mode: componentType === 'accommodation' ? 'use_contract' : 'use_service_inventory',
      hotel_id: 0,
      room_group_id: '',
      board_type: 'bed_breakfast',
      service_inventory_id: 0,
      service_name: '',
      provider_id: 0,
      inventory_source: 'buy_to_order',
      quantity_per_booking: 1,
      pricing_unit: 'per_person',
      fixed_cost_per_couple: 0,
      fixed_sell_per_couple: 0,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tours</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tour
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tour</DialogTitle>
              <DialogDescription>Add a new tour to the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tour Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tour</DialogTitle>
            <DialogDescription>Update tour information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tour Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-start_date">Start Date *</Label>
              <Input
                id="edit-start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-end_date">End Date *</Label>
              <Input
                id="edit-end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Tour & Components Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingTour?.name} - Package Components</DialogTitle>
            <DialogDescription>
              Manage accommodation and service components for this tour package (per couple)
            </DialogDescription>
          </DialogHeader>

          {viewingTour && (
            <div className="space-y-4">
              {/* Tour Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Dates:</span> {viewingTour.start_date} - {viewingTour.end_date}</div>
                    <div><span className="text-muted-foreground">Components:</span> {tourComponents.filter((c: any) => c.tour_id === viewingTour.id).length}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Components List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Tour Components</h3>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenComponentDialog('accommodation')}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Hotel
                    </Button>
                    <Button size="sm" onClick={() => handleOpenComponentDialog('service')}>
                    <Plus className="h-4 w-4 mr-1" />
                      Add Service
                  </Button>
                  </div>
                </div>

                {tourComponents.filter((c: any) => c.tour_id === viewingTour.id).length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No components added yet. Add hotels and services to build your package.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {tourComponents
                      .filter((c: any) => c.tour_id === viewingTour.id)
                      .sort((a: any, b: any) => a.check_in_day - b.check_in_day)
                      .map((component: any) => {
                        // Calculate actual dates from check_in_day
                        const tourStart = new Date(viewingTour.start_date)
                        const componentCheckIn = new Date(tourStart)
                        componentCheckIn.setDate(componentCheckIn.getDate() + (component.check_in_day - 1))
                        const componentCheckOut = new Date(componentCheckIn)
                        componentCheckOut.setDate(componentCheckOut.getDate() + (component.nights || 1))
                        
                        const checkInStr = componentCheckIn.toISOString().split('T')[0]
                        const checkOutStr = componentCheckOut.toISOString().split('T')[0]
                        
                        const IconComponent = getServiceIcon(component.component_type)
                        const isAccommodation = component.component_type === 'accommodation'
                        
                        // Accommodation-specific data
                        const hotel = isAccommodation ? hotels.find(h => h.id === component.hotel_id) : null
                        const roomGroup = hotel?.room_groups?.find(rg => rg.id === component.room_group_id)
                        
                        return (
                          <Card key={component.id} className="border-l-4 border-l-primary">
                            <CardContent className="py-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <IconComponent className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span className="font-medium">{component.label || hotel?.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {SERVICE_TYPE_LABELS[component.component_type] || component.component_type}
                                    </Badge>
                                    {component.included_in_base_price ? (
                                      <Badge variant="default" className="text-xs">
                                        <Check className="h-3 w-3 mr-1" />
                                        Included
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">Optional Add-on</Badge>
                                    )}
                                    {component.pricing_mode === 'fixed_price' && (
                                      <Badge variant="outline" className="text-xs">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        Fixed Price
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground space-y-1">
                                    {/* Accommodation details */}
                                    {isAccommodation && (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-foreground">{hotel?.name}</span>
                                          <span>•</span>
                                          <span>{roomGroup?.room_type || 'Double Room'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <span>{checkInStr} → {checkOutStr}</span>
                                          <span>•</span>
                                          <span>{component.nights} night{component.nights !== 1 ? 's' : ''}</span>
                                          <span>•</span>
                                          <span>{BOARD_TYPE_LABELS[component.board_type] || component.board_type}</span>
                                        </div>
                                      </>
                                    )}
                                    
                                    {/* Service details */}
                                    {!isAccommodation && (
                                      <>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-foreground">{component.service_name}</span>
                                          {component.provider && (
                                            <>
                                              <span>•</span>
                                              <span>{component.provider}</span>
                                            </>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                          <span>{checkInStr}</span>
                                          {component.inventory_source && (
                                            <>
                                              <span>•</span>
                                              <span className={component.inventory_source === 'contract' ? 'text-green-600' : 'text-blue-600'}>
                                                {component.inventory_source === 'contract' ? 'Contract' : 'Buy-to-Order'}
                                              </span>
                                            </>
                                          )}
                                          {component.pricing_unit && (
                                            <>
                                              <span>•</span>
                                              <span>{component.pricing_unit.replace('_', ' ')}</span>
                                            </>
                                          )}
                                          {component.quantity_per_booking && (
                                            <>
                                              <span>•</span>
                                              <span>Qty: {component.quantity_per_booking}</span>
                                            </>
                                          )}
                                        </div>
                                      </>
                                    )}
                                    
                                    {/* Fixed pricing details */}
                                    {component.pricing_mode === 'fixed_price' && (
                                      <div className="flex items-center gap-3 text-xs pt-1">
                                        <span>Cost: €{(isAccommodation ? component.fixed_cost_per_couple : component.cost_per_couple) || 0}</span>
                                        <span>•</span>
                                        <span>Sell: €{(isAccommodation ? component.fixed_sell_per_couple : component.sell_per_couple) || 0}</span>
                                        <span className="text-green-600">
                                          • Margin: €{((isAccommodation ? component.fixed_sell_per_couple : component.sell_per_couple) || 0) - ((isAccommodation ? component.fixed_cost_per_couple : component.cost_per_couple) || 0)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0"
                                  onClick={() => {
                                    if (confirm('Remove this component?')) {
                                      deleteTourComponent(component.id)
                                      toast.info('Component removed')
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Tours"
        columns={columns}
        data={tours}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
