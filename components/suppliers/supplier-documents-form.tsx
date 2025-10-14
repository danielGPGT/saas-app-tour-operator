'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SupplierSchema } from '@/lib/schemas'
import { Plus, Trash2, Upload, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Supplier } from '@/types/domain'

interface SupplierDocumentsFormProps {
  supplier?: Supplier | null
  onSubmit: (data: Partial<Supplier>) => void
}

export function SupplierDocumentsForm({ supplier, onSubmit }: SupplierDocumentsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(SupplierSchema.pick({ documents: true })),
    defaultValues: {
      documents: supplier?.documents || []
    }
  })

  const { fields, append, remove } = useFieldArray({
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

  const addDocument = () => {
    append({
      name: '',
      url: ''
    })
  }

  const getFileTypeFromUrl = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'PDF'
      case 'doc': case 'docx': return 'DOC'
      case 'xls': case 'xlsx': return 'XLS'
      case 'jpg': case 'jpeg': case 'png': return 'IMG'
      default: return 'FILE'
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop files here, or click to browse
            </p>
            <Button type="button" variant="outline" size="sm">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Document Links</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addDocument}>
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No documents configured.
            </p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-4 gap-2 items-end">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      {...register(`documents.${index}.name`)}
                      placeholder="Document name"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>URL</Label>
                    <Input
                      {...register(`documents.${index}.url`)}
                      placeholder="https://example.com/document.pdf"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Documents */}
      {supplier?.documents && supplier.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {supplier.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">{doc.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getFileTypeFromUrl(doc.url)}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Documents'}
        </Button>
      </div>
    </form>
  )
}
