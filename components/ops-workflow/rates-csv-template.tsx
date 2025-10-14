'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import type { InventoryItem } from '@/types/unified-inventory'

interface RatesCSVTemplateProps {
  item: InventoryItem
}

export function RatesCSVTemplate({ item }: RatesCSVTemplateProps) {
  const generateCSVTemplate = () => {
    // Create CSV header
    const headers = ['Category', 'Adult', 'Child', 'Senior', 'Student', 'Infant']
    
    // Create sample data for each category
    const rows = item.categories.map(category => {
      const basePrice = Math.floor(Math.random() * 500) + 100 // Random base price
      return [
        category.category_name,
        basePrice,
        Math.floor(basePrice * 0.5), // Child = 50% of adult
        Math.floor(basePrice * 0.8), // Senior = 80% of adult
        Math.floor(basePrice * 0.7), // Student = 70% of adult
        Math.floor(basePrice * 0.1)  // Infant = 10% of adult
      ]
    })
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.name.replace(/\s+/g, '-')}-rates-template.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('CSV template downloaded!')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Rates CSV Template
        </CardTitle>
        <CardDescription>Download a template with your categories pre-filled</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p>Template includes:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>All your categories ({item.categories.length} categories)</li>
              <li>Age band pricing (Adult, Child, Senior, Student, Infant)</li>
              <li>Sample pricing for reference</li>
              <li>Ready to edit and upload</li>
            </ul>
          </div>
          
          <Button onClick={generateCSVTemplate} size="sm" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
