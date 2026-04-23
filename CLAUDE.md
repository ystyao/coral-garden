# The Coral Garden

> A contemplative Three.js web installation where Oura Ring biometric data
> grows a procedural coral reef — one cluster per day, each coral species
> mapped to one physiological dimension of the body.
>
> **Final Project for Multimedia Web Design.**

---

## Language / 语言

**请用中文回复所有对话和解释。** 代码里的注释、变量名、commit message 保持英文。

---

## Project Context / 项目背景

The Coral Garden 是 Multimedia Web Design 课程的 final project —— 一个
**沉思式的生物数据可视化网页装置**。

核心想法：用 Oura Ring 采集的身体数据生长出一片海底珊瑚礁。每一天的生理
数据生长出一丛珊瑚，30 天积累成一段海底礁；每丛珊瑚旁有一个漂流瓶装载
当日文字；河口的 Hokora 神龛可以抽取一签。

作品融合了**生物数据可视化、3D Web 图形、东亚文化的纪念物语法**
（神龛、签文、漂流瓶、竖排签诗）。借用这些形式把冰冷的生物传感器数据
转化为可沉浸、可仪式化的体验。

**核心阅读**：这不是一个 fitness tracker。这是一个用 Web 技术做的
**媒介诗学装置**。课程评分的维度也包括：Web 技术实现、交互设计、
美学完成度、叙事深度。

---

## Core Design Principles / 核心设计原则

以下原则不要违背，每次改动前需自检：

1. **低饱和、自然色调** —— 从不使用糖果色/彩虹色/荧光色。珊瑚、鱼、水、
   光都应偏向真实海洋生态中的色彩。若要"多彩"，靠色相多样性而非饱和度。
2. **沉思式，不戏剧化** —— 避免夸张效果：无鲜艳 bloom、无爆炸粒子、
   无高强度抖动。所有动画慢、柔、像水中。
3. **东亚文化敏感度** —— Hokora、注连绳、紙垂、御神签、竖排中文、
   印章红、宣纸色。避免把东亚元素当装饰品用；它们是作品的叙事支架。
4. **英文 UI，中文艺术内容** —— 界面文字、数据标签、交互提示都用英文
   （因课程评审主要用英文）。但签文诗、等级（大吉/末吉/凶）、
   特定诗意文本保留中文。
5. **珊瑚为视觉主角** —— 鱼、光柱、岩石、装饰物都是配角。珊瑚的形态、
   色彩、密度永远是画面首要信息。
6. **身体数据决定一切形态** —— 珊瑚不是装饰，是身体的形态化记录。
   任何视觉参数（大小、颜色、枝桠繁茂度、脉动频率）都必须有一个
   Oura 数据字段驱动。

---

## Technical Stack / 技术栈

- **Three.js** r160+ via CDN importmap；`three/addons/` alias 从 jsdelivr
  （importmap 写法：`"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"`）
- **GLTFLoader + MeshoptDecoder**（不用 DRACOLoader；meshopt 是 gltf-transform
  optimize 的默认压缩，解码速度更快）
- **@gltf-transform/cli** 命令行压缩 GLB 到 <5MB 每个（用 `optimize --compress
  meshopt --texture-compress webp --texture-size 1024 --simplify-ratio 0.4`）
- **Claude API**（`claude-sonnet-4-20250514`）用于签文诗歌生成与瓶信
  sentiment 分析
- **Vanilla JS**（无框架，单页 Web 应用，追求最小化依赖）
- **localStorage**（`window.storage` adapter，兼容 Claude artifact 宿主与
  本地浏览器）持久化瓶信、签文缓存、日数据、Oura PAT
- **浏览器原生** Fetch API 请求 Oura v2 API —— 开发期直接从浏览器调
  （需 dev server；CORS 可能需 Vercel serverless proxy）
- **Oura Personal Access Token**（开发期；已实现。OAuth 2.0 生产版本 TBD）

---

## Project Structure / 项目结构

当前状态是**局部拆分的单文件应用**：index.html 包含绝大部分代码（3500+ 行），
src/ 下只有独立出来的 Oura 客户端。后续按 CLAUDE.md 规划逐步拆出 modules。

```
coral-garden/
├── index.html                     # 主应用 (3500+ 行，尚未拆分)
├── src/
│   └── data/
│       └── ouraClient.js          # ✅ 已存在 — Oura API v2 + PAT 管理
│                                    (未来计划也放 ouraMock.js / dayLedger.js)
├── assets/
│   ├── hokora.glb                 # 原始 36MB 源文件（可选删除）
│   ├── hokora_opt.glb             # ✅ 压缩后 2.6MB，index.html 引用此路径
│   ├── favia.glb / gorgonia.glb / ... / pocillopora.glb
│   │                              # 原始珊瑚源文件（488MB，可选删除）
│   └── models/
│       ├── favia.glb              # ✅ 压缩后 7.0MB
│       ├── gorgonia.glb           # ✅ 压缩后 3.8MB
│       ├── xenia.glb              # ✅ 压缩后 11.2MB (tex 512, ratio 0.2)
│       ├── acropora.glb           # ✅ 压缩后 1.8MB
│       ├── fungia.glb             # ✅ 压缩后 1.5MB
│       ├── millepora.glb          # ✅ 压缩后 2.2MB
│       └── pocillopora.glb        # ✅ 压缩后 6.1MB
├── CLAUDE.md                      # 本文档
├── startup_prompt.md              # VS Code 首次启动 Claude Code 的引导 prompt
└── memory/                        # Claude Code 的 memory system (user/feedback/project/ref)

# 规划中（尚未创建）：
# src/main.js, src/scene/*.js, src/corals/*.js,
# src/omikuji/*.js, src/bottle/*.js, src/util/*.js,
# package.json, vite.config.js, README.md
```

**路径一致性注意**：Hokora 用 `assets/hokora_opt.glb`（根目录），珊瑚用
`assets/models/*.glb`（子目录）。不统一是历史原因（Hokora 先做，沿用
`_opt` 后缀约定；珊瑚后做，用子目录）。统一迁移时需同步改 index.html
里的两处路径字符串。

---

## The 7 Body Metrics / 七种身体维度

每种维度对应一种珊瑚。每撮珊瑚包含 7 株，每株的**大小/颜色/密度**由当日数据驱动。

### 1. Sleep Score （睡眠总分）

- **字段**: Oura API `daily_sleep.score`
- **范围**: 0–100
- **基线**: 75–85 健康人群
- **含义**: 夜间修复质量的综合评估，综合总时长、效率、潜伏期、醒来次数
- **为何映射脑珊瑚**: 大脑在睡眠中巩固记忆；脑珊瑚的脑回纹样与神经形
  态呼应，两者都是**慢速、层积式**的沉积。

### 2. HRV （心率变异性）

- **字段**: Oura API `daily_readiness.contributors.hrv_balance` 或
  `daily_sleep.heart_rate_variability.average`
- **范围**: 20–100 ms（因人而异，个人基线 40–80 ms）
- **基线**: Lorriane 个人约 55 ms
- **含义**: 自主神经系统柔韧度；高 HRV = 身体恢复能力好、压力低
- **为何映射海扇**: 海扇随水流摆动，越柔韧越开阔；像自主神经的流动感。

### 3. Resting Heart Rate （静息心率）

- **字段**: Oura API `daily_readiness.contributors.resting_heart_rate`
- **范围**: 40–100 bpm
- **基线**: 健康成人 55–75 bpm；运动员 40–55 bpm
- **含义**: 心血管基础节律
- **为何映射脉冲软珊瑚 Xenia**: Xenia 独特的脉动开合动作（真实生态中
  它们以 30–60 次/分钟的频率张合触手）天然地视觉化心跳。
- **特殊机制**: 这株珊瑚的实际动画**脉动频率 = 当日 RHR / 60 Hz**。

### 4. Activity Score （活动分数）

- **字段**: Oura API `daily_activity.score`
- **范围**: 0–100
- **基线**: 70–85
- **含义**: 一天的运动量综合（步数、站立、MET、卡路里）
- **为何映射鹿角珊瑚 Acropora**: Acropora 是生长最快的珊瑚属之一，
  其分枝繁茂度直接对应"活力扩张"的视觉意象。

### 5. Deep Sleep Duration （深睡时长）⭐ 新

- **字段**: Oura API `daily_sleep.deep_sleep_duration`（秒）
- **范围**: 0–10800 秒（0–3 小时）
- **基线**: 成人健康 60–90 分钟
- **含义**: 深度睡眠（慢波睡眠）的累积时长，是身体物理修复的核心阶段
- **为何映射圆盘珊瑚 Fungia**: Fungia 是独立漂浮型的单体珊瑚，扁平沉
  稳、几乎不动，象征深睡阶段**身体沉入最底层**的静定。

### 6. Body Temperature Deviation （体温偏差）⭐ 新

- **字段**: Oura API `daily_sleep.body_temperature_delta` 或
  `daily_readiness.temperature_deviation`
- **范围**: -1.5 °C 到 +2.0 °C （与个人基线的偏差）
- **基线**: ±0.2 °C 为正常波动
- **含义**: 体温异常可能反映：生病（发烧升高）、女性月经周期（排卵后
  升 0.3–0.5°C）、时差、环境变化。对 Lorriane 来说，这个字段特别有
  **生物节律叙事价值**。
- **为何映射火珊瑚 Millepora**: Millepora 有"火"之名（因螫刺感），色
  泽金黄到橙红的温度意象与体温偏差直接对应 —— 升温时颜色偏红，降温
  时偏冷白。

### 7. Respiratory Rate （呼吸频率）⭐ 新

- **字段**: Oura API `daily_sleep.average_breath`
- **范围**: 10–20 次/分钟
- **基线**: 成人健康 12–16 次/分钟
- **含义**: 夜间平均呼吸频率；异常升高可能预示生病/焦虑
- **为何映射细枝鹿角珊瑚 Pocillopora**: Pocillopora 密集的细分枝像
  呼吸道的支气管分叉结构，密度高低直接对应呼吸速率的密疏感。

---

## Body Data → Coral Visual Mapping Table / 数据驱动视觉规则

这是最核心的表。每种珊瑚有**三个视觉维度**可被数据调控：

| Coral | Metric | Scale | Color | Density / Detail |
|-------|--------|-------|-------|------------------|
| **Favia 脑珊瑚** | Sleep Score (0-100) | 0.8× (low) → 1.4× (high) | 低分：灰褐 `#7a6550`；高分：蜜褐 `#c19a6b` | 低分：脑回纹粗而浅；高分：脑回纹密而深 |
| **Gorgonia 海扇** | HRV (20-100 ms) | 高度 0.6× → 1.3× | 低 HRV：暗紫灰 `#6a5a7a`；高 HRV：粉紫 `#c289b0` | 低：少分枝；高：扇面宽且多叉 |
| **Xenia 脉冲软珊瑚** | RHR (40-100 bpm) | 固定 | 低 RHR：青绿 `#6a9a8a`；高 RHR：琥珀 `#d4a468` | **脉动频率 = RHR/60 Hz**（低心率脉动慢） |
| **Acropora 鹿角珊瑚** | Activity (0-100) | 0.7× → 1.5× | 低：淡金 `#c9b88a`；高：珊瑚橙 `#d97a5a` | 低：稀疏枝条；高：爆炸式分枝 |
| **Fungia 圆盘珊瑚** | Deep Sleep (0-180 min) | 0.9× → 1.3× | 低：灰白 `#b5a894`；高：玫瑰粉 `#c48a82` | 低：盘面光滑；高：辐射条纹密集 |
| **Millepora 火珊瑚** | Body Temp Dev (-1.5 to +2.0 °C) | 固定 | 降温：冷白 `#c8d0c8`；正常：金黄 `#d4a858`；升温：朱红 `#a8513a` | 升温：表面微凸起（刺状纹理更显） |
| **Pocillopora 细枝鹿角珊瑚** | Respiratory Rate (10-20) | 0.9× → 1.1× | 低：灰蓝 `#8a9ca8`；高：粉白 `#d4b8b0` | **分枝密度 = 呼吸率**（低频稀疏，高频密集如支气管树） |

### 通用数据驱动逻辑

每日 `buildDayCluster(day)` 时：

```js
for (let i = 0; i < 7; i++) {
  const coralDef = CORAL_REGISTRY[i];
  const rawValue = day.data[coralDef.metric];
  const normalized = (rawValue - coralDef.min) / (coralDef.max - coralDef.min); // 0..1
  
  const model = await loadCoralGLB(coralDef.glbPath);
  const coral = model.clone();
  
  // 1. Scale: lerp between coralDef.scaleMin and scaleMax
  const scale = lerp(coralDef.scaleMin, coralDef.scaleMax, normalized);
  coral.scale.setScalar(scale);
  
  // 2. Color: lerp HSL between two colors
  const color = new THREE.Color().lerpColors(
    new THREE.Color(coralDef.colorLow),
    new THREE.Color(coralDef.colorHigh),
    normalized
  );
  coral.traverse(o => {
    if (o.isMesh && o.material?.color) {
      o.material.color.copy(color);
    }
  });
  
  // 3. Special behaviors (e.g., Xenia pulse rate, Pocillopora density)
  if (coralDef.key === 'rhr') {
    coral.userData.pulseHz = rawValue / 60;
  }
  if (coralDef.key === 'resp') {
    // skip some branches based on normalized density
    coral.traverse(o => {
      if (o.isMesh && o.userData.isBranch && Math.random() > normalized * 0.5 + 0.5) {
        o.visible = false;
      }
    });
  }
  
  cluster.add(coral);
}
```

---

## Coral Growth States / 珊瑚生长表现谱

上一节是**静态映射**（数据 → 颜色/大小）。这一节是**生长表现**：数据变化让珊瑚呈现**健康 / 挣扎 / 病变**的形态学差异，是作品的生态叙事核心。

每种珊瑚分 **3-4 个生长状态**。实现方式优先用**一个 GLB 包含多级 child mesh，通过 visibility / material 参数切换**（除 Xenia 需要真动画）。

### 1. Favia 脑珊瑚 ← Sleep Score

| 状态 | Sleep Score | 视觉表现 |
|---|---|---|
| **白化** | 0-40 | 表面局部白色斑块（珊瑚白化病），脑回纹浅平几乎消失，整体灰白 |
| **生长缓慢** | 40-65 | 脑回纹浅、规则性差，颜色暗哑褐灰 |
| **正常** | 65-85 | 脑回深刻清晰、纹路规则如迷宫，蜜褐色 |
| **繁茂** | 85-100 | 脑回纹极深、表面饱满鼓起，金蜜色带光泽 |

### 2. Gorgonia 海扇 ← HRV

| 状态 | HRV (ms) | 视觉表现 |
|---|---|---|
| **蜷缩** | 20-35 | 枝条向中心内卷、扇面小且不对称、颜色灰暗 |
| **开展不足** | 35-50 | 主干少分枝、扇面呈窄条状、暗紫色 |
| **舒展** | 50-70 | 多次分叉、典型扇形、柔和粉紫 |
| **茂盛** | 70-100 | 三级以上分叉、扇面大且对称、鲜明粉紫光泽 |

**附加动画**：海扇有微弱水流摆动，摆动幅度由 HRV 驱动（低 HRV 僵硬，高 HRV 流畅）。

### 3. Xenia 脉冲软珊瑚 ← RHR

**这是 7 种中唯一动态脉动的珊瑚**，是视觉焦点。

| 状态 | RHR (bpm) | 视觉表现 |
|---|---|---|
| **慢而深** | 40-55 | 脉冲频率 0.7-0.9 Hz，开合幅度 80%，青绿色 |
| **稳定** | 55-70 | 脉冲 1.0 Hz，开合幅度 60%，青绿偏金 |
| **急促** | 70-85 | 脉冲 1.3 Hz，开合幅度 40%，琥珀色 |
| **颤抖** | 85-100 | 脉冲 1.5 Hz + 不规则抖动（Perlin noise），开合 25%，暗橙色 |

脉冲频率 = rawRHR / 60 Hz。观察者看着这株珊瑚就能"看到"使用者当天的心跳节奏。

### 4. Acropora 鹿角珊瑚 ← Activity Score

| 状态 | Activity | 视觉表现 |
|---|---|---|
| **枯疏** | 0-30 | 只有主干 + 少量一级分枝，灰褐色，枝尖钝 |
| **中等繁茂** | 30-60 | 主干 + 二级分枝，浅金色 |
| **活力扩张** | 60-85 | 三级分枝密集，枝尖明亮（生长点），珊瑚橙色 |
| **爆炸式生长** | 85-100 | 四级以上分枝，枝尖带冷色荧光（模拟珊瑚生长尖端的 GFP 荧光蛋白），珊瑚红 |

### 5. Fungia 圆盘珊瑚 ← Deep Sleep Duration

| 状态 | Deep Sleep (min) | 视觉表现 |
|---|---|---|
| **碎裂** | 0-30 | 盘面不完整、边缘残缺、灰白色、辐射条纹模糊 |
| **小而薄** | 30-60 | 盘面圆整但直径小、扁平、淡灰玫瑰色 |
| **饱满圆盘** | 60-90 | 盘面完整、微微凸起、玫瑰粉色、条纹清晰 |
| **厚重如莲** | 90-180 | 盘面厚实、层叠感强、深玫瑰红、条纹如雕刻 |

### 6. Millepora 火珊瑚 ← Body Temperature Deviation

**这是最富情感的珊瑚 —— 身体的求救信号**。课程展示时可重点讲解。

| 状态 | Temp Dev (°C) | 视觉表现 |
|---|---|---|
| **冷却静止** | -1.5 to -0.3 | 冷白带蓝调、表面光滑、几乎透明（病态感） |
| **稳定** | -0.3 to +0.3 | 金黄色、表面有细小刺状突起 |
| **活跃** | +0.3 to +1.0 | 橙红色、突起更明显、边缘淡蓝发光（应激荧光） |
| **发烧求救** | +1.0 to +2.0 | 朱红色、强烈突起、整体被**蓝绿荧光**包围（真实的珊瑚高温应激反应：release green/cyan fluorescent proteins as last-ditch protection） |

### 7. Pocillopora 细枝鹿角珊瑚 ← Respiratory Rate

| 状态 | Resp Rate | 视觉表现 |
|---|---|---|
| **深长** | 10-12 | 粗主干 + 少量一级分枝，骨架感，灰蓝色 |
| **适度** | 12-15 | 主干 + 二级分枝，中等密度，粉灰色 |
| **密集** | 15-18 | 主干 + 三级分枝，密如松针，粉白色 |
| **过度换气** | 18-20 | 四级分枝、细如发丝、枝尖泛白 |

实现：单 GLB 里所有级别分枝都存在，根据 respRate 选一个 `maxLevel`，高于此级别的 child mesh 设为 `visible = false`。

### 跨珊瑚的撮级表现（可选加强）

- **健康的一天**（7 株都在 75+ 百分位）：整撮鲜艳饱满，基座苔藓翠绿，鱼群会主动靠近
- **挣扎的一天**（多数在 25 百分位以下）：整撮暗沉、白化斑多、鱼群避开、撮上方升起应激气泡
- **矛盾的一天**（如 Sleep 好但 RHR 高）：不做视觉"修正"，让对比张力保留 —— 这是作品对身心分离的观察

### 实现策略（技术指引）

1. **每种珊瑚一个 GLB** —— 不要做 4 × 7 = 28 个文件
2. **GLB 内部分层**：每一级分枝/状态是独立 child mesh，`userData.growthLevel = 1..4`
3. **视觉状态切换**：通过 `visible` 属性和 material 参数（color lerp、emissive intensity）实现
4. **只有 Xenia 需要 requestAnimationFrame 动画**（脉冲），其他都是加载时确定状态
5. **白化 / 发烧等病态效果**：用 additional material override，不必建新几何

---

## Coral Placement in Cluster / 撮内排布

每撮 7 株珊瑚排列成**圆形**（直径约 0.8m），有一株在中心，6 株围绕：

```
Position layout (top-down view):

        [Sleep]
           ○
    [Resp] ○    ○ [HRV]
           
    [Activity]  ○ [RHR] ← center
    
    [DeepSlp] ○  ○ [Temp]
           ○
        [Fungia]
```

- 中心位置：RHR（静息心率）作为身体的核心韵律
- 圆周位置：其他 6 种数据环绕，每 60° 一株
- 每株 y 方向有 ±0.05 的随机浮动，避免齐平感
- 每株 y 轴旋转随机（Math.random() * Math.PI * 2）

---

## GLB Model Requirements / GLB 模型要求

每个 GLB 模型必须满足：

- **多边形预算**: ≤ 30,000 triangles（用 `@gltf-transform/cli optimize` 压缩）
- **文件大小**: ≤ 5 MB（Draco 压缩 + WebP 纹理）
- **朝向**: 模型面向 +Z，y 轴向上
- **尺寸**: 高度约 1.0 单位（Three.js 单位 = 米，代码里会缩放）
- **原点**: 位于珊瑚基座中心（不是质心）
- **材质**: PBR (MetallicRoughness)，基础色放在 baseColorTexture 或 color 属性

推荐压缩流程（meshopt + webp，index.html 里的 GLTFLoader 配 MeshoptDecoder 解码）：

```bash
npx @gltf-transform/cli@latest optimize input.glb output.glb \
  --compress meshopt --texture-compress webp \
  --texture-size 1024 --simplify-ratio 0.4 --simplify-error 0.001
```

若模型异常大（如 xenia 原 193MB），单独用更激进参数：`--texture-size 512
--simplify-ratio 0.2 --simplify-error 0.002`。

原始的 `.glb` 保留在 `assets/` 根部作为 source-of-truth；压缩后的在
`assets/models/` 下。若磁盘吃紧可删除原始文件（总计 ~488MB）。

---

## Coral Loading Architecture / 珊瑚加载架构

GLB 加载走三层：**registry → loader → builder**。

### CORAL_REGISTRY（数据驱动表）

每种珊瑚一个条目，字段：`metric` (指标 key), `min/max` (归一化边界),
`scaleMin/scaleMax` (数据驱动尺寸范围), `colorLow/colorHigh` (HSL lerp 两端),
`glbPath` (文件路径), 可选 `colorMid` (Millepora 的三段色), `pulseDriven`
(Xenia 标记)。颜色映射在 CORAL_CLUSTER_SCALE (0.42) 之上叠加。

### loadCoralTemplate(key) — wrapper pattern（关键）

GLB 的原点常常不在基座中心。为了让 `coral.position.y` 的数值语义始终是
"珊瑚基座的世界 Y"，无论后续如何缩放，我们把 GLB 包进一个 Group：

```
wrapper (THREE.Group)            ← buildCoralInstance 缩放/定位这一层
  └── model (gltf.scene)         ← 内部带死 scale + position 让基座对齐 wrapper 原点
```

关键顺序：**先 scale，再 position**，且 position 用 post-scale 单位：

```js
model.scale.setScalar(norm);
model.position.set(
  -center.x * norm,
  -bbox.min.y * norm,   // 不是 -bbox.min.y ！
  -center.z * norm,
);
wrapper.add(model);
```

**为什么必须 wrapper？** 因为 `buildCoralInstance` 后续会 `coral.scale
.multiplyScalar(CORAL_CLUSTER_SCALE * dataScale)`。如果不用 wrapper，那个
乘法会同时缩放 model 的顶点和 position 的相对关系，破坏基座对齐。用
wrapper 后，scale 作用在 wrapper 上，内部 model 的本地对齐不动。

数学验证：`world_base_y = wrapper.position.y`，恒成立，与 wrapper.scale
无关。

### buildCoralInstance(key, rawValue) — 每日 clone 实例

从 coralTemplates 取 wrapper，`clone(true)` 深拷贝。**每次都克隆材质**
（否则多个 cluster 共享同一份 material，改一个颜色所有都变）：

```js
coral.traverse(o => {
  if (o.isMesh && o.material) {
    o.material = Array.isArray(o.material)
      ? o.material.map(m => m.clone())
      : o.material.clone();
  }
});
```

然后应用数据驱动：scale = `scaleMin + t * (scaleMax - scaleMin)` 乘以
`CORAL_CLUSTER_SCALE`；color = `lerp(low, high, t)`（Millepora 走三段）；
若 `pulseDriven`，存 `userData.pulseHz = rawValue / 60`。

### Xenia 脉动（唯一动画）

CLAUDE.md 规定动画频率 = `RHR/60 Hz`。实现上对 wrapper 做整体 scale
振荡 ±6%，再除以 3 做视觉镇静（避免剧烈）：

```js
const hz = (xenia.userData.pulseHz || 1) / 3;
const base = xenia.userData._baseScale;
xenia.scale.setScalar(base * (1 + Math.sin(t * hz * Math.PI * 2) * 0.06));
```

GLB 没有 polyp/arm 子节点，所以不做每触手独立动画。整体呼吸。

### 预加载 & 进度

启动时 `await preloadAllCorals(onProgress)` —— Promise.all 并行 7 个 GLB，
每加载完一个触发 callback。onProgress 里更新 `#loading-sub` 副标题为
"growing the reef · 3 / 7 · favia"。加载完再 `buildGarden()`。

---

## Hokora Shrine / 神龛

- **模型路径**: `assets/hokora_opt.glb`（压缩后 2.6MB；原始 36MB 在
  `assets/hokora.glb`）
- **位置**: `fossilGroup.position.set(2.4, 0.4, 9.2)` 在河道下游
- **旋转**: `rotation.y = -0.7`（门朝向河心）
- **基座对齐**: 加载后用 `Box3.setFromObject` 算 bbox，把 loaded model
  向上推 `-bbox.min.y`，让 fossilGroup 原点等效成"基座底 pivot"（跟之前
  hand-built shrine 一致）
- **形制偏好**: **瘦高、典雅、有双开门、带注连绳和紙垂、青铜绿屋顶**
  （参考照片：Shiota Hachiman-gu Shrine in Kobe, Hyogo）
- **内部供奉**: 巨齿鲨牙齿（这是作品特有的元素，不要替换为传统神体）
- **内部暖光**: fossilGroup 里挂一个 PointLight `0xffc488, 0.65, 3`，动画
  循环里找 `.children.find(c => c.isPointLight)` 做脉冲亮度变化
- **交互**: raycaster 检测 fossilGroup 下所有 Mesh → 触发抽签
- **加载进度条**: `#hokora-progress` 独立 UI，位于屏幕底部中央

---

## Scene Layout / 场景构图

### 河谷地形

- **走向**: S 形 Catmull-Rom 曲线，从 z=-22 (上游/最老) 到 z=+8 (下游/今天)
- **宽度**: 24 单位；**长度**: 52 单位
- **边界淡化**: 边缘顶点色渐变到雾色 + 微微下陷，消除矩形感
- **河床**: 沉降河道 + 两岸微凸堤岸
- **装饰**: 稀疏扇贝（8 个）+ 海星（5 个），无海草

### 珊瑚撮沿河分布

- **数量**: 30 天
- **位置**: Catmull-Rom 曲线采样 t=0.05 到 t=0.95，等间距
- **左右交替**: i%2==0 → 右岸，否则左岸
- **距离中心**: 1.0–1.3 单位
- **当日标签**: 每撮上方浮动日期 sprite（y=1.7，字号 30px，Cormorant Garamond）
- **瓶子**: 每撮旁边的河床上，x 偏移 `-side * 1.2`，z=0.8

### Hokora 在下游

详见上一节。

### 鱼群（Fish Schools）

- **数量**: 6 个物种，各 14–22 条，共 ~106 条
- **技术**: InstancedMesh + 每种一个 material + leader-follower flocking
- **配色**（自然低饱和）:
  - `#c48a6a` 沙棕 × 22
  - `#d8b87a` 黄褐 × 20
  - `#6b8fa8` 灰蓝 × 18
  - `#b86e78` 淡玫瑰 × 16
  - `#8a7a9a` 薰衣草灰 × 14
  - `#7ba8a0` 海绿灰 × 16
- **材质**: transparent opacity 0.55, roughness 0.55, emissive 0
- **队形**: 紧凑群体（formFwd ±1.4, formSide ±0.5, formUp ±0.3）
- **行为**: 沿 leadDir 前进，弹簧力拉向群心 + formation offset，避让力防止重叠

### God Rays 光柱

- **数量**: 5 根
- **形状**: 上窄下宽的圆柱（widthTop 0.5–0.8, widthBase 1.2–1.8）
- **材质**: NormalBlending（**不是** AdditiveBlending！）
- **颜色**: `#c8dde8` 冷蓝白
- **不透明度**: 0.04–0.07（非常克制，像雾丝）
- **开启 fog: true**（远处自然融入）

### 水体粒子

- 轻微白色粒子上升，模拟悬浮微粒

---

## Lighting System / 光照系统（实时时间驱动）

这是作品的**重要叙事机制**：场景的光影随现实世界的时间变化。

### 时段映射（6 个阶段）

```js
function updateLightByTime() {
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  const dayT = (h - 6) / 12;  // 0 at sunrise, 1 at sunset
  const isNight = h < 6 || h > 18;
  
  // dayT < 0.12 : Dawn    (6:00–7:25)
  // dayT < 0.35 : Morning (7:25–10:15)
  // dayT < 0.65 : Noon    (10:15–13:50)
  // dayT < 0.88 : Afternoon (13:50–16:40)
  // else if day : Dusk    (16:40–18:00)
  // else        : Night   (18:00–6:00)
}
```

### 各时段参数

| Phase | Sun Color | Sun Intensity | Ambient Color | Ambient Intensity | Fog Color |
|-------|-----------|---------------|---------------|-------------------|-----------|
| Dawn  | `#ffb088` | 0.7 | `#5a7080` | 0.4 | `#1a3648` |
| Morning | `#fff8e0` | 1.4 | `#9cc8dc` | 0.8 | `#5ea0c0` |
| Noon  | `#ffffff` | 1.1 | `#88b8d0` | 0.75 | `#3a7a9a` |
| Afternoon | `#ffd0a0` | 0.9 | `#6090a8` | 0.45 | `#1a3040` |
| Dusk  | `#ff8048` | 0.6 | `#4a5a70` | 0.4 | (渐暗) |
| Night | `#3a5a7a` | 0.15 | `#1a3a50` | 0.3 | `#050f18` |

### 额外光源

- **HemisphereLight** (`0xcfe8ff` / `0x6a8070`, intensity 0.6) 模拟水面反射
- **PointLight (rim)** `0x6ad8d0` 青色补光，位于 (-8, 3, -4)
- **PointLight (fill)** `0xffb880` 暖色补光，位于 (6, 2, 4)
- **Hokora 内部 PointLight** `0xffc488` 暖黄，照亮供奉物

### 更新频率

- 每 60 秒调用一次 `updateLightByTime()`
- **不要做太频繁的更新**（浪费性能）
- 平滑过渡：两个时段之间用 lerp 避免跳变（过渡时长 5 分钟）

### 开发模式

`const FORCE_NOON = false;` 改为 `true` 会锁定在某个时段方便开发。
生产环境必须是 `false`。

---

## Omikuji System / 签文系统

### 触发

点击 Hokora 3D 模型 → raycaster 检测 → 打开签文 modal。
**限制**：每天只能抽一次签，抽过的缓存。

### 分级算法

基于**昨天**的数据（不是今天，因为今天还没"结束"）：

```js
function computeOmikujiScore(dayData) {
  // Multi-factor weighted score, 0-100
  return (
    dayData.readiness * 0.20 +   // overall state
    dayData.sleep * 0.20 +
    dayData.hrv_normalized * 0.15 +
    dayData.activity * 0.10 +
    dayData.deep_sleep_normalized * 0.15 +
    dayData.temp_stability * 0.10 +   // closer to 0 is better
    dayData.resp_stability * 0.10
  );
}
```

### 七级签

| Rank | Romaji | Score Range |
|------|--------|-------------|
| 大吉 | Dai-kichi | 85–100 |
| 中吉 | Chuu-kichi | 75–85 |
| 小吉 | Shou-kichi | 65–75 |
| 吉   | Kichi | 55–65 |
| 末吉 | Sue-kichi | 45–55 |
| 凶   | Kyou | 30–45 |
| 大凶 | Dai-kyou | 0–30 |

### 五言绝句生成

调用 Claude API `claude-sonnet-4-20250514`，prompt 大意：

```
给定当日身体数据 {...}，签的等级 {大吉}，
请生成一首五言绝句（4 句 × 5 字 = 20 字），
整首诗气质须匹配签的等级：大吉光明昂扬，大凶幽暗低沉，其他循序渐进。
不要使用现代词汇（如"电"、"机"、"车"），保持古典意象。
返回格式：JSON { poem: "四句诗\n用\n换行\n分隔", interp: "英文简短白话解读 1 句" }
```

**失败回退**：若 API 超时或出错，用预置的 7 × N 首诗库随机选一首同等级的。

### 签号（Signature）

每张签都有唯一 ID，基于**日期 + 当日数据的哈希**：

```js
const sigSrc = `${date}|${round(readiness)}|${round(sleep)}|${round(hrv)}`;
const hash = simpleHash(sigSrc);  // → 6-digit hex
// 例: "#A7B3F2"
```

**叙事价值**：这是身体数据的 hash chain 雏形——每个签不可伪造，数据一变
签号就变。展示时可以讲成"身体数据的数字印鉴"，是作品连接生物数据与
数字记忆的点睛之笔。

### 签文界面设计

参照传统日本御神签印刷版（详见设计参考图，木刻风格）：

- **卡片宽度**: 780px
- **背景**: 米白宣纸 `#f4ecd8`，带淡墨斑径向渐变
- **顶部**: 黑底白字框 + 大号汉字等级（字号 52px，Ma Shan Zheng）+ 斜体
  romaji 副标题
- **主体（6 列，右起）**:
  - 栏 1–4: 诗的四句，竖排 Ma Shan Zheng 28px，`writing-mode: vertical-rl`
  - 栏 5: 英文白话解读，**横排**（此前尝试过竖排但不易读）
  - 栏 6: 英文日期 + 签号 + "Day N of 30" —— 横排，形成**两种文字系统的视觉对比**（作品的叙事亮点之一）
- **底部**: 只有一个 `← Back to Garden` 按钮（居中）
- 四角装饰纹（L 形边角）

---

## Bottle System / 漂流瓶系统

### 概念

每天一个漂流瓶躺在对应珊瑚撮旁的沙上。共 30 个。

**时间窗口规则**：
- **当天的瓶子**：在**当日时间窗口内**可以多次打开、追加或修改。白天可以先封一版，傍晚有新想法再补 —— 当天的身体和心绪还没"结束"，瓶子是开放的。
- **跨日后自动封存**：一过当日（`date !== todayISO`），瓶子即封入礁中，只读。过去的瓶子是当时身体对那一天的封存，不应被后来的心情改写。
- **空瓶**（当天没写过）：可以直接写入；过去的空瓶允许追溯写入（retroactive）。

这个规则的叙事价值：保留"身体账本不可追溯篡改"的核心，同时承认"一天内身体与心绪都在持续变化"。瓶子是**当日仪式**，不是一次性提交。

### 瓶子 3D 模型

- 药瓶形（apothecary bottle）：圆柱瓶身 + 短颈 + 软木塞
- 材质: 玻璃质感（MeshPhysicalMaterial，transmission 0.6, roughness 0.1）
- 已写的瓶子内含小纸卷可见（用一个米色圆柱 mesh 表示）
- **倒放**在沙上（不悬浮），rotation.z = Math.PI/2

### Writer & Reader 界面

**共同样式**：美式活页纸
- 纸色 `#fcfbf7`
- 横向蓝线（30px 间距，`#a8c8e0`）
- 左侧红色竖线边距（距左 54px）
- 左侧三孔（radial gradient 做出孔洞阴影）
- 字体 **Caveat**（Google Fonts 手写风）22px
- line-height 精确 = 32px 与横线对齐

**Writer 独特**：
- 今日日期 + "Today's Message" 手写标题
- Prompt（"What moved through you today?"）斜体灰色提示
- Textarea 占 240px 最小高度
- 字数计数器（≥500 字变红警告 —— 但不阻止提交）
- Submit + Cancel 按钮
- 支持三种模式（通过 `openWriter(date, opts)` 切换）：
  - **Today**：默认，空 textarea，按钮显示 "Seal the bottle"
  - **Edit**（从 Reader 的 "Add to this letter" 进入）：textarea 预填入原文 + 换行空行，光标停在末尾方便继续写；按钮改为 "Reseal the bottle"；保存时保留原 `createdAt`，加 `updatedAt`
  - **Retroactive**（点击过去的空瓶）：空 textarea，标题后缀 "· Retroactive"

**Reader 独特**：
- 顶部历史日期 + 阴历（可选）
- 正文是不可编辑的 pre-wrap 文本
- 如果有 `updatedAt`，副标题显示 "sealed HH:MM · last edited HH:MM"
- 底部显示 sentiment 分析（resonance：文字与身体数据是否一致）
- **仅当天的瓶子**显示 "✎ Add to this letter" 按钮（点击后关闭 Reader、打开 Writer 的 Edit 模式）
- 过去的瓶子：`.bottle-reader.locked` 隐藏编辑按钮，只有 Close

### 数据结构

```js
bottles[date] = {
  text: string,         // 当前内容（Edit 模式下会被覆盖）
  createdAt: number,    // 首次封瓶时间戳，Edit 时保持不变
  updatedAt?: number,   // 如果被编辑过，记录最后编辑时间；仅存在于编辑过的瓶子
  resonance: 'neutral' | 'body_stronger' | 'words_stronger',
}
```

### Resonance / 共振分析

提交时调用 Claude API 分析：

```
Prompt: 给定今日身体数据 {readiness: 70, sleep: 60, activity: 40},
用户写了："{text}"
判断：文字情绪 vs 身体数据状态是否一致？
返回: { resonance: "aligned" | "mismatch" | "neutral", note: "一句话解读" }
```

例：身体疲惫（sleep 低）但用户写了开心的事 → mismatch，note 可能是
"Your words brim while your body asks for rest."

这是作品对"身心分离"的诗意观察。

---

## Camera System / 相机系统

### 默认视角

**正对 Hokora 的正面**（这是每次打开场景的画面）：

```js
target: new Vector3(2.4, 0.85, 9.2)   // 神龛高度
radius: 4.5
theta: 2.27                            // ≈ 130° 绕到神龛正面
phi: 1.35                              // 略微仰视
```

Hokora 旋转了 `-0.7` 弧度，它的正面朝向世界方向 `(-0.644, 0, 0.765)`，
所以相机从 `(2.4-2.58, 0.85, 9.2+3.06)` 看向神龛。

### 电影化开场（每日首次访问）

1. 超近距离正面仰视 shrine（radius 2.8, phi 1.42）
2. 3 秒内缓慢拉到中距（radius 3.5, phi 1.38）
3. 3 秒再拉到默认视角（radius 4.5）

### 交互

- 左键拖动: orbit rotate
- 右键拖动: pan
- 滚轮: zoom（radius 2.5–22）
- WASD / 方向键: 平移相机
- 底部 nav-pad: ▲◀⊙▶▼ 按钮
- Double-click 珊瑚撮: 俯冲到那一撮
- Double-click 空白: 缩回默认

---

## Data Flow / 数据流

### 开发期（离线）

```
generateMockDays(30)
  → 30 天相关性随机游走 + deriveReadiness(data)
  → 存 localStorage 'garden:days'
  → buildDayCluster 用假数据
```

`deriveReadiness(data)` 从 7 个指标加权算 0–100 的综合分：sleep/hrv/activity/
deepSleep 各占 15–20%，rhr 反向归一，temp/resp 用"离基线稳定度"而非原始值。
这个 readiness 字段只是派生，不驱动珊瑚，但 omikuji 评分和 signature hash 用它。

### 生产期 · Oura PAT（已实现）

走 `src/data/ouraClient.js`，用户在 UI 里粘一次 PAT 就自动工作：

1. UI 点击右上角 `CONNECT OURA` → 弹 PAT 输入 modal
2. PAT 存到 `localStorage['garden:oura-token']`（client-only，不上传任何后端）
3. `fetchOuraDays(30)` 并行调 4 个 endpoint：`daily_sleep` / `sleep` /
   `daily_activity` / `daily_readiness`
4. 按 `.day` 字段合并，每天产出 `{date, data, source: 'oura'}`
5. 覆写 `days[]`，设 `dataSource = 'oura'`，`buildGarden()` 重建
6. 再次点击同一按钮变成 `REFRESH FROM OURA`（直接调 fetch，不再弹 modal）
7. 如果 401（token 失效），自动 `clearOuraToken()` 并重开 modal

**CORS 风险**：Oura v2 对浏览器 PAT 直连没官方承诺。实测有时 OK，有时被
CORS 拦。备选（按优先级）：
- 本地开发：装 `Allow CORS` 扩展
- 正式部署：加一个 Vercel Serverless Function 做 `/api/oura-proxy` 代理，
  把 Authorization header 从 function 端注入

### 生产期 · OAuth 2.0（未来）

PAT 够做演示和个人使用，但多用户（展示给导师/同学）需要 OAuth：
- 部署后端（Vercel Function）完成 OAuth 握手
- 前端 redirect 到 Oura 授权页 → 拿到 code → backend 换 access_token →
  用 httpOnly cookie 存在 backend side
- 前端直接调 backend proxy，不再自管 token

### 每日首次访问行为（当前实现）

1. `loadDays()` 读 localStorage `garden:days`（有就用，判断是否带新的
   7-metric schema；不带就重新 mock）
2. `preloadAllCorals()` 并行加载 7 个珊瑚 GLB（并更新 loading 屏副标题）
3. Hokora GLB 异步加载（进度条独立于 loading 屏）
4. `buildGarden()` 拿 days 构建 30 个 cluster
5. 1.2s 后 loading 屏淡出 + 触发电影化开场
6. 用户若已连过 Oura，按钮显示 `REFRESH FROM OURA`；否则 `CONNECT OURA`

---

## Bio Panel & Data Source / 身体数据面板

右上角的 `.bio-panel` 展示 7 个当前指标。关键行为：

- **标题切换**：Mock 数据显示 "Today · YYYY-MM-DD"；Oura 连接后自动切到
  "Yesterday · YYYY-MM-DD"（因为 today 的 sleep session 通常没同步）
- **来源标记**：副标题 `#bio-source` 显示 "mock reading" 或 "via oura
  ring · live data"（jade 绿色），错误时变 "fetching…" 或错误红色
- **按钮自适应**：`#oura-btn` 在未连接时显示 `◈ CONNECT OURA`，已连接
  显示 `◈ REFRESH FROM OURA`。`updateMetricsPanel()` 每次重算

**全局状态**：`let dataSource = 'mock' | 'oura'`。`loadDays()` 从
localStorage 读取时通过检查 `days.some(d => d.source === 'oura')` 自动
推断当前来源。

**当前选的"最近完整日"逻辑**（`latestCompleteDay(days)` in ouraClient.js）：
遍历 days 倒序，返回第一个 `date < today` 的；都找不到就返回最新那个。
Oura 场景下通常命中昨天；mock 场景下 updateMetricsPanel 直接用
`days[last]`（today）。

**与 Do-Not #7 的张力**：面板展示数字（如 "Sleep 82 / RHR 62"）跟"不展示
数字化身体数据"的原则有冲突。这是**被接受的例外**，理由：课程评审/演示
需要观众能看到数据驱动确实发生了。展示主体（珊瑚礁）仍是"感觉数据"；
bio-panel 是辅助 debug/演示面板。若要彻底符合原则，后续可把数字改成
微型可视化（心跳脉点、HRV 波线、sleep 月相进度等）。

---

## Fonts / 字体

从 Google Fonts 加载：

```html
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Ma+Shan+Zheng&family=Noto+Serif+SC:wght@300;400;500&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet">
```

- **Caveat** → 手写（瓶中文字）
- **Cormorant Garamond** → 衬线英文（UI、签文副标题）
- **Ma Shan Zheng** → 中文毛笔楷书（签文主文字、等级）
- **ZCOOL XiaoWei** → 中文优雅宋（签诗）
- **Noto Serif SC** → 中文 fallback

---

## Known Constraints / 已知限制

- artifact 环境单文件 HTML 有大小限制（搬到本地后解除）
- `writing-mode: vertical-rl` 在 Safari 某些版本对中文支持略差（大部分 OK）
- InstancedMesh 内所有实例必须共享同一 geometry 和 material（鱼群用这个，性能好）
- 鱼的 6 个物种**各自一个 InstancedMesh**（不同 geometry/material），各自享受
  instancing 性能；跨物种不共享
- localStorage 上限约 5–10MB（瓶信 + 签文缓存 + 30 天 days + Oura PAT 都在
  这里；短期够用，扩展到多月需迁 IndexedDB）
- 浏览器 CORS：不能 `file://` 直接打开 index.html，必须用 dev server
  （`python -m http.server 8000` 或 `npx serve .`），因为
  `<script type="module">` + 外部 import (`./src/data/ouraClient.js`) 需要 HTTP
- Oura API CORS：v2 官方没对浏览器 PAT 直连承诺。实测时成时不，失败的
  workaround 是浏览器 CORS 扩展（开发）或 Vercel Serverless Proxy（部署）
- GLB 的原点位置**不可假设**。用户从 Sketchfab 下载的模型原点各异（有的
  质心，有的基座，有的关节）。`loadCoralTemplate` 的 wrapper pattern 假设
  `bbox.min.y` 就是基座底 —— 对 99% 向上长的珊瑚 OK，但若某个 GLB 下部
  有延伸（虚拟根、底座岩石），会露出本不该露的部分。届时在 Blender 里
  裁切或调整 origin 比改代码简单

---

## Absolute Do-Nots / 绝对不要做的

每次改动前自检：

1. ❌ **不要**把鱼改成高饱和彩虹色
2. ❌ **不要**让 god rays 用 AdditiveBlending（会变刺眼阳光）
3. ❌ **不要**在 UI 里用 emoji 装饰（破坏极简美学）
4. ❌ **不要**把珊瑚做成对称/规则排列（生态感消失）
5. ❌ **不要**把签文做成卡通/俏皮风（严肃的文化装置）
6. ❌ **不要**在签文界面加"share"、"like"等社交按钮（这是私人仪式）
7. ❌ **不要**把身体数据以数字形式显示在**主场景**里（海底礁是"感觉数据"，
   不是"读取数据"）。**例外**：右上角的 `.bio-panel` 作为课程演示/debug
   辅助面板可展示数字，但它是独立 HUD，不能侵入 3D 场景。签文里也绝不
   出现原始数字。
8. ❌ **不要**改变 Hokora 的基本功能：它是签文入口，不能变成装饰物
9. ❌ **不要**删除开场电影化镜头（这是每日仪式的一部分）
10. ❌ **不要**让珊瑚随时间动画（如摇摆）—— 它们是 ledger 上的记录，静态是本质
11. ❌ **不要**允许编辑过去日期的瓶子 —— 只有当天的瓶子在当日时间窗口内可追加/修改，跨日后必须只读。身体账本不可追溯篡改是核心叙事。

---

## TODO List / 未来要做的

按优先级：

### P0（必做）
- [ ] 迁移到本地 Vite 项目结构（package.json / vite.config.js / 拆分 src/*）
- [x] 压缩 Hokora GLB 到 <5MB，替换手搭神龛（2.6MB, meshopt + webp）
- [x] 获取/制作 7 个珊瑚 GLB 模型（all in `assets/models/`）
- [x] 写 coralLoader，加载 GLB 缓存 + clone（`loadCoralTemplate` wrapper pattern）
- [x] 改写 buildDayCluster 用 GLB 模型（7 株圆周 + CLUSTER_LAYOUT）
- [x] 加载进度条（loading-sub 显示 "growing the reef · N / 7 · key"）

### P1（重要）
- [x] Oura API 接入（PAT 版已在 `src/data/ouraClient.js`）
- [ ] Oura OAuth 接入（多用户 / 部署版本；走 Vercel Serverless Function）
- [ ] Oura CORS proxy（Vercel Function `/api/oura-proxy`，CORS fail 时备选）
- [ ] Resonance 分析的 Claude API 调用（骨架已在 `computeResonance`）
- [ ] 真正的时间系统上线（移除 FORCE_NOON）
- [ ] 数据迁移到 IndexedDB（当前 localStorage 上限 5–10MB，30 天数据够用，但
      扩展到多月需要迁）

### P2（加分）
- [ ] 环境音效（轻柔海流声，可关闭）
- [ ] PWA 离线访问
- [ ] 签文可保存为图片分享（但不是社交按钮，而是"save to album"）
- [ ] 部署到 Vercel / GitHub Pages
- [ ] 阴历日期显示
- [ ] bio-panel 数字 → 微型可视化（让它真正符合"感觉数据"原则）

### P3（远期）
- [ ] 多用户支持（导师、朋友有自己的礁）
- [ ] 跨年时间线：浏览 365 天的一整年礁
- [ ] 导出 30 天为一张长卷（印刷用）

---

## Personal Notes / 个人笔记

- Lorriane's typical sleep score: 78 ± 8
- Typical RHR: 62 ± 4 bpm
- Typical HRV: ~55 ms
- 课程：Multimedia Web Design
- 课程 deliverable：工作的 Web 应用 + 设计文档 + 课堂演示
- 评分维度（推测）：技术实现、交互设计、视觉完成度、概念深度、创新性
- 演示时可重点展示：身体数据如何实时驱动 3D 场景 / 签文系统的东亚文化语法 / 30 天 ledger 的时间叙事

---

## How to Talk to Claude / 与 Claude 协作的方式

- **改动前先 `/init` 一次**（首次使用）让 Claude 熟悉整个代码库
- **上下文长时用 `/compact`** 压缩历史
- **涉及核心设计决策时**（如更换珊瑚种类、改颜色系统），先让 Claude
  参考 CLAUDE.md 的设计原则部分
- **调试视觉问题**：最好启动本地 dev server，让 Claude 看屏幕截图
  （VS Code 里可以直接附加图片）
- **不确定要不要改时**：先让 Claude 描述改动的视觉后果，而不是直接改

---

*Last updated: 2026-04-22 (Oura PAT integration, GLB loader architecture, 7-species cluster migration)*
