"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const mockUser = {
  name: "协和医院影像中心",
  email: "imaging@pumch.cn",
  avatar: undefined,
  level: 7,
  verified: true,
}

// 平台服务费率（来自平台配置，前端不硬编码计算逻辑）
const PLATFORM_FEE_RATE = 0.05

export default function TaskPublishPage() {
  // 演示用：余额不足状态切换
  const [insufficientBalance, setInsufficientBalance] = useState(false)

  const [totalSamples, setTotalSamples] = useState("142")
  const [unitPrice, setUnitPrice] = useState("20")

  const { annotationFee, serviceFee, frozenTotal } = useMemo(() => {
    const samples = Number(totalSamples) || 0
    const price = Number(unitPrice) || 0
    const annotation = samples * price
    const service = Math.round(annotation * PLATFORM_FEE_RATE)
    return {
      annotationFee: annotation,
      serviceFee: service,
      frozenTotal: annotation + service,
    }
  }, [totalSamples, unitPrice])

  const availableBalance = insufficientBalance ? 1500 : 15000
  const afterBalance = availableBalance - frozenTotal
  const canPublish = afterBalance >= 0

  return (
    <div className="min-h-screen flex flex-col bg-background pb-24">
      <Header isLoggedIn user={mockUser} wallet={{ balance: availableBalance, locked: 85000 }} notificationCount={2} />

      <main className="flex-1">
        <div className="mx-auto max-w-[800px] px-4 py-8 sm:px-6 lg:px-8">
          {/* 面包屑 */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/tasks">标注任务</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>发布任务</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">发布标注任务</h1>
            {/* 演示开关 */}
            <button
              onClick={() => setInsufficientBalance((v) => !v)}
              className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              {insufficientBalance ? "切换为余额充足" : "预览余额不足状态"}
            </button>
          </div>

          {/* 第一组：基本信息 */}
          <section className="mb-10">
            <h3 className="border-b border-border pb-2 text-base font-semibold text-foreground">基本信息</h3>
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">任务标题 *</Label>
                <Input id="title" defaultValue="胸部 CT 肺结节检测标注" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">任务描述 *</Label>
                <Textarea
                  id="desc"
                  rows={4}
                  defaultValue="对胸部 CT 影像中的肺结节区域进行标注，标记结节位置并判断良恶性分类。"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">截止时间</Label>
                <Input id="deadline" type="date" defaultValue="2026-07-15" className="w-full sm:w-56" />
              </div>
            </div>
          </section>

          {/* 第二组：数据与标注配置 */}
          <section className="mb-10">
            <h3 className="border-b border-border pb-2 text-base font-semibold text-foreground">数据与标注配置</h3>
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <Label>选择数据集</Label>
                <Select defaultValue="ds001">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ds001">胸部 CT 标注集 - 肺结节检测（142 个可用样本）</SelectItem>
                    <SelectItem value="ds003">眼底影像糖网病变分级集（15,800 个可用样本）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>标注协议模板</Label>
                <Select defaultValue="nodule">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nodule">肺结节标注协议 v2</SelectItem>
                    <SelectItem value="seg">通用分割标注协议</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">标注协议为软约束，不限制工具使用</p>
              </div>
              <div className="space-y-2">
                <Label>验收规则模板</Label>
                <Select defaultValue="double">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="double">双人交叉验收</SelectItem>
                    <SelectItem value="expert">专家抽检验收</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* 第三组：参与配置 */}
          <section className="mb-10">
            <h3 className="border-b border-border pb-2 text-base font-semibold text-foreground">参与配置</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">最大参与人数</Label>
                <Input id="maxParticipants" type="number" defaultValue="15" />
              </div>
              <div className="space-y-2">
                <Label>最低等级要求</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Lv1</SelectItem>
                    <SelectItem value="2">Lv2</SelectItem>
                    <SelectItem value="3">Lv3</SelectItem>
                    <SelectItem value="4">Lv4</SelectItem>
                    <SelectItem value="5">Lv5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSamples">总样本数</Label>
                <Input
                  id="totalSamples"
                  type="number"
                  value={totalSamples}
                  onChange={(e) => setTotalSamples(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">单位基准价格</Label>
                <div className="relative">
                  <Input
                    id="unitPrice"
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="pr-20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    积分/样本
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 第四组：费用确认（视觉焦点） */}
          <section className="mb-6">
            <div className="rounded-lg bg-muted/60 p-6">
              <h3 className="text-base font-semibold text-foreground">费用确认</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">总样本数</dt>
                  <dd className="font-mono text-foreground">{Number(totalSamples).toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">单位基准价格</dt>
                  <dd className="font-mono text-foreground">{Number(unitPrice).toLocaleString()} 积分</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">标注总费用</dt>
                  <dd className="font-mono text-foreground">{annotationFee.toLocaleString()} 积分</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">
                    平台服务费（{PLATFORM_FEE_RATE * 100}%）
                    <span className="ml-2 text-xs text-muted-foreground/70">费率来自平台配置</span>
                  </dt>
                  <dd className="font-mono text-foreground">{serviceFee.toLocaleString()} 积分</dd>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <dt className="font-semibold text-foreground">冻结总额</dt>
                  <dd className="font-mono text-lg font-bold text-foreground">
                    {frozenTotal.toLocaleString()} 积分
                  </dd>
                </div>
              </dl>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">当前可用余额</span>
                  <span className="font-mono text-foreground">{availableBalance.toLocaleString()} 积分</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">冻结后可用余额</span>
                  <span
                    className={cn(
                      "flex items-center gap-1 font-mono font-medium",
                      canPublish ? "text-primary" : "text-destructive"
                    )}
                  >
                    <ArrowDown className="h-4 w-4" />
                    {afterBalance.toLocaleString()} 积分
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 底部固定操作栏 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
        <div className="mx-auto flex max-w-[800px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Button variant="outline">保存草稿</Button>
          <div className="flex items-center gap-3">
            {!canPublish && (
              <span className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
                可用余额不足，请先充值
              </span>
            )}
            <Button disabled={!canPublish}>发布任务</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
