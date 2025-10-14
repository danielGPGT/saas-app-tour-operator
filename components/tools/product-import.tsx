'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, Copy } from 'lucide-react'
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
import { useProducts } from '@/hooks/use-products'
import { useResources } from '@/hooks/use-resources'

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

export function ProductImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { createProduct } = useProducts()
  const { data: resources } = useResources()

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
          { row: 2, field: 'resource_id', message: 'Resource not found' },
          { row: 5, field: 'name', message: 'Product name is required' },
          { row: 8, field: 'code', message: 'Product code already exists' }
        ],
        processed: 10,
        imported: 7
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
    const csvContent = `resource_id,name,code,attrs,active
resource_1,Standard Double Room,STD_DBL,"{""occupancy"":2,""room_type"":""double""}",true
resource_1,Superior Double Room,SUP_DBL,"{""occupancy"":2,""room_type"":""double""}",true
resource_2,General Admission,GEN_ADM,"{""category"":""general""}",true`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const copyTemplateToClipboard = () => {
    const csvContent = `resource_id,name,code,attrs,active
resource_1,Standard Double Room,STD_DBL,"{""occupancy"":2,""room_type"":""double""}",true`
    
    navigator.clipboard.writeText(csvContent).then(() => {
      // Could show a toast here
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Products
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with product data
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="product-file-upload"
            />
            <label htmlFor="product-file-upload">
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              <Button
                variant="outline"
                onClick={copyTemplateToClipboard}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Template
              </Button>
            </div>
            
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
                  Successfully imported {importResult.imported} products!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV Format Help */}
      <Card>
        <CardHeader>
          <CardTitle>Products CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm">
              <strong>Required columns:</strong>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">resource_id</div>
                <div className="text-muted-foreground">Resource identifier (must exist)</div>
              </div>
              <div>
                <div className="font-medium">name</div>
                <div className="text-muted-foreground">Product name</div>
              </div>
              <div>
                <div className="font-medium">code</div>
                <div className="text-muted-foreground">Optional product code</div>
              </div>
              <div>
                <div className="font-medium">attrs</div>
                <div className="text-muted-foreground">JSON attributes</div>
              </div>
              <div>
                <div className="font-medium">active</div>
                <div className="text-muted-foreground">true/false</div>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attributes Format:</strong> JSON string with type-specific attributes. 
                For accommodation: {"{"}"occupancy":2,"room_type":"double"{"}"}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Available Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {resources?.filter(r => r.active).map(resource => (
              <div key={resource.id} className="text-sm">
                <span className="font-medium">{resource.id}</span>
                <span className="text-muted-foreground ml-2">- {resource.name} ({resource.type})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
