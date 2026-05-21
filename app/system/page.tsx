import { Header, Footer } from "@/components/m-platform"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { demoUsers, listOpenTasks, listPublicDatasets, walletSummary } from "@/lib/platform/services"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SystemStatusPage() {
  const [datasets, tasks, wallet] = await Promise.all([
    listPublicDatasets(),
    listOpenTasks(),
    walletSummary(demoUsers.institution),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isLoggedIn={false} currentPath="/system" />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge className="mb-3 bg-[#0F8770]/10 text-[#0F8770] border-[#0F8770]/30">Local Runtime Closure</Badge>
            <h1 className="text-3xl font-bold tracking-tight">本地 MVP 闭环状态</h1>
            <p className="mt-2 text-muted-foreground">
              Docker PostgreSQL、Drizzle 迁移、种子数据、核心任务/钱包闭环已接入真实数据库。
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link href="/data">查看数据广场</Link></Button>
            <Button asChild><Link href="/tasks">查看任务广场</Link></Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>公开数据集</CardTitle>
              <CardDescription>来自 PostgreSQL 的公开 metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{datasets.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">{datasets[0]?.name ?? "暂无数据"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>开放任务</CardTitle>
              <CardDescription>含锁仓和领取容量</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{tasks.length}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {tasks[0] ? `${tasks[0].claimedCount}/${tasks[0].maxClaims} 已领取` : "暂无任务"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>机构钱包</CardTitle>
              <CardDescription>append-only ledger 计算值</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{wallet.available.toLocaleString()}</p>
              <p className="mt-2 text-sm text-muted-foreground">锁仓 {wallet.locked.toLocaleString()} 积分</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>可用本地命令</CardTitle>
            <CardDescription>明早继续开发/验收时可直接运行</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">{`docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
pnpm dev
curl http://localhost:3000/api/health`}</pre>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
