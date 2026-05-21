# 医学影像标注平台 — 并发扩容架构设计

> 基于现有 v0 原型（Next.js + 全 mock 数据），分析从上线到 10k 并发的完整演进路径。

---

## 业务背景

**平台类型**：医学影像标注众包平台

**核心业务闭环**：
```
机构上传 DICOM 数据 → 发布数据集 → 发布任务（锁仓积分）
→ 标注医生领取任务 → 完成标注提交 → Lv5+ 专家审核
→ 审核通过 → 积分自动结算释放
```

**用户角色**：
- 标注者（Lv1-Lv4）：领取并完成标注任务
- 专家（Lv5-Lv9）：审核标注结果，解锁结算
- 机构：上传数据集、发布任务、锁仓积分
- 管理员：平台治理、资质核验

---

## 核心原则

```
100 → 1000 并发：量变（水平扩容 + 少量关键组件替换）
1000 → 10000 并发：质变（架构模式改变）

不变的永远是：Next.js 前端代码、业务 API 逻辑、DICOM 存储方式、Cornerstone3D
变的是：数据层访问模式、事件处理模型、服务边界
```

---

## 第一阶段：上线基础（0 → 100 并发）

### 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 前端 | Next.js 15 + React 19 + shadcn/ui | 保留现有原型代码 |
| 服务端状态 | TanStack Query | 替换所有 mock 数据 |
| 客户端状态 | Zustand | 标注工作台复杂本地状态 |
| 认证 | Better Auth | 支持邮箱/手机、角色权限、JWT |
| ORM | Drizzle ORM | TypeScript-first，与 PgBouncer 兼容好 |
| 数据库 | PostgreSQL（直连） | ACID 事务，积分钱包强一致性必选 |
| 缓存 | Redis 单机 | 会话、分布式锁、排行榜 ZSet |
| 文件存储 | 阿里云 OSS | DICOM 文件直传，不经过应用服务器 |
| DICOM 处理 | Python Worker（pydicom + SimpleITK） | 格式转换、缩略图生成 |
| 医学影像查看 | Cornerstone3D | 浏览器端渲染，不占用服务器 |
| 实时推送 | SSE（Server-Sent Events） | 标注进度、通知推送 |

### 必须实现的功能模块（原型中全部 mock，需从零实现）

1. **认证与角色体系** — 注册、邮箱验证、机构认证审核、Lv 晋升逻辑
2. **数据库 Schema** — 见下方核心表设计
3. **DICOM 文件上传流程** — 前端预签名直传 OSS → 回调触发 Worker 预处理
4. **积分钱包事务** — 锁仓、释放、结算，必须原子操作
5. **任务领取并发控制** — 防止超额领取
6. **标注工作台** — Cornerstone3D 集成，自动保存，最大工程量
7. **审核工作台** — 原始影像 + 标注叠加显示，通过/拒绝操作

### 核心数据库 Schema

```sql
users           -- 用户基础信息、level、verified
institutions    -- 机构信息、营业执照
datasets        -- 数据集元数据（文件在 OSS）
tasks           -- 标注任务（关联 dataset，含锁仓金额）
task_claims     -- 任务领取记录（annotator + task + progress）
annotations     -- 具体标注结果（JSONB 存储标注数据）
audits          -- 审核记录（expert + annotation + result）
wallet_txns     -- 积分账本（每笔操作一条记录，余额 = SUM(amount)）
notifications   -- 通知
```

**钱包设计原则**：不存余额字段，存每笔交易，余额用 SUM 计算。避免并发更新余额字段的竞争条件。

### 积分事务示例

```typescript
// 任务发布时（锁仓）
await db.transaction(async (tx) => {
  await tx.insert(walletTxns).values({ userId, amount: -5250, type: 'lock' });
  await tx.insert(tasks).values({ publisherId: userId, lockedAmount: 5250, ... });
});

// 审核通过时（结算）
await db.transaction(async (tx) => {
  await tx.insert(walletTxns).values({ userId: annotatorId, amount: +5000, type: 'reward' });
  await tx.insert(walletTxns).values({ userId: expertId, amount: +250, type: 'audit_fee' });
  await tx.update(tasks).set({ status: 'completed' }).where(eq(tasks.id, taskId));
});
```

### DICOM 文件上传流程

```
前端请求预签名 URL  →  POST /api/datasets/upload-url
前端直传 OSS（不经过 Next.js server）
OSS 上传完成 Callback  →  POST /api/datasets/upload-complete
触发 DICOM 预处理 Worker（生成缩略图、提取 DICOM metadata）
数据集状态：pending → ready
```

**合规要求**：上传时强制执行 DICOM Anonymization（去除患者姓名、ID、出生日期等 PHI 字段），满足《个人信息保护法》要求。

### 部署方案

```
Vercel（Next.js）+ 阿里云 RDS PostgreSQL + Upstash Redis + 阿里云 OSS
```

成本：约 ¥2000-4000/月

---

## 第二阶段：规模化（100 → 1000 并发）

### 变化原则

> 100 → 1000 是**水平扩容**，架构不变，增加几个关键组件。

### 100 并发触发的结构性瓶颈

#### 瓶颈 1：PostgreSQL 直连崩溃

PostgreSQL 每连接消耗 5-10MB RAM，`max_connections` 默认 100。1000 并发直连必崩。

**解法：PgBouncer（连接池，事务模式）**

```
1000 并发应用请求
       ↓
PgBouncer（事务模式）
对外承接 1000 连接，对数据库只保持 20-50 个真实连接
       ↓
PostgreSQL Primary（写）+ Read Replica（读）
```

#### 瓶颈 2：WebSocket 无法横向扩展

Next.js WebSocket 连接绑定单进程。水平扩展到 3 台实例后，不同实例上的用户无法互通状态。

**解法：独立 Go WebSocket 服务 + Redis Pub/Sub 作为消息总线**

```
标注用户 A ──WebSocket──→ Go 实时服务（单进程可承载 50k+ 连接）
标注用户 B ──WebSocket──┘         │
                                Redis Pub/Sub（跨实例广播）
                                         │
                               异步写入 PostgreSQL
```

选 Go 而非 Node.js 的原因：goroutine 模型天然适合大量长连接，1 台 4C8G 的 Go 服务可稳定维持 5 万以上 WebSocket 连接，同等 Node.js 需要 3-4 台且存在事件循环阻塞风险。

#### 瓶颈 3：DICOM 大文件不能经过应用服务器

每张 CT 序列 50-500MB，1000 人并发加载会打满应用服务器网卡。

**解法：所有文件传输走 OSS + CDN，应用服务器只签发临时 URL**

```
Next.js API 生成带权限绑定的预签名 URL（有效期 1 小时）
前端直连 OSS CDN 下载文件
Cornerstone3D 在浏览器端渲染（计算在客户端）
应用服务器完全不参与文件传输
```

#### 瓶颈 4：任务领取并发写冲突

**解法：Redis 分布式锁 + PostgreSQL 行锁双保险**

```typescript
// 先获取 Redis 锁（5 秒超时，防止单用户重复提交）
const lock = await redis.set(`lock:task:${taskId}`, userId, 'NX', 'EX', 5);
if (!lock) return { error: '请重试' };

// 数据库内用行锁保证最终一致
await db.transaction(async (tx) => {
  const task = await tx
    .select().from(tasks)
    .where(eq(tasks.id, taskId))
    .for('update');  // 行级锁

  if (task[0].claimedCount >= task[0].maxClaims) throw Error('名额已满');
  await tx.insert(taskClaims).values({ taskId, userId });
  await tx.update(tasks).set({ claimedCount: task[0].claimedCount + 1 });
});
```

### 1000 并发架构图

```
                    ┌──────────────────────┐
                    │   CDN（DICOM缩略图    │
                    │   + 静态资源）        │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Nginx / 阿里云 SLB  │
                    └──────┬───────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Next.js ×3   Go WS ×2    Python Workers ×2
        (HTTP API)  (WebSocket)  (DICOM 预处理)

              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │ Redis Sentinel│  主从 + 哨兵 HA
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  PgBouncer  │  连接池
                    └──────┬──────┘
                           │
                    ┌──────▼──────────────┐
                    │  PostgreSQL          │
                    │  Primary + 1 只读   │
                    └─────────────────────┘

文件层：前端 ←直连← 阿里云 OSS + CDN
```

### 组件变化对比

| 组件 | 100 并发 | 1000 并发 |
|------|---------|---------|
| Next.js | 单实例 | 3 实例 |
| 实时层 | SSE | Go WebSocket 服务 ×2 |
| PostgreSQL | 直连 | PgBouncer + 1 只读副本 |
| Redis | 单机 | Sentinel（主从 HA） |
| 部署 | Vercel / 单机 | ECS 弹性伸缩组 |

成本：约 ¥10,000-12,000/月

---

## 第三阶段：大规模（1000 → 10000 并发）

### 变化原则

> 1000 → 10000 是**质变**，不是再多加几台机器，而是几个特定位置出现结构性摩擦，需要改变架构模式。

### 10k 并发的真实压力分布

```
~4000 人   在标注工作台（WebSocket 长连接）
           每人每 30 秒保存一次 = ~133 writes/sec
~2000 人   并发浏览数据广场 → 同一批热门数据集反复被请求（热键）
~2000 人   并发浏览任务广场
~1000 人   在审核工作台
~1000 人   上传 DICOM / 其他

热门任务被 500 人同时查看 → 同一 Redis 键每秒被打 500 次
排行榜每分钟被刷新 10000 次
通知系统每秒产生数千条事件
```

### 四个结构性摩擦点

#### 摩擦 1：Redis 热键 → 升级为 Redis Cluster

**问题**：热门任务/数据集对应的 Redis 键被每秒打几百次，单节点 Redis 单线程处理，CPU 被单个热键打满。

Redis Sentinel 解决的是**高可用**（主挂了自动切换）。
Redis Cluster 解决的是**单键热点**（数据按 hash slot 分布到多个主节点）。

```
Redis Cluster 分片设计：
  slot 0-5460     → 节点 A（数据广场缓存）
  slot 5461-10922 → 节点 B（任务广场、排行榜）
  slot 10923-16383 → 节点 C（会话、分布式锁）
```

同时引入**进程内 LRU 二级缓存**，超热读不再走 Redis：

```typescript
const localCache = new LRUCache({ max: 1000, ttl: 10_000 }); // 10s 本地缓存

async function getHotDatasets() {
  const local = localCache.get('hot_datasets');
  if (local) return local;                      // L1：进程内，0 网络开销

  const cached = await redis.get('hot_datasets');
  if (cached) {
    localCache.set('hot_datasets', JSON.parse(cached));
    return JSON.parse(cached);                  // L2：Redis
  }

  const data = await queryDB();                 // L3：数据库（最慢）
  await redis.setex('hot_datasets', 60, JSON.stringify(data));
  localCache.set('hot_datasets', data);
  return data;
}
```

#### 摩擦 2：通知/事件扇出 → Redis Stream 替换为 Kafka

**问题**：1 个热门任务状态变更需扇出 800 条通知；积分结算事件不能丢失；Redis Pub/Sub 无持久化，消费者宕机即丢消息。

```
Redis Stream（1000并发）          Kafka Cluster（10k并发）
无持久化，消息丢失不可恢复   →    磁盘持久化，消费失败可重放
单线程，高扇出时延迟高            分区并行消费，扇出线性扩展
```

**Kafka Topic 设计**：

```
annotation.events      高频，标注操作，允许少量丢失
task.state-changes     中频，任务状态，需持久化
wallet.transactions    低频，积分事务，强一致性
notifications.outbox   通知发件箱，需保序
```

**积分结算用 Outbox Pattern 保障不丢失**：

```
审核通过 → 数据库事务内同时写：
  ├── audits 表（审核记录）
  └── outbox 表（待发送的积分事件）

独立 Outbox 消费者：
  轮询 outbox 表 → 发送到 Kafka → 标记已发送

Wallet Service 消费 Kafka → 执行积分转账
```

#### 摩擦 3：数据量增长 → 分区与冷热分离

**问题**：10k 用户长期使用，数据量快速增长导致全表扫描变慢。

```
wallet_txns：10k 用户 × 10 笔/天 × 365 天 = 3650 万行/年
annotations：每个任务数千条记录，JSONB 字段大
```

**按时间范围分区**（应用层零改动）：

```sql
CREATE TABLE wallet_txns (
  id         UUID,
  user_id    UUID,
  amount     BIGINT,
  created_at TIMESTAMPTZ NOT NULL
) PARTITION BY RANGE (created_at);

-- 每月自动创建新分区，超过 6 个月移到冷存储（OSS Parquet）
```

**读写路由分层**：

```
写请求                      → PostgreSQL Primary
近期数据查询（7 天内）       → Read Replica 1（延迟 < 100ms）
历史数据查询（30 天+）       → Read Replica 2
统计聚合查询                 → Read Replica 3 + 物化视图
归档数据                     → OSS Parquet + ClickHouse（分析查询）
```

#### 摩擦 4：排行榜与统计 → 完全预计算

**问题**：10k 并发下，每分钟数万次排行榜刷新，实时从 DB 计算不可行。

**解法：事件驱动增量更新**：

```
用户完成标注 → Kafka 事件
                   ↓
         RankingService 消费事件
         ZINCRBY ranking:annotators {userId} {score}
                   ↓
排行榜 API 直读 Redis ZSet，O(log N)，不碰数据库

每天凌晨：从 DB 重建全量 ZSet（保证最终一致，修正增量误差）
```

### 10k 并发架构图

```
                          ┌─────────────┐
                          │  全球 CDN   │← 静态资源 + DICOM 缩略图
                          └──────┬──────┘
                                 │
                    ┌────────────▼────────────┐
                    │   API Gateway / Nginx    │← 限流、路由、SSL 终止
                    └──┬──────────┬───────────┘
                       │          │
              ┌────────▼──┐  ┌────▼──────────────┐
              │ Next.js   │  │  Go 实时服务       │
              │ ×5-8 实例 │  │  ×3 实例          │
              └────┬──────┘  └────┬──────────────┘
                   │              │
                   └──────┬───────┘
                          │
           ┌──────────────▼──────────────┐
           │         Kafka Cluster        │← 事件总线（新增）
           └──┬──────┬──────┬────────────┘
              │      │      │
       ┌──────▼─┐ ┌──▼───┐ ┌▼──────────┐
       │Notif.  │ │Rank  │ │Wallet     │← 按扩容需求独立拆分
       │Service │ │Svc   │ │Service    │
       └────────┘ └──────┘ └───────────┘
              │      │      │
           ┌──▼──────▼──────▼──────────┐
           │      Redis Cluster         │← 从 Sentinel 升级（新增）
           │  会话 / 锁 / ZSet / LRU   │
           └───────────────────────────┘
                          │
           ┌──────────────▼──────────────┐
           │         PgBouncer           │
           └──────────────┬──────────────┘
                          │
           ┌──────────────▼──────────────┐
           │  PostgreSQL（分区表）        │
           │  Primary + 3 Read Replicas  │
           └─────────────────────────────┘

冷数据：OSS Parquet + ClickHouse（归档 + 分析，不影响 OLTP）
```

---

## 三个量级完整对比

| 组件 | 100 并发 | 1000 并发 | 10k 并发 |
|------|---------|---------|---------|
| **Next.js** | 单实例 | 3 实例 | 5-8 实例 |
| **Go WS** | 无（SSE） | 2 实例 | 3 实例 |
| **PostgreSQL** | 直连 | PgBouncer + 1 只读 | 分区表 + 3 只读 + 冷热分离 |
| **Redis** | 单机 | Sentinel（HA） | **Cluster（分片）** |
| **事件处理** | 同步 | Redis Stream | **Kafka Cluster** |
| **排行榜** | DB 实时计算 | Redis ZSet 定时同步 | **事件驱动增量更新** |
| **通知** | 同步调用 | SSE 推送 | **Kafka Outbox + 独立服务** |
| **数据归档** | 无 | 无 | **冷热分离 + Parquet** |
| **本地缓存** | 无 | 无 | **进程内 LRU（二级缓存）** |
| **服务拆分** | 单体 | 单体 + Go WS | **Wallet/Ranking/Notif 独立** |
| **部署** | 单机/Vercel | ECS 弹性伸缩 | **K8s 自动扩缩容** |
| **可观测性** | Sentry | Sentry + 基础监控 | **Prometheus + Grafana + OTel** |

---

## 成本估算

| 量级 | 月成本（国内云） |
|------|--------------|
| 100 并发 | ¥2,000 - 4,000 |
| 1000 并发 | ¥10,000 - 12,000 |
| 10000 并发 | ¥40,000 - 60,000 |

成本增长约 4-5 倍/10x 用户，而非线性增长，这是架构做对了的体现。

---

## 渐进式扩容路径

```
阶段 1（0-100 并发）
  单机 Next.js + PostgreSQL 直连 + Redis 单机 + OSS
  关键：API 设计为无状态，不在进程内存存会话

阶段 2（100-300 并发）
  增加 PgBouncer + Read Replica + CDN + OSS 预签名直传

阶段 3（300-1000 并发）
  增加 Go 实时服务 + Next.js ×3 + Redis Sentinel

阶段 4（1000-10000 并发）
  Redis Cluster + Kafka + 服务按需拆分 + DB 分区 + 冷热分离

阶段 5（10000+ 并发）
  K8s 自动扩缩容 + 多地域部署 + ClickHouse 分析层
```

**最重要的前提**：从第一天就把 API 设计成**无状态**（不依赖本地内存存会话/状态），后续所有扩容才不需要改代码，只需加机器和调配置。

---

## 关键风险与合规

| 风险 | 说明 | 应对 |
|------|------|------|
| 积分并发安全 | 超额领取、重复结算 | PostgreSQL 行锁 + Redis 分布式锁 |
| DICOM 患者隐私 | PHI 泄露 | 上传时强制 Anonymization |
| 数据合规 | 医疗影像数据监管 | 存储选国内节点 + 等保三级 |
| 标注数据质量 | 假冒专家刷分 | 机构营业执照 OCR + 人工审核资质 |
| 大文件并发上传 | 带宽成本 | OSS 分片上传 + 断点续传 |
