/**
 * OFFER FORM COMPONENT
 * Create and edit offers for different channels
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Globe, Building2, Users, Lock } from 'lucide-react'
import type { UnifiedOffer, UnifiedContract, InventoryItem } from '@/types/unified-inventory'

interface OfferFormProps {
  offer?: UnifiedOffer
  item: InventoryItem
  contracts: UnifiedContract[]
  onSave: (offerData: Partial<UnifiedOffer>) => void
  onCancel: () => void
}

const CHANNEL_LABELS = {
  web: 'Web (Direct Customers)',
  b2b: 'B2B (Agents/Partners)', 
  internal: 'Internal (Staff/Testing)'
}

const CHANNEL_ICONS = {
  web: Globe,
  b2b: Building2,
  internal: Lock
}

export function OfferForm({ offer, item, contracts, onSave, onCancel }: OfferFormProps) {
  const [formData, setFormData] = useState({
    contract_id: offer?.contract_id?.toString() || '',
    category_id: offer?.category_id || '',
    channel: offer?.channel || 'web',
    currency: offer?.currency || 'GBP',
    min_stay: offer?.rules?.min_stay || '',
    max_stay: offer?.rules?.max_stay || '',
    visibility: offer?.rules?.visibility ?? true,
    tour_id: offer?.rules?.tour_id?.toString() || '',
    active: offer?.active ?? true
  })

  const handleSave = () => {
    // Validation
    if (!formData.contract_id || !formData.category_id) {
      alert('Please select a contract and category')
      return
    }

    const selectedContract = contracts.find(c => c.id.toString() === formData.contract_id)
    const selectedCategory = item.categories.find(c => c.id === formData.category_id)

    const offerData: Partial<UnifiedOffer> = {
      item_id: item.id,
      itemName: item.name,
      item_type: item.item_type,
      contract_id: parseInt(formData.contract_id),
      contractName: selectedContract?.contract_name || 'Unknown Contract',
      category_id: formData.category_id,
      categoryName: selectedCategory?.category_name || 'Unknown Category',
      channel: formData.channel as 'web' | 'b2b' | 'internal',
      currency: formData.currency,
      rules: {
        min_stay: formData.min_stay ? parseInt(formData.min_stay) : undefined,
        max_stay: formData.max_stay ? parseInt(formData.max_stay) : undefined,
        visibility: formData.visibility,
        tour_id: formData.tour_id ? parseInt(formData.tour_id) : undefined
      },
      active: formData.active
    }

    onSave(offerData)
  }

  const availableContracts = contracts.filter(c => c.item_id === item.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">
          {offer ? 'Edit Offer' : 'Create Offer'}
        </h2>
        <Badge variant="secondary">{item.name}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contract">Contract *</Label>
          <Select
            value={formData.contract_id}
            onValueChange={(value) => setFormData({ ...formData, contract_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contract" />
            </SelectTrigger>
            <SelectContent>
              {availableContracts.map(contract => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{contract.contract_name}</span>
                    {contract.cost_per_unit && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        £{contract.cost_per_unit.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the supplier contract for this offer
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {item.categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.category_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the room/service category
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="channel">Channel *</Label>
          <Select
            value={formData.channel}
            onValueChange={(value) => setFormData({ ...formData, channel: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CHANNEL_LABELS).map(([key, label]) => {
                const Icon = CHANNEL_ICONS[key as keyof typeof CHANNEL_ICONS]
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Sales channel for this offer
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData({ ...formData, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
              <SelectItem value="AUD">AUD (A$)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Display currency for customers
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tour">Tour (Optional)</Label>
          <Input
            id="tour"
            type="number"
            value={formData.tour_id}
            onChange={(e) => setFormData({ ...formData, tour_id: e.target.value })}
            placeholder="Tour ID"
          />
          <p className="text-xs text-muted-foreground">
            Link to specific tour
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_stay">Minimum Stay</Label>
          <Input
            id="min_stay"
            type="number"
            value={formData.min_stay}
            onChange={(e) => setFormData({ ...formData, min_stay: e.target.value })}
            placeholder="e.g., 2"
          />
          <p className="text-xs text-muted-foreground">
            Minimum nights/stays required
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_stay">Maximum Stay</Label>
          <Input
            id="max_stay"
            type="number"
            value={formData.max_stay}
            onChange={(e) => setFormData({ ...formData, max_stay: e.target.value })}
            placeholder="e.g., 14"
          />
          <p className="text-xs text-muted-foreground">
            Maximum nights/stays allowed
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="visibility"
          checked={formData.visibility}
          onCheckedChange={(checked) => setFormData({ ...formData, visibility: !!checked })}
        />
        <Label htmlFor="visibility">Visible to customers</Label>
        <p className="text-xs text-muted-foreground ml-2">
          Uncheck to hide this offer from public view
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
        />
        <Label htmlFor="active">Active</Label>
        <p className="text-xs text-muted-foreground ml-2">
          Uncheck to disable this offer
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {offer ? 'Update' : 'Create'} Offer
        </Button>
      </div>
    </div>
  )
}
