'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SupplierSchema } from '@/lib/schemas'
import { Plus, Trash2, Mail, Phone, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Supplier } from '@/types/domain'

interface SupplierUnifiedFormProps {
  supplier?: Supplier | null
  onSubmit: (data: Partial<Supplier>) => void
  onCancel: () => void
  tab?: string
}

export function SupplierUnifiedForm({ supplier, onSubmit, onCancel, tab = 'profile' }: SupplierUnifiedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(SupplierSchema),
    defaultValues: {
      name: supplier?.name || '',
      type: supplier?.type || 'hotel',
      default_currency: supplier?.default_currency || 'EUR',
      active: supplier?.active ?? true,
      payment_terms: supplier?.payment_terms || '',
      notes: supplier?.notes || '',
      emails: supplier?.emails || [],
      phones: supplier?.phones || [],
      addresses: supplier?.addresses || [],
      bank_details: supplier?.bank_details || {},
      tax_info: supplier?.tax_info || {},
      documents: supplier?.documents || []
    }
  })

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control,
    name: 'emails'
  })

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phones'
  })

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses'
  })

  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray({
    control,
    name: 'documents'
  })

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter supplier name"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Supplier Type *</Label>
          <Select
            value={watch('type')}
            onValueChange={(value) => setValue('type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="wholesaler">Wholesaler</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="lounge">Lounge</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-red-500">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="default_currency">Default Currency</Label>
          <Select
            value={watch('default_currency')}
            onValueChange={(value) => setValue('default_currency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CHF">CHF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={watch('active')}
            onCheckedChange={(checked) => setValue('active', checked)}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Input
          id="payment_terms"
          {...register('payment_terms')}
          placeholder="e.g., Net 30, Prepaid"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Additional notes about this supplier"
          rows={3}
        />
      </div>
    </div>
  )

  const renderDefaultsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="default_commission">Default Commission %</Label>
          <Input
            id="default_commission"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('default_commission', { valueAsNumber: true })}
            placeholder="15.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_markup">Default Markup %</Label>
          <Input
            id="default_markup"
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('default_markup', { valueAsNumber: true })}
            placeholder="25.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="default_currency">Default Currency</Label>
        <Select
          value={watch('default_currency')}
          onValueChange={(value) => setValue('default_currency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
            <SelectItem value="CHF">CHF</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderFinanceTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">Bank Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              {...register('bank_details.bank_name')}
              placeholder="Bank Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              {...register('bank_details.account_number')}
              placeholder="Account Number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              {...register('bank_details.iban')}
              placeholder="IBAN"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="swift">SWIFT/BIC</Label>
            <Input
              id="swift"
              {...register('bank_details.swift')}
              placeholder="SWIFT/BIC"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Tax Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              {...register('tax_info.tax_id')}
              placeholder="Tax ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vat_number">VAT Number</Label>
            <Input
              id="vat_number"
              {...register('tax_info.vat_number')}
              placeholder="VAT Number"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContactsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Email Addresses</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendEmail({ email: '', type: 'primary' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Email
          </Button>
        </div>

        {emailFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                {...register(`emails.${index}.email`)}
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch(`emails.${index}.type`)}
                onValueChange={(value) => setValue(`emails.${index}.type`, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeEmail(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Phone Numbers</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPhone({ phone: '', type: 'primary' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Phone
          </Button>
        </div>

        {phoneFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                {...register(`phones.${index}.phone`)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch(`phones.${index}.type`)}
                onValueChange={(value) => setValue(`phones.${index}.type`, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="fax">Fax</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removePhone(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Addresses</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendAddress({ 
              street: '', 
              city: '', 
              country: '', 
              postal_code: '', 
              type: 'primary' 
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>

        {addressFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div className="space-y-2">
                <Label>Street Address</Label>
                <Input
                  {...register(`addresses.${index}.street`)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  {...register(`addresses.${index}.city`)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  {...register(`addresses.${index}.country`)}
                  placeholder="Country"
                />
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  {...register(`addresses.${index}.postal_code`)}
                  placeholder="12345"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAddress(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Address
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Documents</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDocument({ 
              name: '', 
              type: 'contract', 
              url: '', 
              uploaded_at: new Date().toISOString() 
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        {documentFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <div className="space-y-2">
              <Label>Document Name</Label>
              <Input
                {...register(`documents.${index}.name`)}
                placeholder="Contract Agreement"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={watch(`documents.${index}.type`)}
                onValueChange={(value) => setValue(`documents.${index}.type`, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL/Path</Label>
              <Input
                {...register(`documents.${index}.url`)}
                placeholder="/documents/contract.pdf"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeDocument(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  const getTabTitle = () => {
    const titles = {
      profile: 'Basic Information',
      defaults: 'Commercial Defaults',
      finance: 'Financial Information',
      contacts: 'Contact Information',
      documents: 'Documents'
    }
    return titles[tab as keyof typeof titles] || 'Supplier Information'
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">{getTabTitle()}</h3>
      </div>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {tab === 'profile' && renderProfileTab()}
        {tab === 'defaults' && renderDefaultsTab()}
        {tab === 'finance' && renderFinanceTab()}
        {tab === 'contacts' && renderContactsTab()}
        {tab === 'documents' && renderDocumentsTab()}

      </form>
    </div>
  )
}
