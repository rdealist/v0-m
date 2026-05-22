"use client"

import { useState } from "react"
import { Header, Footer, LevelBadge, DatasetStatusBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Search,
  SlidersHorizontal,
  Upload,
  Database,
  Building2,
  X,
} from "lucide-react"
import Link from "next/link"

// 模拟用户数据
const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  avatar: undefined,
  level: 5,
  verified: true,
}

const mockWallet = {
  balance: 125680,
  locked: 15000,
  change: 2350,
}

// 筛选选项
const primaryModalityOptions = [
  { value: "X射线影像", label: "X射线影像大类 (XRAY)" },
  { value: "计算机断层扫描", label: "计算机断层扫描大类 (CT)" },
  { value: "声学超声影像", label: "声学超声影像大类 (US)" },
  { value: "实验室与特异分子显色", label: "实验室与特异分子显色大类 (LAB)" },
  { value: "磁共振成像", label: "磁共振成像大类 (MR)" },
]
const expandedModalityOptions = [
  { value: "全幅数字病理", label: "全幅数字病理大类 (WSI)" },
  { value: "可见光影像", label: "专科可见光影像 (VL)" },
  { value: "核医学与分子代谢", label: "核医学与分子代谢大类 (NM)" },
  { value: "时序动态视频流媒体", label: "时序动态视频流媒体 (VIDEO)" },
  { value: "其他", label: "其他 (OTH)" },
]
const primarySpecialtyOptions = [
  { value: "呼吸与胸壁", label: "呼吸与胸壁" },
  { value: "神经与颅脑", label: "神经与颅脑" },
  { value: "循环与心血管", label: "循环与心血管" },
  { value: "消化与腹部", label: "消化与腹部" },
  { value: "细胞与分子遗传学", label: "细胞与分子遗传学" },
]
const expandedSpecialtyOptions = [
  { value: "皮肤、体表与感官", label: "皮肤、体表与感官" },
  { value: "视觉与五官系统", label: "眼与视觉五官" },
  { value: "泌尿与内生殖", label: "泌尿与内生殖" },
  { value: "运动与骨关节", label: "运动与骨关节" },
  { value: "生殖医学与胚胎发育", label: "生殖医学与胚胎发育" },
  { value: "其他专科", label: "其他专科 / 综合系统" },
]
const statusOptions = [
  { value: "active", label: "已发布" },
  { value: "pending_audit", label: "待审核" },
]
const sampleRangeOptions = [
  { value: "0-1000", label: "< 1,000" },
  { value: "1000-5000", label: "1,000 - 5,000" },
  { value: "5000-10000", label: "5,000 - 10,000" },
  { value: "10000+", label: "> 10,000" },
]

// 模拟数据集
const mockDatasets = [
  {
    id: "DS001",
    name: "胸部CT肺结节数据集",
    description: "包含12,500例胸部CT影像，标注有肺结节位置与良恶性分类",
    owner: "协和医院影像中心",
    ownerType: "institution" as const,
    ownerLevel: 7,
    modality: "计算机断层扫描",
    specialty: "呼吸与胸壁",
    samples: 12500,
    status: "public" as const,
    price: 5000,
    coverImage: null,
    createdAt: "2026-03-15",
  },
  {
    id: "DS002",
    name: "脑部MRI肿瘤分割数据",
    description: "8,200例脑部MRI影像，包含肿瘤边界分割标注",
    owner: "华西医学影像研究院",
    ownerType: "institution" as const,
    ownerLevel: 8,
    modality: "磁共振成像",
    specialty: "神经与颅脑",
    samples: 8200,
    status: "public" as const,
    price: 8000,
    coverImage: null,
    createdAt: "2026-02-28",
  },
  {
    id: "DS003",
    name: "眼底OCT糖网病变数据",
    description: "15,800例眼底OCT影像，糖尿病视网膜病变分级标注",
    owner: "中山眼科中心",
    ownerType: "institution" as const,
    ownerLevel: 6,
    modality: "可见光影像",
    specialty: "视觉与五官系统",
    samples: 15800,
    status: "public" as const,
    price: 3500,
    coverImage: null,
    createdAt: "2026-04-01",
  },
  {
    id: "DS004",
    name: "胸部X光肺炎检测数据",
    description: "22,000例胸部X光片，包含正常与肺炎分类标注",
    owner: "北京大学人民医院",
    ownerType: "institution" as const,
    ownerLevel: 7,
    modality: "X射线影像",
    specialty: "呼吸与胸壁",
    samples: 22000,
    status: "public" as const,
    price: 4500,
    coverImage: null,
    createdAt: "2026-03-20",
  },
  {
    id: "DS005",
    name: "心脏超声结构分割数据",
    description: "6,500例心脏超声影像，心室心房边界分割",
    owner: "阜外医院",
    ownerType: "institution" as const,
    ownerLevel: 8,
    modality: "声学超声影像",
    specialty: "循环与心血管",
    samples: 6500,
    status: "public" as const,
    price: 6000,
    coverImage: null,
    createdAt: "2026-01-15",
  },
  {
    id: "DS006",
    name: "病理切片乳腺癌分级",
    description: "9,800例乳腺病理切片，恶性程度分级标注",
    owner: "复旦大学附属肿瘤医院",
    ownerType: "institution" as const,
    ownerLevel: 9,
    modality: "全幅数字病理",
    specialty: "呼吸与胸壁",
    samples: 9800,
    status: "public" as const,
    price: 12000,
    coverImage: null,
    createdAt: "2026-04-10",
  },
]

export default function DataMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModality, setSelectedModality] = useState<string>("计算机断层扫描")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("呼吸与胸壁")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedSampleRange, setSelectedSampleRange] = useState<string>("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalityExpanded, setIsModalityExpanded] = useState(false)
  const [isSpecialtyExpanded, setIsSpecialtyExpanded] = useState(false)
  const itemsPerPage = 6

  const hasFilters = selectedModality !== "" || selectedSpecialty !== "" || selectedStatus !== "all" || selectedSampleRange !== "all"

  const clearFilters = () => {
    setSelectedModality("")
    setSelectedSpecialty("")
    setSelectedStatus("all")
    setSelectedSampleRange("all")
    setCurrentPage(1)
  }

  // 过滤数据集
  const filteredDatasets = mockDatasets.filter(dataset => {
    if (searchQuery && !dataset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedModality && dataset.modality !== selectedModality) {
      return false
    }
    if (selectedSpecialty && dataset.specialty !== selectedSpecialty) {
      return false
    }
    if (selectedStatus !== "all" && dataset.status !== selectedStatus) {
      return false
    }
    return true
  })

  // 分页
  const totalPages = Math.ceil(filteredDatasets.length / itemsPerPage)
  const paginatedDatasets = filteredDatasets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        currentPath="/data"
        notificationCount={3}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
        onNotificationClick={() => console.log("Notifications")}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 页面标题区 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">数据广场</h1>
              <p className="mt-1 text-muted-foreground">浏览公开数据资产，发现高质量医学影像数据集</p>
            </div>
            <Button className="bg-[#0F8770] hover:bg-[#0A6655] text-white" asChild>
              <Link href="/data/upload">
                <Upload className="mr-2 h-4 w-4" />
                上传数据集
              </Link>
            </Button>
          </div>

          {/* 统计数据卡片 */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
              <div className="text-[10px] text-slate-400 font-medium">全网影像总量 (DICOM实例)</div>
              <div className="text-lg md:text-xl font-black text-slate-900 font-mono mt-1 flex items-baseline space-x-1">
                <span>52,104,921</span>
                <span className="text-[8px] text-emerald-500 font-bold font-sans">▲ 递增</span>
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
              <div className="text-[10px] text-slate-400 font-medium">已确权资产总例数 (Cases)</div>
              <div className="text-lg md:text-xl font-black text-slate-900 font-mono mt-1">1,245,000</div>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
              <div className="text-[10px] text-slate-400 font-medium">覆盖合作数据节点</div>
              <div className="text-lg md:text-xl font-black text-slate-900 font-mono mt-1">150+ 家</div>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm bg-gradient-to-br from-white to-emerald-50/20">
              <div className="text-[10px] text-emerald-600 font-bold">累计产生要素分红</div>
              <div className="text-lg md:text-xl font-black text-emerald-600 font-mono mt-1">¥ 3,481,920</div>
            </div>
          </section>

          {/* 搜索栏 */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索数据集名称、机构..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新发布</SelectItem>
                <SelectItem value="samples">样本数量</SelectItem>
                <SelectItem value="price-asc">价格从低到高</SelectItem>
                <SelectItem value="price-desc">价格从高到低</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-6">
            {/* 左侧筛选栏 */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    筛选条件
                  </div>
                  {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs px-2">
                      <X className="mr-1 h-3 w-3" />
                      清除
                    </Button>
                  )}
                </div>

                {/* 模态筛选 - 紧凑标签式 */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">成像模态与检查技术</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {primaryModalityOptions.map((modality) => {
                      const isSelected = selectedModality === modality.value
                      return (
                        <button
                          key={modality.value}
                          onClick={() => setSelectedModality(modality.value)}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {modality.label}
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* 展开/收起按钮 */}
                  <button
                    onClick={() => setIsModalityExpanded(!isModalityExpanded)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
                  >
                    {isModalityExpanded ? "[ － 收起专科模态 ]" : "[ ＋ 展开其余 专科模态 ]"}
                  </button>
                  
                  {/* 展开的额外模态选项 */}
                  {isModalityExpanded && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {expandedModalityOptions.map((modality) => {
                        const isSelected = selectedModality === modality.value
                        return (
                          <button
                            key={modality.value}
                            onClick={() => setSelectedModality(modality.value)}
                            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {modality.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 科室筛选 - 紧凑标签式 */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">解剖部位与专科系统</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {primarySpecialtyOptions.map((specialty) => {
                      const isSelected = selectedSpecialty === specialty.value
                      return (
                        <button
                          key={specialty.value}
                          onClick={() => setSelectedSpecialty(specialty.value)}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {specialty.label}
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* 展开/收起按钮 */}
                  <button
                    onClick={() => setIsSpecialtyExpanded(!isSpecialtyExpanded)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-1"
                  >
                    {isSpecialtyExpanded ? "[ － 收起专科系统 ]" : "[ ＋ 展开其余 专科系统 ]"}
                  </button>
                  
                  {/* 展开的额外专科选项 */}
                  {isSpecialtyExpanded && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {expandedSpecialtyOptions.map((specialty) => {
                        const isSelected = selectedSpecialty === specialty.value
                        return (
                          <button
                            key={specialty.value}
                            onClick={() => setSelectedSpecialty(specialty.value)}
                            className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          >
                            {specialty.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 状态和规模 - 平铺气泡 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">状态</Label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedStatus("all")}
                        className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                          selectedStatus === "all"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        全部
                      </button>
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedStatus(option.value)}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                            selectedStatus === option.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">样本规模</Label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSampleRange("all")}
                        className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                          selectedSampleRange === "all"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        全部
                      </button>
                      {sampleRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedSampleRange(option.value)}
                          className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                            selectedSampleRange === option.value
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* 右侧数据集列表 */}
            <div className="flex-1">
              {/* 已选筛选标签 */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedModality && (
                    <Badge variant="secondary" className="gap-1">
                      {primaryModalityOptions.find(m => m.value === selectedModality)?.label || 
                       expandedModalityOptions.find(m => m.value === selectedModality)?.label || 
                       selectedModality}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedModality("")}
                      />
                    </Badge>
                  )}
                  {selectedSpecialty && (
                    <Badge variant="secondary" className="gap-1">
                      {primarySpecialtyOptions.find(s => s.value === selectedSpecialty)?.label || 
                       expandedSpecialtyOptions.find(s => s.value === selectedSpecialty)?.label || 
                       selectedSpecialty}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedSpecialty("")}
                      />
                    </Badge>
                  )}
                </div>
              )}

              {/* 结果计数 */}
              <p className="text-sm text-muted-foreground mb-4">
                共找到 <span className="font-mono font-medium text-foreground">{filteredDatasets.length}</span> 个数据集
                {totalPages > 1 && (
                  <span>，显示第 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredDatasets.length)} 个</span>
                )}
              </p>

              {/* 数据集卡片网格 */}
              {paginatedDatasets.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedDatasets.map((dataset) => (
                    <Card
                      key={dataset.id}
                      className="hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                    >
                      {/* 封面图区域 - 更紧凑 */}
                      <div className="aspect-[2/1] bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
                        <Database className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                      <div className="p-3">
                        {/* 标题和机构 */}
                        <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {dataset.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{dataset.owner}</span>
                          <LevelBadge level={dataset.ownerLevel} size="sm" />
                        </div>
                        
                        {/* 标签 */}
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                            {dataset.modality}
                          </span>
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">
                            {dataset.specialty}
                          </span>
                          <DatasetStatusBadge status={dataset.status} />
                        </div>
                        
                        {/* 底部信息 */}
                        <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            <span className="font-mono font-medium text-foreground">{dataset.samples.toLocaleString()}</span> 样本
                          </span>
                          <span className="font-medium text-[#0F8770]">
                            <span className="font-mono">{dataset.price.toLocaleString()}</span> 积分
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="py-16 text-center">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">未找到匹配的数据集</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      尝试调整筛选条件或搜索关键词
                    </p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      清除筛选条件
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      return null
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
