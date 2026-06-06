"use client"

import { useState } from "react"
import { Header, DatasetStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
  Upload,
  FileImage,
  Layers,
  Plus,
  Database,
  ClipboardList,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"

const mockUser = {
  name: "协和影像中心",
  email: "imaging@pumch.cn",
  level: 6,
  verified: true,
}

const mockWallet = { balance: 325680, locked: 45000, change: 5350 }

// 我上传的数据集
const myDatasets = [
  {
    id: "DS001",
    name: "胸部CT肺结节数据集",
    modality: "计算机断层扫描 (CT)",
    feature: "病灶检测",
    samples: 12500,
    availableSamples: 12500,
    format: "DICOM",
    status: "public" as const,
    createdAt: "2026-03-15",
    relatedTasks: 2,
  },
  {
    id: "DS007",
    name: "脑部MRI肿瘤数据集",
    modality: "磁共振成像 (MR)",
    feature: "区域分割",
    samples: 8600,
    availableSamples: 6200,
    format: "NIfTI",
    status: "private" as const,
    createdAt: "2026-04-02",
    relatedTasks: 1,
  },
  {
    id: "DS012",
    name: "病理切片HE染色数据集",
    modality: "全幅数字病理 (WSI)",
    feature: "细胞分类",
    samples: 3400,
    availableSamples: 0,
    format: "SVS",
    status: "processing" as const,
    createdAt: "2026-05-20",
    relatedTasks: 0,
  },
]

const filterTabs = [
  { key: "all", label: "全部" },
  { key: "public", label: "已公开" },
  { key: "private", label: "私有" },
  { key: "processing", label: "处理中" },
]

export default function MyDataPage() {
  const [activeFilter, setActiveFilter] = useState("all")

  const filtered = myDatasets.filter((d) =>
    activeFilter === "all" ? true : d.status === activeFilter
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn user={mockUser} wallet={mockWallet} notificationCount={3} />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 面包屑 */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/me">个人中心</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>我的数据集</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* 标题区 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">我的数据集</h1>
              <p className="mt-1 text-muted-foreground">管理你上传的影像数据资产</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
              <Link href="/data/upload">
                <Upload className="mr-2 h-4 w-4" />
                上传数据集
              </Link>
            </Button>
          </div>

          {/* 概览统计 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Database className="h-4 w-4" />
                  <span className="text-xs">数据集总数</span>
                </div>
                <p className="text-xl font-bold font-mono text-foreground">{myDatasets.length}</p>
              </CardContent>
            </Card>
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileImage className="h-4 w-4" />
                  <span className="text-xs">样本总量</span>
                </div>
                <p className="text-xl font-bold font-mono text-foreground">
                  {myDatasets.reduce((s, d) => s + d.samples, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ClipboardList className="h-4 w-4" />
                  <span className="text-xs">关联任务</span>
                </div>
                <p className="text-xl font-bold font-mono text-foreground">
                  {myDatasets.reduce((s, d) => s + d.relatedTasks, 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 筛选 Tab */}
          <div className="flex gap-1 mb-6 p-1 bg-muted/50 rounded-full w-fit">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  activeFilter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 数据集列表 */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((dataset) => (
                <Card key={dataset.id} className="border border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Link href={`/data/${dataset.id}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                            {dataset.name}
                          </Link>
                          <DatasetStatusBadge status={dataset.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">{dataset.modality}</Badge>
                          <Badge variant="outline" className="text-xs">{dataset.feature}</Badge>
                          <Badge variant="outline" className="text-xs">{dataset.format}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <FileImage className="h-3.5 w-3.5" />
                            可用 <span className="font-mono text-foreground">{dataset.availableSamples.toLocaleString()}</span> / {dataset.samples.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5" />
                            {dataset.relatedTasks} 个关联任务
                          </span>
                          <span>上传于 {dataset.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {dataset.status !== "processing" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/tasks/new">
                              <Plus className="h-4 w-4 mr-1" />
                              发布任务
                            </Link>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">更多操作</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Database className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">该分类下暂无数据集</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90 text-white" asChild>
                  <Link href="/data/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    上传第一个数据集
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
