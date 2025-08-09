// contexts/LoadingContext.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { FullScreenLoader } from '@/components/ui/loader'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  showLoader: (text?: string) => void
  hideLoader: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState<string | undefined>()

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
    if (!loading) {
      setLoadingText(undefined)
    }
  }

  const showLoader = (text?: string) => {
    setLoadingText(text)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
    setLoadingText(undefined)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, showLoader, hideLoader }}>
      {children}
      <FullScreenLoader 
        isLoading={isLoading} 
        text={loadingText}
        variant="dots"
        backdrop="blur"
      />
    </LoadingContext.Provider>
  )
}

// Hook for automatic loading on async operations
export const useAsyncLoading = () => {
  const { showLoader, hideLoader } = useLoading()

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    loadingText?: string
  ): Promise<T> => {
    showLoader(loadingText)
    try {
      const result = await asyncFn()
      return result
    } finally {
      hideLoader()
    }
  }

  return { withLoading }
}
