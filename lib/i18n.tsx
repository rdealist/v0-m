"use client"

import { createContext, useContext, useState, ReactNode } from "react"

// 支持的语言
export type Locale = "zh-CN" | "zh-TW" | "en" | "ja"

// 语言配置
export const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "zh-CN", label: "简体中文", flag: "CN" },
  { code: "zh-TW", label: "繁體中文", flag: "TW" },
  { code: "en", label: "English", flag: "US" },
  { code: "ja", label: "日本語", flag: "JP" },
]

// 翻译文案
const translations: Record<Locale, Record<string, string>> = {
  "zh-CN": {
    // 分页
    "pagination.previous": "上一页",
    "pagination.next": "下一页",
    "pagination.page": "第 {page} 页",
    "pagination.total": "共 {total} 项",
    "pagination.showing": "显示第 {start}-{end} 项",
    "pagination.found": "共找到 {count} 个{type}",
    "pagination.datasets": "数据集",
    "pagination.tasks": "任务",
    
    // 通用
    "common.all": "全部",
    "common.search": "搜索",
    "common.filter": "筛选",
    "common.sort": "排序",
    "common.newest": "最新发布",
    "common.oldest": "最早发布",
    "common.loading": "加载中...",
    "common.noData": "暂无数据",
    "common.confirm": "确认",
    "common.cancel": "取消",
  },
  "zh-TW": {
    // 分頁
    "pagination.previous": "上一頁",
    "pagination.next": "下一頁",
    "pagination.page": "第 {page} 頁",
    "pagination.total": "共 {total} 項",
    "pagination.showing": "顯示第 {start}-{end} 項",
    "pagination.found": "共找到 {count} 個{type}",
    "pagination.datasets": "資料集",
    "pagination.tasks": "任務",
    
    // 通用
    "common.all": "全部",
    "common.search": "搜尋",
    "common.filter": "篩選",
    "common.sort": "排序",
    "common.newest": "最新發布",
    "common.oldest": "最早發布",
    "common.loading": "載入中...",
    "common.noData": "暫無資料",
    "common.confirm": "確認",
    "common.cancel": "取消",
  },
  "en": {
    // Pagination
    "pagination.previous": "Previous",
    "pagination.next": "Next",
    "pagination.page": "Page {page}",
    "pagination.total": "{total} items",
    "pagination.showing": "Showing {start}-{end}",
    "pagination.found": "Found {count} {type}",
    "pagination.datasets": "datasets",
    "pagination.tasks": "tasks",
    
    // Common
    "common.all": "All",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.newest": "Newest",
    "common.oldest": "Oldest",
    "common.loading": "Loading...",
    "common.noData": "No data",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
  },
  "ja": {
    // ページネーション
    "pagination.previous": "前へ",
    "pagination.next": "次へ",
    "pagination.page": "{page} ページ",
    "pagination.total": "全 {total} 件",
    "pagination.showing": "{start}-{end} を表示",
    "pagination.found": "{count} 件の{type}が見つかりました",
    "pagination.datasets": "データセット",
    "pagination.tasks": "タスク",
    
    // 共通
    "common.all": "すべて",
    "common.search": "検索",
    "common.filter": "フィルター",
    "common.sort": "並び替え",
    "common.newest": "新着順",
    "common.oldest": "古い順",
    "common.loading": "読み込み中...",
    "common.noData": "データがありません",
    "common.confirm": "確認",
    "common.cancel": "キャンセル",
  },
}

// Context
interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Provider
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh-CN")

  const t = (key: string, params?: Record<string, string | number>) => {
    let text = translations[locale][key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v))
      })
    }
    return text
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
