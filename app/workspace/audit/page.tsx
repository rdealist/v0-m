"use client"

import { useState } from "react"
import { LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Info,
  Image as ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// 模拟审核队列
const mockAuditQueue = [
  {
    id: "A001",
    taskTitle: "肺结节良恶性标注",
    submitter: "李医生",
    submitterLevel: 3,
    submittedAt: "2026-05-19 14:30",
    casesCount: 50,
    status: "pending",
  },
  {
    id: "A002",
    taskTitle: "视网膜病变分级标注",
    submitter: "王医生",
    submitterLevel: 2,
    submittedAt: "2026-05-19 10:15",
    casesCount: 80,
    status: "pending",
  },
  {
    id: "A003",
    taskTitle: "脑部肿瘤边界分割",
    submitter: "陈医生",
    submitterLevel: 4,
    submittedAt: "2026-05-18 16:45",
    casesCount: 30,
    status: "pending",
  },
]

// 当前审核的案例
const currentSubmission = {
  ...mockAuditQueue[0],
  pricePerCase: 4,
  totalReward: 200,
  platformFee: 10,
  submitterShare: 120, // 60% for Lv3
}

export default function AuditWorkspacePage() {
  const [selectedSubmission, setSelectedSubmission] = useState(mockAuditQueue[0])
  const [zoom, setZoom] = useState(100)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [rejectReason, setRejectReason] = useState("")
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleResetZoom = () => setZoom(100)

  const handleApprove = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setShowApproveConfirm(false)
      // 模拟审核通过
    }, 1500)
  }

  const handleReject = () => {
    if (!rejectReason.trim()) return
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setShowRejectConfirm(false)
      setRejectReason("")
      // 模拟审核驳回
    }, 1500)
  }

  return (
    <div className="h-screen flex flex-col bg-[#0D1117] text-[#E6EDF3]">
      {/* 顶部栏 */}
      <header className="h-14 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/tasks" 
            className="flex items-center gap-1 text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回任务
          </Link>
          <div className="h-4 w-px bg-[#30363D]" />
          <h1 className="font-medium">审核工作台</h1>
          <Badge className="bg-[#4A9AD8]/10 text-[#4A9AD8] border-[#4A9AD8]/30">
            Lv5+ 专家
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#8B949E]">待审核队列</span>
          <Badge className="bg-[#E3B341]/10 text-[#E3B341] border-[#E3B341]/30 font-mono">
            {mockAuditQueue.length}
          </Badge>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 - 审核队列 */}
        <aside className="w-80 border-r border-[#30363D] bg-[#161B22] flex flex-col">
          <div className="p-4 border-b border-[#30363D]">
            <h3 className="font-medium">审核队列</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {mockAuditQueue.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSubmission(item)}
                  className={cn(
                    "w-full p-3 rounded-lg border text-left transition-colors",
                    selectedSubmission.id === item.id
                      ? "border-[#4A9AD8] bg-[#4A9AD8]/10"
                      : "border-[#30363D] bg-[#21262D] hover:border-[#8B949E]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-sm truncate flex-1">
                      {item.taskTitle}
                    </span>
                    <Badge className="bg-[#E3B341]/10 text-[#E3B341] border-[#E3B341]/30 text-xs shrink-0">
                      待审核
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8B949E]">
                    <span>{item.submitter}</span>
                    <LevelBadge level={item.submitterLevel} size="sm" showTooltip={false} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-[#8B949E]">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.submittedAt}
                    </div>
                    <span className="font-mono">{item.casesCount} 例</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* 中央 - 标注结果预览 */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* 工具栏 */}
          <div className="h-12 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]",
                  showAnnotations && "bg-[#21262D] text-[#4A9AD8]"
                )}
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? (
                  <Eye className="h-4 w-4 mr-1.5" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-1.5" />
                )}
                {showAnnotations ? "显示标注" : "隐藏标注"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-mono w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                onClick={handleResetZoom}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 影像查看区域 */}
          <div className="flex-1 relative bg-[#0D1117] flex items-center justify-center overflow-hidden">
            <div 
              className="relative border border-[#30363D] rounded-lg bg-[#161B22] flex items-center justify-center"
              style={{ 
                width: `${480 * zoom / 100}px`, 
                height: `${480 * zoom / 100}px`,
                transition: "all 0.2s ease"
              }}
            >
              <div className="text-center text-[#8B949E]">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">标注结果预览</p>
                <p className="text-xs mt-1">{selectedSubmission.taskTitle}</p>
              </div>
              
              {/* 模拟标注叠加 */}
              {showAnnotations && (
                <>
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-[#2EA88A] rounded bg-[#2EA88A]/10">
                    <div className="absolute -top-5 left-0 text-xs text-[#2EA88A] bg-[#2EA88A]/20 px-1.5 py-0.5 rounded">
                      良性
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-[#F85149] rounded bg-[#F85149]/10">
                    <div className="absolute -top-5 left-0 text-xs text-[#F85149] bg-[#F85149]/20 px-1.5 py-0.5 rounded">
                      恶性
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        {/* 右侧边栏 - 审核决策 */}
        <aside className="w-80 border-l border-[#30363D] bg-[#161B22] flex flex-col">
          {/* 提交信息 */}
          <div className="p-4 border-b border-[#30363D]">
            <h3 className="font-medium mb-4">提交信息</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#8B949E]">提交人</span>
                <div className="flex items-center gap-2">
                  <span>{currentSubmission.submitter}</span>
                  <LevelBadge level={currentSubmission.submitterLevel} size="sm" showTooltip={false} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B949E]">提交时间</span>
                <span>{currentSubmission.submittedAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8B949E]">案例数量</span>
                <span className="font-mono">{currentSubmission.casesCount} 例</span>
              </div>
            </div>
          </div>

          {/* 账本变化预览 */}
          <div className="p-4 border-b border-[#30363D]">
            <h3 className="font-medium mb-4">审核后果预览</h3>
            
            {/* 批准后果 */}
            <div className="mb-4 p-3 rounded-lg bg-[#2EA88A]/10 border border-[#2EA88A]/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-[#2EA88A]" />
                <span className="text-sm font-medium text-[#2EA88A]">若批准</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#8B949E]">
                  <span>标注者获得</span>
                  <span className="font-mono text-[#2EA88A]">+{currentSubmission.submitterShare} 积分</span>
                </div>
                <div className="flex items-center justify-between text-[#8B949E]">
                  <span>平台服务费</span>
                  <span className="font-mono">{currentSubmission.platformFee} 积分</span>
                </div>
              </div>
            </div>

            {/* 驳回后果 */}
            <div className="p-3 rounded-lg bg-[#F85149]/10 border border-[#F85149]/30">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-[#F85149]" />
                <span className="text-sm font-medium text-[#F85149]">若驳回</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#8B949E]">
                <p>标注者「审查中收益」清零</p>
                <p>预存资金退回发布方</p>
              </div>
            </div>
          </div>

          {/* 审核按钮 */}
          <div className="p-4 mt-auto space-y-3">
            <Button
              className="w-full bg-[#2EA88A] hover:bg-[#238636] text-white h-11"
              onClick={() => setShowApproveConfirm(true)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              批准
            </Button>
            <Button
              variant="outline"
              className="w-full border-[#F85149] text-[#F85149] hover:bg-[#F85149]/10 h-11"
              onClick={() => setShowRejectConfirm(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              驳回
            </Button>
          </div>
        </aside>
      </div>

      {/* 批准确认弹窗 */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-[#161B22] border-[#30363D]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2EA88A]/10">
                    <CheckCircle2 className="h-5 w-5 text-[#2EA88A]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E6EDF3]">确认批准</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                  onClick={() => setShowApproveConfirm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3 text-sm mb-6">
                <p className="text-[#8B949E]">批准后将发生以下变化：</p>
                <div className="p-3 rounded-lg bg-[#21262D] border border-[#30363D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B949E]">{currentSubmission.submitter} 获得</span>
                    <span className="font-mono text-[#2EA88A]">+{currentSubmission.submitterShare} 积分</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B949E]">状态变化</span>
                    <span className="text-[#E6EDF3]">审查中 → 可用余额</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#E3B341]/10 border border-[#E3B341]/30">
                  <AlertTriangle className="h-4 w-4 text-[#E3B341] flex-shrink-0 mt-0.5" />
                  <p className="text-[#8B949E]">此操作不可撤销，请确认标注质量符合要求。</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#30363D] text-[#E6EDF3] hover:bg-[#21262D]"
                  onClick={() => setShowApproveConfirm(false)}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-[#2EA88A] hover:bg-[#238636] text-white"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    "确认批准"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 驳回确认弹窗 */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 bg-[#161B22] border-[#30363D]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F85149]/10">
                    <XCircle className="h-5 w-5 text-[#F85149]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#E6EDF3]">确认驳回</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D]"
                  onClick={() => setShowRejectConfirm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4 text-sm mb-6">
                <div>
                  <label className="text-[#8B949E] block mb-2">驳回原因 *</label>
                  <Textarea
                    placeholder="请填写驳回原因，帮助标注者改进..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="h-24 bg-[#21262D] border-[#30363D] text-[#E6EDF3] placeholder:text-[#8B949E] resize-none"
                  />
                </div>
                <div className="p-3 rounded-lg bg-[#F85149]/10 border border-[#F85149]/30 space-y-2">
                  <p className="text-[#8B949E]">驳回后将发生以下变化：</p>
                  <ul className="text-[#8B949E] space-y-1 text-xs">
                    <li>• 标注者「审查中收益」清零</li>
                    <li>• 预存资金将退还给发布方</li>
                    <li>• 标注者将收到驳回通知</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#30363D] text-[#E6EDF3] hover:bg-[#21262D]"
                  onClick={() => setShowRejectConfirm(false)}
                >
                  取消
                </Button>
                <Button
                  className="flex-1 bg-[#F85149] hover:bg-[#da3633] text-white"
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    "确认驳回"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
