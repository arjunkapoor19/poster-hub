// components/ui/premium-loader.tsx
"use client"

import React from 'react'

interface PremiumLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dots' | 'spinner' | 'pulse' | 'bars'
  className?: string
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({ 
  size = 'md', 
  variant = 'dots',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16'
  }

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4'
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center space-x-1 ${className}`}>
        <div className={`${dotSizes[size]} bg-primary rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
        <div className={`${dotSizes[size]} bg-primary rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
        <div className={`${dotSizes[size]} bg-primary rounded-full animate-bounce`}></div>
      </div>
    )
  }

  if (variant === 'spinner') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full border-2 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full bg-primary rounded-full animate-pulse opacity-75"></div>
      </div>
    )
  }

  if (variant === 'bars') {
    const barSizes = {
      sm: 'w-0.5 h-4',
      md: 'w-1 h-8',
      lg: 'w-1.5 h-12'
    }

    return (
      <div className={`flex items-end justify-center space-x-1 ${className}`}>
        <div className={`${barSizes[size]} bg-primary animate-pulse [animation-delay:0s] [animation-duration:1.2s]`}></div>
        <div className={`${barSizes[size]} bg-primary animate-pulse [animation-delay:0.1s] [animation-duration:1.2s]`}></div>
        <div className={`${barSizes[size]} bg-primary animate-pulse [animation-delay:0.2s] [animation-duration:1.2s]`}></div>
        <div className={`${barSizes[size]} bg-primary animate-pulse [animation-delay:0.3s] [animation-duration:1.2s]`}></div>
      </div>
    )
  }

  return null
}

// Full-screen overlay loader
interface FullScreenLoaderProps {
  isLoading: boolean
  variant?: 'dots' | 'spinner' | 'pulse' | 'bars'
  text?: string
  backdrop?: 'blur' | 'dark' | 'transparent'
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  isLoading,
  variant = 'dots',
  text,
  backdrop = 'blur'
}) => {
  if (!isLoading) return null

  const backdropClasses = {
    blur: 'backdrop-blur-sm bg-background/80',
    dark: 'bg-background/90',
    transparent: 'bg-transparent'
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${backdropClasses[backdrop]}`}>
      <div className="flex flex-col items-center space-y-4">
        <PremiumLoader variant={variant} size="lg" />
        {text && (
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

// Page transition loader
export const PageLoader: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-primary animate-pulse"></div>
      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer"></div>
    </div>
  )
}

// Button loader (inline)
interface ButtonLoaderProps {
  isLoading: boolean
  children: React.ReactNode
  variant?: 'dots' | 'spinner'
  className?: string
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  isLoading,
  children,
  variant = 'spinner',
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {isLoading && <PremiumLoader variant={variant} size="sm" />}
      <span className={isLoading ? 'opacity-70' : ''}>{children}</span>
    </div>
  )
}