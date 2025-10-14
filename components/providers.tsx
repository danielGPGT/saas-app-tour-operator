'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { DataProvider } from '@/contexts/data-context'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="next-ui-theme">
      <DataProvider>
        {children}
      </DataProvider>
    </ThemeProvider>
  )
}
