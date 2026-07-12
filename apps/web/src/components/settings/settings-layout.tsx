import { Outlet } from 'react-router-dom'
import { PageContainer } from '@/components/shared/page-container'

export function SettingsLayout() {
  return (
    <PageContainer>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </PageContainer>
  )
}
