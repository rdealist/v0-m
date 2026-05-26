"use client"

import { useState } from "react"
import { Header } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Gift,
  MessageSquare,
  FileCheck,
  Coins,
  Check,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock用户数据
const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  avatar: "",
  level: 5,
  verified: true,
}

const mockWallet = {
  balance: 12580,
  locked: 3200,
  change: 580,
}

// 通知类型配置
const notificationTypeConfig = {
  system: {
    icon: Bell,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "系统通知",
  },
  task: {
    icon: FileCheck,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    label: "任务通知",
  },
  audit: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "审核通知",
  },
  reward: {
    icon: Coins,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "奖励通知",
  },
  comment: {
    icon: MessageSquare,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "评论通知",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "警告通知",
  },
}

type NotificationType = keyof typeof notificationTypeConfig

interface Notification {
  id: string
  type: NotificationType
  title: string
  content: string
  time: string
  read: boolean
  link?: string
}

// Mock通知数据
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "reward",
    title: "标注奖励已发放",
    content: "您完成的「肺结节良恶性标注」任务奖励 +250 积分已到账",
    time: "5分钟前",
    read: false,
    link: "/me/assets",
  },
  {
    id: "2",
    type: "audit",
    title: "标注审核通过",
    content: "您提交的「脑部MRI肿瘤分割」标注已通过 Lv6 专家审核",
    time: "1小时前",
    read: false,
    link: "/workspace/annotation",
  },
  {
    id: "3",
    type: "task",
    title: "新任务可领取",
    content: "符合您等级的新任务「眼底OCT糖网病变标注」已发布，奖励 800 积分",
    time: "2小时前",
    read: false,
    link: "/tasks",
  },
  {
    id: "4",
    type: "system",
    title: "等级提升",
    content: "恭喜！您已升级至 Lv5，解锁审核权限",
    time: "1天前",
    read: true,
    link: "/me/certification",
  },
  {
    id: "5",
    type: "comment",
    title: "收到新评论",
    content: "用户「李教授」评论了您的社区帖子：非常专业的分析...",
    time: "2天前",
    read: true,
    link: "/community",
  },
  {
    id: "6",
    type: "alert",
    title: "任务即将截止",
    content: "您领取的「胸部CT肺结节数据集」标注任务将于明天截止，请尽快完成",
    time: "3天前",
    read: true,
    link: "/workspace/annotation",
  },
  {
    id: "7",
    type: "reward",
    title: "审核奖励已发放",
    content: "您完成的审核任务奖励 +120 积分已到账",
    time: "5天前",
    read: true,
    link: "/me/assets",
  },
  {
    id: "8",
    type: "system",
    title: "平台维护通知",
    content: "平台将于本周六 02:00-06:00 进行系统维护，届时部分功能可能暂时不可用",
    time: "1周前",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !n.read
    return n.type === activeTab
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read))
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={unreadCount}
        onNavigate={(path) => console.log("Navigate to:", path)}
        onLogout={() => console.log("Logout")}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">消息中心</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount > 0
                  ? `您有 ${unreadCount} 条未读消息`
                  : "暂无未读消息"}
              </p>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  全部已读
                </Button>
              )}
              {notifications.some((n) => n.read) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllRead}
                  className="text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  清除已读
                </Button>
              )}
            </div>
          </div>

          {/* 通知列表 */}
          <Card>
            <CardHeader className="pb-3">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid lg:grid-cols-7">
                  <TabsTrigger value="all" className="relative">
                    全部
                    {notifications.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1.5 h-5 px-1.5 text-xs"
                      >
                        {notifications.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="relative">
                    未读
                    {unreadCount > 0 && (
                      <Badge className="ml-1.5 h-5 px-1.5 text-xs bg-destructive">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="system">系统</TabsTrigger>
                  <TabsTrigger value="task">任务</TabsTrigger>
                  <TabsTrigger value="audit" className="hidden lg:flex">
                    审核
                  </TabsTrigger>
                  <TabsTrigger value="reward" className="hidden lg:flex">
                    奖励
                  </TabsTrigger>
                  <TabsTrigger value="comment" className="hidden lg:flex">
                    评论
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {filteredNotifications.map((notification) => {
                    const config = notificationTypeConfig[notification.type]
                    const IconComponent = config.icon

                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex gap-4 p-4 transition-colors hover:bg-muted/30",
                          !notification.read && "bg-accent/30"
                        )}
                      >
                        {/* 图标 */}
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            config.bgColor
                          )}
                        >
                          <IconComponent
                            className={cn("h-5 w-5", config.color)}
                          />
                        </div>

                        {/* 内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  !notification.read
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {notification.content}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {notification.time}
                              </p>
                            </div>

                            {/* 操作 */}
                            <div className="flex items-center gap-1 shrink-0">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">标记已读</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">删除</span>
                              </Button>
                            </div>
                          </div>

                          {/* 查看链接 */}
                          {notification.link && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 mt-2 text-primary"
                              asChild
                            >
                              <a href={notification.link}>查看详情 &rarr;</a>
                            </Button>
                          )}
                        </div>

                        {/* 未读标记 */}
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">
                    暂无消息
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeTab === "unread"
                      ? "所有消息都已读"
                      : "当前分类下没有消息"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
