import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CombosLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="hidden md:flex items-center gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </header>

      {/* Hero Skeleton */}
      <section className="h-80 bg-gray-200">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto mb-8" />
            <Skeleton className="h-12 w-64 mx-auto" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Skeleton */}
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="mb-6">
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Combos Grid Skeleton */}
        <div className="grid lg:grid-cols-2 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />

                <div className="mb-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <div className="grid grid-cols-2 gap-1">
                    {[...Array(4)].map((_, j) => (
                      <Skeleton key={j} className="h-3 w-20" />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="space-y-1">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-3 w-full" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Skeleton */}
        <Card className="mt-12">
          <CardContent className="text-center py-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto mb-8" />
            <div className="flex gap-4 justify-center mb-8">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-32 mx-auto" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
