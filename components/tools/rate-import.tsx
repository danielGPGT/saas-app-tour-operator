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
import { useRateBands } from '@/hooks/use-rate-bands'
import { useContracts } from '@/hooks/use-contracts'
import { useProducts } from '@/hooks/use-products'

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

export function RateImport() {
  const [file, setFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { createRateBand } = useRateBands()
  const { data: contracts } = useContracts()
  const { data: products } = useProducts()

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
          { row: 3, field: 'markup_b2c_pct', message: 'B2C markup must be between 0-500%' },
          { row: 7, field: 'product_id', message: 'Product not found' },
          { row: 12, field: 'band_start', message: 'Start date must be before end date' }
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
    const csvContent = `product_id,contract_id,band_start,band_end,weekday_mask,currency,single,double,triple,quad,included_board,included_cost_pppn,min_stay,max_stay,pool_id,markup_b2c_pct,markup_b2b_pct,active
product_1,contract_1,2024-05-01,2024-05-31,127,EUR,80,120,150,180,BB,15,1,14,may-2025-double,60,20,true
product_2,contract_1,2024-06-01,2024-08-31,127,EUR,100,150,180,220,BB,15,1,14,summer-2025-superior,70,25,true`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rate-bands-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const copyTemplateToClipboard = () => {
    const csvContent = `product_id,contract_id,band_start,band_end,weekday_mask,currency,single,double,triple,quad,included_board,included_cost_pppn,min_stay,max_stay,pool_id,markup_b2c_pct,markup_b2b_pct,active
product_1,contract_1,2024-05-01,2024-05-31,127,EUR,80,120,150,180,BB,15,1,14,may-2025-double,60,20,true`
    
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
            Import Rate Bands
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file with rate band data
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="rate-file-upload"
            />
            <label htmlFor="rate-file-upload">
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
                  Successfully imported {importResult.imported} rate bands!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* CSV Format Help */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Bands CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm">
              <strong>Required columns:</strong>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">product_id</div>
                <div className="text-muted-foreground">Product identifier</div>
              </div>
              <div>
                <div className="font-medium">contract_id</div>
                <div className="text-muted-foreground">Contract identifier</div>
              </div>
              <div>
                <div className="font-medium">band_start</div>
                <div className="text-muted-foreground">Start date (YYYY-MM-DD)</div>
              </div>
              <div>
                <div className="font-medium">band_end</div>
                <div className="text-muted-foreground">End date (YYYY-MM-DD)</div>
              </div>
              <div>
                <div className="font-medium">weekday_mask</div>
                <div className="text-muted-foreground">0-127 (127 = all days)</div>
              </div>
              <div>
                <div className="font-medium">currency</div>
                <div className="text-muted-foreground">3-letter currency code</div>
              </div>
              <div>
                <div className="font-medium">single/double/triple/quad</div>
                <div className="text-muted-foreground">NET rates per occupancy</div>
              </div>
              <div>
                <div className="font-medium">markup_b2c_pct</div>
                <div className="text-muted-foreground">B2C markup percentage (0-500)</div>
              </div>
              <div>
                <div className="font-medium">markup_b2b_pct</div>
                <div className="text-muted-foreground">B2B markup percentage (0-500)</div>
              </div>
              <div>
                <div className="font-medium">active</div>
                <div className="text-muted-foreground">true/false</div>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> At least one occupancy price (single, double, triple, quad) is required. 
                Markup percentages are mandatory and must be between 0-500%.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Available Products & Contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {products?.filter(p => p.active).map(product => (
                <div key={product.id} className="text-sm">
                  <span className="font-medium">{product.id}</span>
                  <span className="text-muted-foreground ml-2">- {product.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {contracts?.filter(c => c.active).map(contract => (
                <div key={contract.id} className="text-sm">
                  <span className="font-medium">{contract.id}</span>
                  <span className="text-muted-foreground ml-2">- {contract.supplier_id}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
