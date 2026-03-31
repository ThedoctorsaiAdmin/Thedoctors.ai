'use client'
import AppLayout from '@/components/layout/AppLayout'

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold mb-1">Reports</h1>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Loading reports...</p>
      </div>
    </AppLayout>
  )
}
