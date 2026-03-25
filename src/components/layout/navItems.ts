export type NavPage = 'dashboard' | 'analytics' | 'nodes' | 'terminal'

export interface NavItem {
  id: NavPage
  icon: string
  title: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: 'grid_view',  title: 'DASHBOARD' },
  { id: 'analytics', icon: 'monitoring', title: 'ANALYTICS' },
  { id: 'nodes',     icon: 'hub',        title: 'NODES' },
  { id: 'terminal',  icon: 'terminal',   title: 'TERMINAL' },
]
