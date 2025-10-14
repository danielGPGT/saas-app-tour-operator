'use client'

import { useState, useEffect } from 'react'
import type { RoomBlock } from '@/types/domain'

const STORAGE_KEY = 'room-blocks'

export function useRoomBlocks() {
  const [roomBlocks, setRoomBlocks] = useState<RoomBlock[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRoomBlocks(JSON.parse(stored))
      } else {
        // Initialize with sample data
        const sampleData: RoomBlock[] = [
          {
            id: 'TPGPGT5',
            contract_id: 'contract-1',
            name: 'Grand Prix Grand Tours Block',
            description: 'F1 Monza 2026 - GPGT',
            total_rooms: 20,
            cutoff_date: 30,
            status: 'tentative',
            block_start: '2026-09-04',
            block_end: '2026-09-07',
            min_nights: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setRoomBlocks(sampleData)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData))
      }
    } catch (error) {
      console.error('Error loading room blocks:', error)
    }
  }, [])

  // Save to localStorage whenever roomBlocks changes
  useEffect(() => {
    if (roomBlocks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roomBlocks))
    }
  }, [roomBlocks])

  const createRoomBlock = async (data: Omit<RoomBlock, 'id' | 'created_at' | 'updated_at'>): Promise<RoomBlock> => {
    const newRoomBlock: RoomBlock = {
      ...data,
      id: `room-block-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setRoomBlocks(prev => [...prev, newRoomBlock])
    return newRoomBlock
  }

  const updateRoomBlock = async (id: string, data: Partial<RoomBlock>): Promise<RoomBlock> => {
    const updatedRoomBlock = {
      ...roomBlocks.find(rb => rb.id === id),
      ...data,
      updated_at: new Date().toISOString()
    } as RoomBlock

    setRoomBlocks(prev => prev.map(rb => rb.id === id ? updatedRoomBlock : rb))
    return updatedRoomBlock
  }

  const deleteRoomBlock = async (id: string): Promise<void> => {
    setRoomBlocks(prev => prev.filter(rb => rb.id !== id))
  }

  const getRoomBlock = (id: string): RoomBlock | undefined => {
    return roomBlocks.find(rb => rb.id === id)
  }

  const getRoomBlocksByContract = (contractId: string): RoomBlock[] => {
    return roomBlocks.filter(rb => rb.contract_id === contractId)
  }

  return {
    data: roomBlocks,
    createRoomBlock,
    updateRoomBlock,
    deleteRoomBlock,
    getRoomBlock,
    getRoomBlocksByContract
  }
}
