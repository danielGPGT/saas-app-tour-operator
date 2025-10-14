/**
 * PRICING POLICIES MANAGEMENT COMPONENT
 * Manage markup rules and pricing strategies
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Globe, Users, Lock, Target } from 'lucide-react'
import type { UnifiedPricingPolicy } from '@/types/unified-inventory'

interface PricingPoliciesProps {
  policies: UnifiedPricingPolicy[]
  onAdd: (policy: Omit<UnifiedPricingPolicy, 'id' | 'created_at'>) => void
  onUpdate: (id: number, updates: Partial<UnifiedPricingPolicy>) => void
  onDelete: (id: number) => void
}

const CHANNEL_ICONS = {
  web: Globe,
  b2b: Users,
  internal: Lock
}

export function PricingPolicies({ policies, onAdd, onUpdate, onDelete }: PricingPoliciesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<UnifiedPricingPolicy | undefined>()
  const [formData, setFormData] = useState({
    policy_name: '',
    description: '',
    scope_channel: '',
    scope_offer_id: '',
    scope_tour_id: '',
    scope_market: '',
    strategy: 'markup_pct' as 'markup_pct' | 'gross_fixed' | 'agent_commission',
    value: 0,
    valid_from: '',
    valid_to: '',
    active: true
  })

  const handleOpenDialog = (policy?: UnifiedPricingPolicy) => {
    if (policy) {
      setEditingPolicy(policy)
      setFormData({
        policy_name: policy.policy_name,
        description: policy.description || '',
        scope_channel: policy.scope.channel || '',
        scope_offer_id: policy.scope.offer_id?.toString() || '',
        scope_tour_id: policy.scope.tour_id?.toString() || '',
        scope_market: policy.scope.market || '',
        strategy: policy.strategy,
        value: policy.value,
        valid_from: policy.valid_from || '',
        valid_to: policy.valid_to || '',
        active: policy.active
      })
    } else {
      setEditingPolicy(undefined)
      setFormData({
        policy_name: '',
        description: '',
        scope_channel: '',
        scope_offer_id: '',
        scope_tour_id: '',
        scope_market: '',
        strategy: 'markup_pct',
        value: 0,
        valid_from: '',
        valid_to: '',
        active: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.policy_name || !formData.strategy) {
      alert('Please fill in required fields')
      return
    }

    const policyData = {
      policy_name: formData.policy_name,
      description: formData.description || undefined,
      scope: {
        channel: formData.scope_channel || undefined,
        offer_id: formData.scope_offer_id ? parseInt(formData.scope_offer_id) : undefined,
        tour_id: formData.scope_tour_id ? parseInt(formData.scope_tour_id) : undefined,
        market: formData.scope_market || undefined
      },
      strategy: formData.strategy,
      value: formData.value,
      valid_from: formData.valid_from || undefined,
      valid_to: formData.valid_to || undefined,
      active: formData.active
    }

    if (editingPolicy) {
      onUpdate(editingPolicy.id, policyData)
    } else {
      onAdd(policyData)
    }

    setIsDialogOpen(false)
    setEditingPolicy(undefined)
  }

  const getScopeDescription = (policy: UnifiedPricingPolicy) => {
    const parts = []
    
    if (policy.scope.channel) {
      const Icon = CHANNEL_ICONS[policy.scope.channel as keyof typeof CHANNEL_ICONS]
      parts.push(
        <div key="channel" className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          <span>{policy.scope.channel.toUpperCase()}</span>
        </div>
      )
    }
    
    if (policy.scope.offer_id) {
      parts.push(<span key="offer">Offer #{policy.scope.offer_id}</span>)
    }
    
    if (policy.scope.tour_id) {
      parts.push(<span key="tour">Tour #{policy.scope.tour_id}</span>)
    }
    
    if (policy.scope.market) {
      parts.push(<span key="market">{policy.scope.market}</span>)
    }

    return parts.length > 0 ? (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {parts}
      </div>
    ) : (
      <span className="text-xs text-muted-foreground">Global policy</span>
    )
  }

  const getStrategyDescription = (policy: UnifiedPricingPolicy) => {
    switch (policy.strategy) {
      case 'markup_pct':
        return `${policy.value}% markup`
      case 'gross_fixed':
        return `Fixed £${policy.value}`
      case 'agent_commission':
        return `${policy.value}% commission`
      default:
        return 'Unknown strategy'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pricing Policies</h3>
          <p className="text-sm text-muted-foreground">
            Manage markup rules and pricing strategies
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Policy
        </Button>
      </div>

      {policies.length > 0 ? (
        <div className="space-y-3">
          {policies.map(policy => (
            <Card key={policy.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{policy.policy_name}</h4>
                      <Badge variant={policy.active ? 'default' : 'secondary'}>
                        {policy.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    {policy.description && (
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    )}
                    
                    {getScopeDescription(policy)}
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{getStrategyDescription(policy)}</span>
                      </div>
                      
                      {policy.valid_from && policy.valid_to && (
                        <div className="text-muted-foreground">
                          {policy.valid_from} to {policy.valid_to}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDialog(policy)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(policy.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pricing policies configured. Add your first policy to start managing markup rules.
          </CardContent>
        </Card>
      )}

      {/* Policy Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? 'Edit Pricing Policy' : 'Create Pricing Policy'}
            </DialogTitle>
            <DialogDescription>
              {editingPolicy ? 'Update pricing policy details' : 'Create a new pricing policy for markup rules'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_name">Policy Name *</Label>
                <Input
                  id="policy_name"
                  value={formData.policy_name}
                  onChange={(e) => setFormData({ ...formData, policy_name: e.target.value })}
                  placeholder="e.g., Web Standard Markup"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Strategy *</Label>
                <Select
                  value={formData.strategy}
                  onValueChange={(value: any) => setFormData({ ...formData, strategy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markup_pct">Percentage Markup</SelectItem>
                    <SelectItem value="gross_fixed">Fixed Gross Price</SelectItem>
                    <SelectItem value="agent_commission">Agent Commission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>

            <div className="space-y-2">
              <Label>Scope (What this policy applies to)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scope_channel">Channel</Label>
                  <Select
                    value={formData.scope_channel}
                    onValueChange={(value) => setFormData({ ...formData, scope_channel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any channel</SelectItem>
                      <SelectItem value="web">Web</SelectItem>
                      <SelectItem value="b2b">B2B</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope_offer_id">Offer ID</Label>
                  <Input
                    id="scope_offer_id"
                    type="number"
                    value={formData.scope_offer_id}
                    onChange={(e) => setFormData({ ...formData, scope_offer_id: e.target.value })}
                    placeholder="Specific offer ID"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.strategy === 'markup_pct' && 'Percentage markup (e.g., 60 for 60%)'}
                  {formData.strategy === 'gross_fixed' && 'Fixed gross price (e.g., 150.00)'}
                  {formData.strategy === 'agent_commission' && 'Commission percentage (e.g., 10 for 10%)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From</Label>
                <Input
                  id="valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_to">Valid To</Label>
              <Input
                id="valid_to"
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPolicy ? 'Update' : 'Create'} Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
