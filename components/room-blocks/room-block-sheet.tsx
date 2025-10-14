'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { RoomBlockForm } from './room-block-form'
import type { RoomBlock } from '@/types/domain'
import { useRoomBlocks } from '@/hooks/use-room-blocks'

interface RoomBlockSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomBlock?: RoomBlock | null
  contractId?: string
  isCreating?: boolean
}

export function RoomBlockSheet({ 
  open, 
  onOpenChange, 
  roomBlock, 
  contractId,
  isCreating = false 
}: RoomBlockSheetProps) {
  const { updateRoomBlock, createRoomBlock } = useRoomBlocks()

  const handleSave = async (data: Partial<RoomBlock>) => {
    try {
      if (isCreating && contractId) {
        await createRoomBlock({
          ...data,
          contract_id: contractId
        } as Omit<RoomBlock, 'id' | 'created_at' | 'updated_at'>)
      } else if (roomBlock) {
        await updateRoomBlock(roomBlock.id, data)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving room block:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      tentative: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      released: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.tentative
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="!max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>
                {isCreating ? 'Create Room Block' : `Room Block ${roomBlock?.id || ''}`}
              </SheetTitle>
              <SheetDescription>
                {isCreating 
                  ? 'Create a new room block for this contract' 
                  : 'Manage room block details and allocations'
                }
              </SheetDescription>
            </div>
            {roomBlock && !isCreating && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(roomBlock.status)}`}>
                {roomBlock.status}
              </span>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6">
          <RoomBlockForm
            roomBlock={roomBlock}
            onSubmit={handleSave}
            onCancel={() => onOpenChange(false)}
            isCreating={isCreating}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
