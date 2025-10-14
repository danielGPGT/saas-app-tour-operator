'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ContractSheet } from '@/components/contracts/contract-sheet'
import { useContracts } from '@/hooks/use-contracts'
import { Contract } from '@/types/domain'

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const { data: contracts, isLoading, error } = useContracts()

  const filteredContracts = contracts?.filter(contract =>
    contract.supplier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.resource_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleCreate = () => {
    setSelectedContract(null)
    setIsCreating(true)
    setIsSheetOpen(true)
  }

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract)
    setIsCreating(false)
    setIsSheetOpen(true)
  }

  const getFulfilmentColor = (fulfilment: string) => {
    const colors: Record<string, string> = {
      instant: 'bg-green-100 text-green-800',
      on_request: 'bg-yellow-100 text-yellow-800',
      buy_to_order: 'bg-blue-100 text-blue-800'
    }
    return colors[fulfilment] || colors.on_request
  }

  const getStatusColor = (active: boolean, validFrom: string, validTo: string) => {
    const now = new Date()
    const from = new Date(validFrom)
    const to = new Date(validTo)
    
    if (!active) return 'bg-gray-100 text-gray-800'
    if (now < from) return 'bg-yellow-100 text-yellow-800'
    if (now > to) return 'bg-red-100 text-red-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (active: boolean, validFrom: string, validTo: string) => {
    const now = new Date()
    const from = new Date(validFrom)
    const to = new Date(validTo)
    
    if (!active) return 'Inactive'
    if (now < from) return 'Future'
    if (now > to) return 'Expired'
    return 'Active'
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              Error loading contracts: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">
            Manage commercial agreements with suppliers
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Contract
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts?.filter(c => {
                const now = new Date()
                const from = new Date(c.valid_from)
                const to = new Date(c.valid_to)
                return c.active && now >= from && now <= to
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts?.filter(c => c.fulfilment === 'instant').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contracts?.filter(c => c.fulfilment === 'on_request').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Fulfilment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="h-12">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No contracts found matching your search' : 'No contracts found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{contract.supplier_id}</TableCell>
                      <TableCell>{contract.resource_id}</TableCell>
                      <TableCell>{contract.currency}</TableCell>
                      <TableCell className="text-sm">
                        <div>{new Date(contract.valid_from).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          to {new Date(contract.valid_to).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFulfilmentColor(contract.fulfilment)}>
                          {contract.fulfilment.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(contract.active, contract.valid_from, contract.valid_to)}>
                          {getStatusText(contract.active, contract.valid_from, contract.valid_to)}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.economics.commission_pct}%</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(contract)}>
                              Edit Contract
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Rates
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Contract Sheet */}
      <ContractSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        contract={selectedContract}
        isCreating={isCreating}
      />
    </div>
  )
}
