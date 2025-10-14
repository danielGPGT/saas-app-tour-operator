import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DayOfWeekSelector } from '@/components/ui/day-of-week-selector';
import { recordToDaySelection, daySelectionToRecord } from '@/types/unified-inventory';
import type { ContractPlugin } from '../types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface CoreRateFormProps {
  rate?: any; // UnifiedRate or similar
  contracts: any[]; // UnifiedContract[]
  offers: any[]; // UnifiedOffer[]
  onSave: (data: any) => void;
  onCancel: () => void;
  plugin?: ContractPlugin;
  selectedItem?: any; // InventoryItem
}

export function CoreRateForm({
  rate,
  contracts,
  offers,
  onSave,
  onCancel,
  plugin,
  selectedItem
}: CoreRateFormProps) {
  const [formData, setFormData] = useState<any>(
    rate || {
      rate_name: '',
      category_id: '',
      offer_id: '',
      inventory_type: 'buy_to_order',
      base_rate: 0,
      currency: 'GBP',
      valid_from: '',
      valid_to: '',
      days_of_week: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: true, sunday: true },
      active: true,
      rate_details: {},
      plugin_meta: {}
    }
  );

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };


  const handleSave = () => {
    // Basic validation
    if (!formData.rate_name || !formData.category_id || !formData.valid_from || !formData.valid_to) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave(formData);
  };


  return (
    <div className="space-y-6 p-4">
      <Accordion type="multiple" defaultValue={["basics", "validity", "plugin-specific"]} className="w-full">
        {/* Rate Basics */}
        <AccordionItem value="basics">
          <AccordionTrigger className="text-lg font-semibold">Rate Basics</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate_name">Rate Name *</Label>
                <Input
                  id="rate_name"
                  value={formData.rate_name}
                  onChange={(e) => updateField('rate_name', e.target.value)}
                  placeholder="e.g., Standard Double BB"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => updateField('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedItem?.categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.category_name}
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inventory_type">Rate Type *</Label>
                <Select
                  value={formData.inventory_type}
                  onValueChange={(value) => updateField('inventory_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy_to_order">Buy-to-Order</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer_id">Offer *</Label>
                <Select
                  value={formData.offer_id}
                  onValueChange={(value) => updateField('offer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {offers?.filter(o => o.item_id === selectedItem?.id).map((offer) => (
                      <SelectItem key={offer.id} value={offer.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{offer.offer_name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {offer.channel.toUpperCase()}
                          </span>
                        </div>
                      </SelectItem>
                    )) || []}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the offer this rate applies to. Create offers first if none are available.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => updateField('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_rate">Base Rate</Label>
                <Input
                  id="base_rate"
                  type="number"
                  step="0.01"
                  value={formData.base_rate || ''}
                  onChange={(e) => updateField('base_rate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 120.00"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Validity & Days */}
        <AccordionItem value="validity">
          <AccordionTrigger className="text-lg font-semibold">Validity & Days</AccordionTrigger>
          <AccordionContent className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valid_from">Valid From *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.valid_from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.valid_from ? format(new Date(formData.valid_from), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.valid_from ? new Date(formData.valid_from) : undefined}
                      onSelect={(date) => updateField('valid_from', date?.toISOString().split('T')[0] || '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valid_to">Valid To *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.valid_to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.valid_to ? format(new Date(formData.valid_to), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.valid_to ? new Date(formData.valid_to) : undefined}
                      onSelect={(date) => updateField('valid_to', date?.toISOString().split('T')[0] || '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valid Days</Label>
              <DayOfWeekSelector
                value={recordToDaySelection(formData.days_of_week)}
                onChange={(days) => updateField('days_of_week', daySelectionToRecord(days))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => updateField('active', checked)}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Plugin-Specific Fields */}
        {plugin && plugin.RateMetaForm && (
          <AccordionItem value="plugin-specific">
            <AccordionTrigger className="text-lg font-semibold">{plugin.label} Rate Details</AccordionTrigger>
            <AccordionContent className="p-4">
              <plugin.RateMetaForm
                value={{
                  ...formData.plugin_meta,
                  contract_linked: formData.inventory_type === 'contract',
                  base_rate: formData.base_rate
                }}
                onChange={(meta) => updateField('plugin_meta', meta)}
                rateBand={undefined} // Not used in this context
              />
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          Save Rate
        </Button>
      </div>
    </div>
  );
}
