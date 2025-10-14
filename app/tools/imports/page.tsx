'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle, CheckCircle, Database, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RateImport } from '@/components/tools/rate-import'
import { AllocationImport } from '@/components/tools/allocation-import'
import { ProductImport } from '@/components/tools/product-import'

export default function ImportsPage() {
  const [activeTab, setActiveTab] = useState('rates')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Import Tools</h1>
        <p className="text-muted-foreground">
          Import and manage your inventory data using CSV files
        </p>
      </div>

      {/* Import Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Bands</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Active rate bands
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocations</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Total allocations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10</div>
            <p className="text-xs text-muted-foreground">
              Active products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Import Process:</strong> Upload CSV files, review dry-run results, fix any errors, then import. 
          All imports include validation and error checking to ensure data integrity.
        </AlertDescription>
      </Alert>

      {/* Import Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Data Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rates">
                <Calendar className="h-4 w-4 mr-2" />
                Rate Bands
              </TabsTrigger>
              <TabsTrigger value="allocations">
                <Database className="h-4 w-4 mr-2" />
                Allocations
              </TabsTrigger>
              <TabsTrigger value="products">
                <FileText className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rates" className="mt-6">
              <RateImport />
            </TabsContent>

            <TabsContent value="allocations" className="mt-6">
              <AllocationImport />
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <ProductImport />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 'import_1',
                type: 'rates',
                filename: 'rates_may_2025.csv',
                status: 'completed',
                records: 24,
                timestamp: '2024-01-20T10:30:00Z'
              },
              {
                id: 'import_2',
                type: 'allocations',
                filename: 'allocations_spring.csv',
                status: 'completed',
                records: 156,
                timestamp: '2024-01-19T14:15:00Z'
              },
              {
                id: 'import_3',
                type: 'rates',
                filename: 'rates_april.csv',
                status: 'failed',
                records: 0,
                timestamp: '2024-01-18T09:45:00Z'
              }
            ].map((import_) => (
              <div key={import_.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {import_.type === 'rates' && <Calendar className="h-4 w-4 text-muted-foreground" />}
                    {import_.type === 'allocations' && <Database className="h-4 w-4 text-muted-foreground" />}
                    {import_.type === 'products' && <FileText className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium">{import_.filename}</span>
                  </div>
                  <Badge variant="outline">
                    {import_.type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {import_.records} records
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={import_.status === 'completed' ? 'default' : 'destructive'}>
                    <div className="flex items-center gap-1">
                      {import_.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {import_.status}
                    </div>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(import_.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
