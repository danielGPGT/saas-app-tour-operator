'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar, MapPin, Users, FileText, MoreHorizontal, Edit, Trash2, Eye, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TourSheet } from '@/components/tours/tour-sheet'
import { useTours } from '@/hooks/use-tours'
import { Tour, TourStatus } from '@/types/domain'
import { toast } from 'sonner'

const statusColors: Record<TourStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800'
}

const statusLabels: Record<TourStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

export default function ToursPage() {
  const router = useRouter()
  const { data: tours, createTour, updateTour, deleteTour } = useTours()
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleCreateTour = () => {
    setSelectedTour(null)
    setIsSheetOpen(true)
  }

  const handleEditTour = (tour: Tour) => {
    setSelectedTour(tour)
    setIsSheetOpen(true)
  }

  const handleViewTour = (tour: Tour) => {
    router.push(`/tours/${tour.id}`)
  }

  const handleSaveTour = async (data: Partial<Tour>) => {
    try {
      if (selectedTour) {
        await updateTour(selectedTour.id, data)
      } else {
        await createTour(data)
      }
    } catch (error) {
      console.error('Error saving tour:', error)
      throw error
    }
  }

  const handleDeleteTour = async (tour: Tour) => {
    if (window.confirm(`Are you sure you want to delete "${tour.name}"?`)) {
      try {
        await deleteTour(tour.id)
        toast.success('Tour deleted successfully')
      } catch (error) {
        console.error('Error deleting tour:', error)
        toast.error('Failed to delete tour')
      }
    }
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = end.getTime() - start.getTime()
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return `${days} day${days !== 1 ? 's' : ''}`
  }

  const getDaysUntilStart = (startDate: string) => {
    const start = new Date(startDate)
    const today = new Date()
    const diffTime = start.getTime() - today.getTime()
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tours</h1>
          <p className="text-muted-foreground">
            Manage your tours, packages, and itineraries. Click on a tour name or use "View & Manage Packages" to access package management.
          </p>
        </div>
        <Button onClick={handleCreateTour}>
          <Plus className="h-4 w-4 mr-2" />
              New Tour
            </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tours.length}</div>
          </CardContent>
        </Card>
        
              <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tours</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tours.filter(tour => tour.active).length}
                  </div>
                </CardContent>
              </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tours.filter(tour => tour.status === 'published').length}
                  </div>
          </CardContent>
        </Card>

                  <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tours.filter(tour => {
                const daysUntil = getDaysUntilStart(tour.start_date)
                return daysUntil > 0 && tour.active
              }).length}
            </div>
                    </CardContent>
                  </Card>
                                  </div>
                                  
      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Until Start</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tours found. Create your first tour to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tours.map((tour) => {
                  const daysUntil = getDaysUntilStart(tour.start_date)
                  return (
                    <TableRow key={tour.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <button 
                            onClick={() => handleViewTour(tour)}
                            className="font-medium text-left hover:text-primary hover:underline transition-colors"
                          >
                            {tour.name}
                          </button>
                          <div className="text-sm text-muted-foreground">
                            {tour.code}
                          </div>
                          {tour.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {tour.description}
                                        </div>
                                          )}
                                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {new Date(tour.start_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            to {new Date(tour.end_date).toLocaleDateString()}
                          </div>
                                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {getDuration(tour.start_date, tour.end_date)}
                                        </span>
                                      </div>
                      </TableCell>
                      <TableCell>
                        {tour.max_capacity ? (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{tour.max_capacity}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[tour.status]}>
                          {statusLabels[tour.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {daysUntil > 0 ? (
                            <span className="text-muted-foreground">
                              {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                            </span>
                          ) : daysUntil === 0 ? (
                            <span className="text-orange-600 font-medium">Today</span>
                          ) : (
                            <span className="text-muted-foreground">
                              {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} ago
                            </span>
                                    )}
                                  </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTour(tour)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View & Manage Packages
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTour(tour)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTour(tour)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
                            </CardContent>
                          </Card>

      {/* Tour Sheet */}
      <TourSheet
        tour={selectedTour}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={handleSaveTour}
      />
    </div>
  )
}