'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'

interface ImportError {
  row: number
  field: string
  message: string
}

interface ImportResult {
  success: boolean
  errors: ImportError[]
  processed: number
  imported: number
}

export function AllocationImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleDryRun = async () => {
    if (!file) return
    
    setIsProcessing(true)
    
    // Simulate dry run processing
    setTimeout(() => {
      const mockResult: ImportResult = {
        success: true,
        errors: [
          { row: 3, field: 'capacity', message: 'Capacity must be a positive number' },
          { row: 7, field: 'start_date', message: 'Invalid date format' },
          { row: 12, field: 'product_id', message: 'Product not found' }
        ],
        processed: 15,
        imported: 12
      }
      setImportResult(mockResult)
      setIsProcessing(false)
    }, 2000)
  }

  const handleImport = async () => {
    if (!file || !importResult) return
    
    setIsProcessing(true)
    
    // Simulate import processing
    setTimeout(() => {
      setImportResult({
        ...importResult,
        success: true,
        imported: importResult.processed - importResult.errors.length
      })
      setIsProcessing(false)
    }, 1500)
  }

  const downloadTemplate = () => {
    const csvContent = `resource_id,product_id,start_date,end_date,pool_id,capacity,stop_sell
hotel_nh,hotel_nh_double,2025-05-15,2025-05-18,madrid-city-break,10,false
hotel_nh,hotel_nh_double,2025-05-20,2025-05-22,barcelona-weekend,8,false
hotel_nh,hotel_nh_suite,2025-06-01,2025-06-08,summer-package,5,false`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'allocations-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Allocations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with allocation data
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>Choose File</span>
              </Button>
            </label>
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDryRun}
                disabled={!file || isProcessing}
                variant="outline"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Dry Run
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importResult || importResult.errors.length > 0 || isProcessing}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Processed: {importResult.processed}
              </Badge>
              <Badge variant={importResult.imported > 0 ? 'default' : 'secondary'}>
                Imported: {importResult.imported}
              </Badge>
              {importResult.errors.length > 0 && (
                <Badge variant="destructive">
                  Errors: {importResult.errors.length}
                </Badge>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the following errors before importing:
                </AlertDescription>
              </Alert>
            )}

            {importResult.errors.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{error.row}</TableCell>
                        <TableCell>{error.field}</TableCell>
                        <TableCell className="text-red-600">{error.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {importResult.success && importResult.errors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported {importResult.imported} allocations!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV Format Help */}
      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Required columns:</strong>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">resource_id</div>
                <div className="text-muted-foreground">Resource identifier</div>
              </div>
              <div>
                <div className="font-medium">product_id</div>
                <div className="text-muted-foreground">Product identifier</div>
              </div>
              <div>
                <div className="font-medium">start_date</div>
                <div className="font-medium">end_date</div>
                <div className="text-muted-foreground">Date in YYYY-MM-DD format</div>
              </div>
              <div>
                <div className="font-medium">capacity</div>
                <div className="text-muted-foreground">Number of units available</div>
              </div>
              <div>
                <div className="font-medium">pool_id</div>
                <div className="text-muted-foreground">Optional pool identifier</div>
              </div>
              <div>
                <div className="font-medium">stop_sell</div>
                <div className="text-muted-foreground">true/false</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
