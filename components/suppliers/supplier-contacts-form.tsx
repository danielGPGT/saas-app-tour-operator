'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SupplierSchema } from '@/lib/schemas'
import { Plus, Trash2, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Supplier } from '@/types/domain'

interface SupplierContactsFormProps {
  supplier?: Supplier | null
  onSubmit: (data: Partial<Supplier>) => void
}

export function SupplierContactsForm({ supplier, onSubmit }: SupplierContactsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(SupplierSchema.pick({ 
      emails: true, 
      phones: true 
    })),
    defaultValues: {
      emails: supplier?.emails || [],
      phones: supplier?.phones || []
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

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addEmail = () => {
    appendEmail({
      name: '',
      email: '',
      role: ''
    })
  }

  const addPhone = () => {
    appendPhone({
      label: '',
      number: ''
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Email Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Contacts
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addEmail}>
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {emailFields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No email contacts configured.
            </p>
          ) : (
            <div className="space-y-4">
              {emailFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-4 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      {...register(`emails.${index}.name`)}
                      placeholder="Contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      {...register(`emails.${index}.email`)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      {...register(`emails.${index}.role`)}
                      placeholder="e.g., Sales Manager"
                    />
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
          )}
        </CardContent>
      </Card>

      {/* Phone Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Contacts
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPhone}>
              <Plus className="h-4 w-4 mr-2" />
              Add Phone
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {phoneFields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No phone contacts configured.
            </p>
          ) : (
            <div className="space-y-4">
              {phoneFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      {...register(`phones.${index}.label`)}
                      placeholder="e.g., Main, Sales, Support"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Number *</Label>
                    <Input
                      {...register(`phones.${index}.number`)}
                      placeholder="+1 234 567 8900"
                    />
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
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Contacts'}
        </Button>
      </div>
    </form>
  )
}
