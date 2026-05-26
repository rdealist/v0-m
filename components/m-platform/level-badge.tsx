"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Shield, Star, Award, Crown, User, Sparkles } from "lucide-react"

// 等级配置（L0 + Lv1~Lv9 完整体系）
const levelConfig: Record<
  number,
  {
    label: string
    name: string
    description: string
    color: string
    bgColor: string
    icon: React.ElementType
    permissions: string[]
    canAudit: boolean
  }
> = {
  0: {
    label: "L0",
    name: "游客",
    description: "未登录或未认证用户",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    icon: User,
    permissions: ["浏览首页", "浏览数据广场", "浏览任务广场", "浏览排行榜", "浏览社区"],
    canAudit: false,
  },
  1: {
    label: "Lv1",
    name: "新手",
    description: "刚完成基础认证的用户",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: Star,
    permissions: ["浏览数据", "领取Lv1任务", "社区互动", "标注与提交"],
    canAudit: false,
  },
  2: {
    label: "Lv2",
    name: "初级",
    description: "完成初级认证的用户",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: Star,
    permissions: ["领取Lv2任务", "参与社区讨论", "基础数据访问"],
    canAudit: false,
  },
  3: {
    label: "Lv3",
    name: "中级",
    description: "具备专业标注能力的用户",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: Shield,
    permissions: ["领取Lv3任务", "上传数据集", "发布基础任务"],
    canAudit: false,
  },
  4: {
    label: "Lv4",
    name: "高级",
    description: "经验丰富的标注者",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: Shield,
    permissions: ["领取Lv4任务", "发布进阶任务", "数据定价建议"],
    canAudit: false,
  },
  5: {
    label: "Lv5",
    name: "专家",
    description: "具备审核资格的专家（审核起点）",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: Award,
    permissions: ["审核他人标注", "发布专家任务", "参与质量评定", "80%分成比例"],
    canAudit: true,
  },
  6: {
    label: "Lv6",
    name: "资深专家",
    description: "平台认证的资深专家",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: Award,
    permissions: ["全部审核权限", "制定标注规范", "80%分成比例"],
    canAudit: true,
  },
  7: {
    label: "Lv7",
    name: "权威专家",
    description: "权威领域专家",
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    icon: Crown,
    permissions: ["最高审核权限", "培训其他用户", "80%分成比例"],
    canAudit: true,
  },
  8: {
    label: "Lv8",
    name: "首席专家",
    description: "顶级首席专家",
    color: "text-blue-700",
    bgColor: "bg-blue-700/10",
    icon: Crown,
    permissions: ["最高审核权限", "规范制定", "80%分成比例"],
    canAudit: true,
  },
  9: {
    label: "Lv9",
    name: "顶级专家",
    description: "最高等级种子用户",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Sparkles,
    permissions: ["全部权限", "最高优先级", "100%分成比例"],
    canAudit: true,
  },
}

interface LevelBadgeProps {
  level: number
  className?: string
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
}

export function LevelBadge({
  level,
  className,
  showTooltip = true,
  size = "md",
}: LevelBadgeProps) {
  // 确保等级在有效范围内
  const safeLevel = Math.max(0, Math.min(9, level))
  const config = levelConfig[safeLevel]
  const Icon = config.icon

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0 h-5",
    md: "text-xs px-2 py-0.5 h-6",
    lg: "text-sm px-3 py-1 h-8",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  }

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold gap-1 whitespace-nowrap shadow-sm",
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </Badge>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-3">
          <div className="space-y-2">
            <div>
              <p className="font-semibold">{config.label} {config.name}</p>
              <p className="text-xs text-muted-foreground">
                {config.description}
              </p>
            </div>
            <div className="border-t border-border pt-2">
              <p className="text-xs font-medium mb-1">权限：</p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {config.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-1.5">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      config.canAudit ? "bg-primary" : "bg-primary"
                    )} />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
            {config.canAudit && (
              <div className="pt-1">
                <Badge className="bg-primary text-white text-[10px]">
                  具备审核资格
                </Badge>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// 导出等级配置供其他组件使用
export { levelConfig }
