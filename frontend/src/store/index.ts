import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { DashboardFilters, DateRange } from '@/types'

// Theme store
interface ThemeState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useTheme = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'theme-storage',
      }
    )
  )
)

// Filters store
interface FiltersState {
  filters: DashboardFilters
  setDateRange: (dateRange: DateRange) => void
  setStores: (storeIds: string[]) => void
  setChannels: (channelIds: string[]) => void
  resetFilters: () => void
  updateFilters: (updates: Partial<DashboardFilters>) => void
}

const defaultDateRange: DateRange = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
  end: new Date().toISOString().split('T')[0], // today
}

const defaultFilters: DashboardFilters = {
  dateRange: defaultDateRange,
  storeIds: [],
  channelIds: [],
}

export const useFilters = create<FiltersState>()(
  devtools(
    persist(
      (set, get) => ({
        filters: defaultFilters,
        setDateRange: (dateRange) =>
          set((state) => ({
            filters: { ...state.filters, dateRange },
          })),
        setStores: (storeIds) =>
          set((state) => ({
            filters: { ...state.filters, storeIds },
          })),
        setChannels: (channelIds) =>
          set((state) => ({
            filters: { ...state.filters, channelIds },
          })),
        resetFilters: () => set({ filters: defaultFilters }),
        updateFilters: (updates) =>
          set((state) => ({
            filters: { ...state.filters, ...updates },
          })),
      }),
      {
        name: 'filters-storage',
      }
    )
  )
)

// UI state store
interface UIState {
  sidebarOpen: boolean
  loading: boolean
  error: string | null
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useUI = create<UIState>()(
  devtools((set) => ({
    sidebarOpen: true,
    loading: false,
    error: null,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),
  }))
)

// Analytics state store
interface AnalyticsState {
  selectedMetric: string | null
  chartType: 'line' | 'bar' | 'pie' | 'area'
  timeGranularity: 'hour' | 'day' | 'week' | 'month'
  compareMode: boolean
  selectedStores: string[]
  selectedProducts: string[]
  setSelectedMetric: (metric: string | null) => void
  setChartType: (type: 'line' | 'bar' | 'pie' | 'area') => void
  setTimeGranularity: (granularity: 'hour' | 'day' | 'week' | 'month') => void
  setCompareMode: (compare: boolean) => void
  setSelectedStores: (stores: string[]) => void
  setSelectedProducts: (products: string[]) => void
}

export const useAnalytics = create<AnalyticsState>()(
  devtools(
    persist(
      (set) => ({
        selectedMetric: null,
        chartType: 'line',
        timeGranularity: 'day',
        compareMode: false,
        selectedStores: [],
        selectedProducts: [],
        setSelectedMetric: (selectedMetric) => set({ selectedMetric }),
        setChartType: (chartType) => set({ chartType }),
        setTimeGranularity: (timeGranularity) => set({ timeGranularity }),
        setCompareMode: (compareMode) => set({ compareMode }),
        setSelectedStores: (selectedStores) => set({ selectedStores }),
        setSelectedProducts: (selectedProducts) => set({ selectedProducts }),
      }),
      {
        name: 'analytics-storage',
      }
    )
  )
)

// Export preferences store
interface ExportState {
  lastExportFormat: 'pdf' | 'excel' | 'csv'
  autoDownload: boolean
  includeCharts: boolean
  includeRawData: boolean
  setExportFormat: (format: 'pdf' | 'excel' | 'csv') => void
  setAutoDownload: (auto: boolean) => void
  setIncludeCharts: (include: boolean) => void
  setIncludeRawData: (include: boolean) => void
}

export const useExport = create<ExportState>()(
  devtools(
    persist(
      (set) => ({
        lastExportFormat: 'excel',
        autoDownload: true,
        includeCharts: true,
        includeRawData: false,
        setExportFormat: (lastExportFormat) => set({ lastExportFormat }),
        setAutoDownload: (autoDownload) => set({ autoDownload }),
        setIncludeCharts: (includeCharts) => set({ includeCharts }),
        setIncludeRawData: (includeRawData) => set({ includeRawData }),
      }),
      {
        name: 'export-storage',
      }
    )
  )
)

// Notifications store
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  autoClose?: boolean
  duration?: number
}

interface NotificationsState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotifications = create<NotificationsState>()(
  devtools((set, get) => ({
    notifications: [],
    addNotification: (notification) => {
      const id = Math.random().toString(36).substring(2)
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        autoClose: notification.autoClose ?? true,
        duration: notification.duration ?? 5000,
      }
      
      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }))

      // Auto remove notification if autoClose is enabled
      if (newNotification.autoClose) {
        setTimeout(() => {
          get().removeNotification(id)
        }, newNotification.duration)
      }
    },
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
    clearNotifications: () => set({ notifications: [] }),
  }))
)

// Recent activity store
interface Activity {
  id: string
  type: 'view' | 'export' | 'filter' | 'report'
  title: string
  description: string
  timestamp: number
  metadata?: Record<string, any>
}

interface ActivityState {
  activities: Activity[]
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void
  clearActivities: () => void
  getRecentActivities: (limit?: number) => Activity[]
}

export const useActivity = create<ActivityState>()(
  devtools(
    persist(
      (set, get) => ({
        activities: [],
        addActivity: (activity) => {
          const id = Math.random().toString(36).substring(2)
          const newActivity: Activity = {
            ...activity,
            id,
            timestamp: Date.now(),
          }
          
          set((state) => ({
            // Keep only last 50 activities
            activities: [newActivity, ...state.activities].slice(0, 50),
          }))
        },
        clearActivities: () => set({ activities: [] }),
        getRecentActivities: (limit = 10) => {
          return get().activities.slice(0, limit)
        },
      }),
      {
        name: 'activity-storage',
      }
    )
  )
)

// Combined store hook for convenience
export const useStore = () => ({
  theme: useTheme(),
  filters: useFilters(),
  ui: useUI(),
  analytics: useAnalytics(),
  export: useExport(),
  notifications: useNotifications(),
  activity: useActivity(),
})