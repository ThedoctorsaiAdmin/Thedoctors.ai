'use client'
import AppLayout from '@/components/layout/AppLayout'

export default function NotificationsPage() {
  return (
    <AppLayout>
      <div className="animate-fade-up">
        <h1 className="text-xl font-bold mb-1">Notifications</h1>
        <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>Loading notifications...</p>
      </div>
    </AppLayout>
  )
}
