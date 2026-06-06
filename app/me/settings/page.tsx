"use client"

import { useState } from "react"
import { Header, LevelBadge } from "@/components/m-platform"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Save,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"

// 模拟用户数据
const mockUser = {
  name: "张医生",
  email: "zhang@hospital.com",
  phone: "138****8888",
  avatar: undefined,
  level: 5,
  verified: true,
  institution: "协和医院",
  department: "放射科",
  title: "主治医师",
}

const mockWallet = {
  balance: 125680,
  locked: 15000,
  change: 2350,
}

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    taskUpdate: true,
    auditResult: true,
    walletChange: true,
    systemMessage: true,
    emailNotify: false,
    smsNotify: true,
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        isLoggedIn={true}
        user={mockUser}
        wallet={mockWallet}
        notificationCount={3}
      />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* 返回链接 */}
          <Link
            href="/me"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4" />
            返回个人中心
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">账号设置</h1>
            <p className="mt-1 text-muted-foreground">管理您的账号信息和偏好设置</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-muted/50 p-1 rounded-full">
              <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <User className="mr-2 h-4 w-4" />
                个人信息
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Shield className="mr-2 h-4 w-4" />
                安全设置
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Bell className="mr-2 h-4 w-4" />
                通知设置
              </TabsTrigger>
            </TabsList>

            {/* 个人信息 */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>更新您的个人资料和头像</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 头像 */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={mockUser.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {mockUser.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">更换头像</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        支持 JPG、PNG 格式，文件大小不超过 2MB
                      </p>
                    </div>
                  </div>

                  {/* 表单 */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <Input id="name" defaultValue={mockUser.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">所属机构</Label>
                      <Input id="institution" defaultValue={mockUser.institution} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">科室</Label>
                      <Input id="department" defaultValue={mockUser.department} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">职称</Label>
                      <Select defaultValue={mockUser.title}>
                        <SelectTrigger id="title">
                          <SelectValue placeholder="选择职称" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="住院医师">住院医师</SelectItem>
                          <SelectItem value="主治医师">主治医师</SelectItem>
                          <SelectItem value="副主任医师">副主任医师</SelectItem>
                          <SelectItem value="主任医师">主任医师</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Save className="mr-2 h-4 w-4" />
                      保存修改
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 等级信息 */}
              <Card>
                <CardHeader>
                  <CardTitle>等级与认证</CardTitle>
                  <CardDescription>查看您的当前等级和认证状态</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <LevelBadge level={mockUser.level} size="lg" />
                      <div>
                        <p className="font-medium text-foreground">专家等级</p>
                        <p className="text-sm text-muted-foreground">
                          已解锁审核权限，80%收益分成
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/me/certification">查看认证详情</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 安全设置 */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>登录信息</CardTitle>
                  <CardDescription>管理您的邮箱和手机号码</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">邮箱地址</p>
                        <p className="text-sm text-muted-foreground">{mockUser.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">修改</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">手机号码</p>
                        <p className="text-sm text-muted-foreground">{mockUser.phone}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">修改</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>密码设置</CardTitle>
                  <CardDescription>定期更换密码以保护账号安全</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">当前密码</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="输入当前密码"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">新密码</Label>
                    <Input id="new-password" type="password" placeholder="输入新密码" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">确认新密码</Label>
                    <Input id="confirm-password" type="password" placeholder="再次输入新密码" />
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-primary hover:bg-primary/90">
                      <Lock className="mr-2 h-4 w-4" />
                      更新密码
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 通知设置 */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>消息通知</CardTitle>
                  <CardDescription>选择您希望接收的通知类型</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: "taskUpdate", label: "任务更新", desc: "任务状态变更、新任务推荐" },
                    { key: "auditResult", label: "审核结果", desc: "标注审核通过或驳回通知" },
                    { key: "walletChange", label: "钱包变动", desc: "积分入账、支出提醒" },
                    { key: "systemMessage", label: "系统消息", desc: "平台公告、活动通知" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof typeof notifications]}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>通知渠道</CardTitle>
                  <CardDescription>选择接收通知的方式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">邮件通知</p>
                        <p className="text-xs text-muted-foreground">发送至 {mockUser.email}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNotify}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, emailNotify: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">短信通知</p>
                        <p className="text-xs text-muted-foreground">发送至 {mockUser.phone}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.smsNotify}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, smsNotify: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
