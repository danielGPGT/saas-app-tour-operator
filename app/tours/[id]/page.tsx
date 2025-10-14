'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Users, FileText, Package, Settings, Eye, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTours } from '@/hooks/use-tours'
import { usePackageCategories } from '@/hooks/use-package-categories'
import { usePackages } from '@/hooks/use-packages'
import { PackageCategorySheet, PackageSheet } from '@/components/packages'
import { Tour, TourStatus, PackageCategory } from '@/types/domain'
import type { Package } from '@/types/domain'
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

export default function TourDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tourId = params.id as string

  const { getTourById } = useTours()
  const { getCategoriesByTour, createCategory, updateCategory, deleteCategory } = usePackageCategories()
  const { getPackagesByTour, createPackage, updatePackage, deletePackage } = usePackages()

  const tour = getTourById(tourId)
  const categories = getCategoriesByTour(tourId)
  const packages = getPackagesByTour(tourId)

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState<PackageCategory | null>(null)
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [isPackageSheetOpen, setIsPackageSheetOpen] = useState(false)

  const handleCreateCategory = () => {
    setSelectedCategory(null)
    setIsCategorySheetOpen(true)
  }

  const handleEditCategory = (category: PackageCategory) => {
    setSelectedCategory(category)
    setIsCategorySheetOpen(true)
  }

  const handleSaveCategory = async (data: Partial<PackageCategory>) => {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data)
      } else {
        await createCategory(data)
      }
    } catch (error) {
      console.error('Error saving category:', error)
      throw error
    }
  }

  const handleDeleteCategory = async (category: PackageCategory) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all packages in this category.`)) {
      try {
        await deleteCategory(category.id)
        toast.success('Category deleted successfully')
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('Failed to delete category')
      }
    }
  }

  const handleCreatePackage = () => {
    setSelectedPackage(null)
    setIsPackageSheetOpen(true)
  }

  const handleEditPackage = (packageData: Package) => {
    setSelectedPackage(packageData)
    setIsPackageSheetOpen(true)
  }

  const handleSavePackage = async (data: Partial<Package>) => {
    try {
      if (selectedPackage) {
        await updatePackage(selectedPackage.id, data)
      } else {
        await createPackage(data)
      }
    } catch (error) {
      console.error('Error saving package:', error)
      throw error
    }
  }

  const handleDeletePackage = async (packageData: Package) => {
    if (window.confirm(`Are you sure you want to delete "${packageData.name}"?`)) {
      try {
        await deletePackage(packageData.id)
        toast.success('Package deleted successfully')
      } catch (error) {
        console.error('Error deleting package:', error)
        toast.error('Failed to delete package')
      }
    }
  }

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Tour Not Found</h2>
          <p className="text-muted-foreground mt-2">The requested tour could not be found.</p>
          <Button onClick={() => router.push('/tours')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tours
          </Button>
        </div>
      </div>
    )
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/tours')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tour.name}</h1>
            <p className="text-muted-foreground">{tour.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[tour.status]}>
            {statusLabels[tour.status]}
          </Badge>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Tour Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDuration(tour.start_date, tour.end_date)}</div>
            <p className="text-xs text-muted-foreground">
              {new Date(tour.start_date).toLocaleDateString()} - {new Date(tour.end_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.filter(cat => cat.active).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">
              {packages.filter(pkg => pkg.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Until Start</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDaysUntilStart(tour.start_date)}</div>
            <p className="text-xs text-muted-foreground">
              {getDaysUntilStart(tour.start_date) > 0 ? 'days remaining' : 'tour started'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Package Categories</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tour Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tour Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tour.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">{tour.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Start Date</h4>
                      <p className="text-muted-foreground">{new Date(tour.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">End Date</h4>
                      <p className="text-muted-foreground">{new Date(tour.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {tour.max_capacity && (
                    <div>
                      <h4 className="font-medium mb-2">Max Capacity</h4>
                      <p className="text-muted-foreground">{tour.max_capacity} participants</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={handleCreateCategory}>
                    <Package className="h-4 w-4 mr-2" />
                    Add Package Category
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleCreatePackage}>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Package
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Tour Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tour Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className={statusColors[tour.status]}>
                        {statusLabels[tour.status]}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Active</span>
                      <Badge variant={tour.active ? "default" : "secondary"}>
                        {tour.active ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Package Categories</h2>
            <Button onClick={handleCreateCategory}>
              <Package className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </div>
          
          {categories.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Categories Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create package categories to organize your tour packages.
                </p>
                <Button onClick={handleCreateCategory}>
                  <Package className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="relative">
                  {category.color_tag && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 rounded-t-lg" 
                      style={{ backgroundColor: category.color_tag }}
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={category.active ? "default" : "secondary"}>
                          {category.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Packages</span>
                        <span>{packages.filter(pkg => pkg.category_id === category.id).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>B2C Visible</span>
                        <Badge variant={category.visibility_b2c ? "default" : "secondary"}>
                          {category.visibility_b2c ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>B2B Visible</span>
                        <Badge variant={category.visibility_b2b ? "default" : "secondary"}>
                          {category.visibility_b2b ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Packages</h2>
            <Button onClick={handleCreatePackage}>
              <FileText className="h-4 w-4 mr-2" />
              New Package
            </Button>
          </div>
          
          {packages.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Packages Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create packages to bundle products for your customers.
                </p>
                <Button onClick={handleCreatePackage}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create First Package
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryPackages = packages.filter(pkg => pkg.category_id === category.id)
                if (categoryPackages.length === 0) return null

                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {category.color_tag && (
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color_tag }}
                            />
                          )}
                          {category.name}
                        </CardTitle>
                        <Badge variant="outline">
                          {categoryPackages.length} package{categoryPackages.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryPackages.map((pkg) => (
                          <Card key={pkg.id} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-base">{pkg.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                                    {pkg.status}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditPackage(pkg)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeletePackage(pkg)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {pkg.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {pkg.description}
                                </p>
                              )}
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Components</span>
                                  <span>{pkg.components.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>B2C</span>
                                  <Badge variant={pkg.visibility_b2c ? "default" : "secondary"}>
                                    {pkg.visibility_b2c ? 'Visible' : 'Hidden'}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span>B2B</span>
                                  <Badge variant={pkg.visibility_b2b ? "default" : "secondary"}>
                                    {pkg.visibility_b2b ? 'Visible' : 'Hidden'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bookings Coming Soon</h3>
              <p className="text-muted-foreground">
                Booking management will be available once packages are created.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Package Category Sheet */}
      <PackageCategorySheet
        category={selectedCategory}
        tourId={tourId}
        open={isCategorySheetOpen}
        onOpenChange={setIsCategorySheetOpen}
        onSave={handleSaveCategory}
      />

      {/* Package Sheet */}
      <PackageSheet
        packageData={selectedPackage}
        tourId={tourId}
        categories={categories}
        open={isPackageSheetOpen}
        onOpenChange={setIsPackageSheetOpen}
        onSave={handleSavePackage}
      />
    </div>
  )
}
