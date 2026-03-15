'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SearchParamsWrapper({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
  const searchParams = useSearchParams()
  return <>{children(searchParams)}</>
}

export function SearchParamsProvider({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsWrapper>{children}</SearchParamsWrapper>
    </Suspense>
  )
}
