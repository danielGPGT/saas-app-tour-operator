'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SupplierSchema } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Supplier } from '@/types/domain'

interface SupplierFinanceFormProps {
  supplier?: Supplier | null
  onSubmit: (data: Partial<Supplier>) => void
}

export function SupplierFinanceForm({ supplier, onSubmit }: SupplierFinanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(SupplierSchema.pick({ 
      payment_terms: true, 
      bank: true, 
      tax: true 
    })),
    defaultValues: {
      payment_terms: supplier?.payment_terms || '',
      bank: supplier?.bank || {
        iban: '',
        swift: '',
        account_name: '',
        currency: 'EUR'
      },
      tax: supplier?.tax || {
        vat_number: '',
        country: ''
      }
    }
  })

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Input
              id="payment_terms"
              {...register('payment_terms')}
              placeholder="e.g., Net 30, Prepaid, 50% on booking"
            />
            {errors.payment_terms && (
              <p className="text-sm text-red-600">{errors.payment_terms.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Banking Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Banking Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                {...register('bank.account_name')}
                placeholder="Account holder name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_currency">Currency</Label>
              <Select
                value={watch('bank.currency')}
                onValueChange={(value) => setValue('bank.currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                  <SelectItem value="SEK">SEK</SelectItem>
                  <SelectItem value="NOK">NOK</SelectItem>
                  <SelectItem value="DKK">DKK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              {...register('bank.iban')}
              placeholder="International Bank Account Number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swift">SWIFT/BIC</Label>
            <Input
              id="swift"
              {...register('bank.swift')}
              placeholder="Bank Identifier Code"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vat_number">VAT Number</Label>
              <Input
                id="vat_number"
                {...register('tax.vat_number')}
                placeholder="VAT registration number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                {...register('tax.country')}
                placeholder="Country of registration"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Financial Info'}
        </Button>
      </div>
    </form>
  )
}
