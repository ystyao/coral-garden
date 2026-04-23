# The Coral Garden — Claude Code 启动提示

复制以下内容，粘贴到 VS Code 里的 Claude Code 作为**第一条消息**。

---

## 准备工作（粘贴前先做完）

1. 在电脑上建好项目文件夹 `coral-garden/`
2. 下载来的文件放好：
   ```
   coral-garden/
   ├── CLAUDE.md                    ← 从 Claude artifact 下载的
   ├── index.html                   ← 从 Claude artifact 下载的（原 coral_garden.html 改名）
   └── assets/
       └── Haroka_3D_model.glb      ← 你上传过的那个 36MB 的文件
   ```
3. 在项目文件夹打开终端，运行 `claude` 启动 Claude Code
   （或在 VS Code 里用 Cmd/Ctrl+Esc 打开 Claude Code 面板，已在 coral-garden 工作区）

---

## 第一条消息（直接复制下面的内容）

```
你好。请先读一下项目根目录下的 CLAUDE.md，这是这个项目的完整设计文档。

我是 Lorriane，这是我 Multimedia Web Design 课程的 final project
The Coral Garden。之前在 Anthropic claude.ai 的 artifact 环境里迭代了很多轮，
现在要迁移到本地继续开发。

请先用中文回复我一个简短的"项目理解确认"，大概 4-5 句话，证明你读懂了：
1. 这个作品是做什么的（生物数据 → 海底珊瑚礁）
2. 7 种身体数据分别对应哪 7 种珊瑚（不用全列，说 2-3 个例子）
3. 你理解为什么鱼不能做成高饱和彩虹色
4. 你理解"矛盾的一天"的叙事价值

确认后，请给我一份迁移路线图：

【Phase 1：项目结构化】
把当前单文件 index.html（大约 3000 行）按 CLAUDE.md 里的 src/ 结构拆分成模块。
用 Vite 搭建本地开发环境。帮我生成 package.json、vite.config.js、.gitignore 等
必要配置。但现在先不要动 index.html 的代码逻辑，只做文件组织和 build 配置。

【Phase 2：Hokora 模型替换】
assets/Haroka_3D_model.glb 是 36MB 的高精度模型（860k 三角形），需要压缩。
请指导我用 @gltf-transform/cli 压缩到 <5MB（Draco + WebP + decimation）。
然后替换 index.html 里现在手搭的 Hokora 代码段（搜 "Hokora shrine" 找到），
用 GLTFLoader 加载压缩后的 GLB。保留原有位置 (2.4, 0.4, 9.2)、旋转 -0.7、
点击触发签文的交互逻辑。

【Phase 3：7 种珊瑚 GLB 整合】
参考 CLAUDE.md 的「珊瑚生长表现谱」一节，我需要 7 个珊瑚 GLB 模型。
请告诉我：
- 哪些免费资源网站有科学准确的珊瑚 3D 模型（Sketchfab CC0 标签、
  Smithsonian 3D Voyager 等）
- 如何用 Blender 给每个 GLB 添加 child mesh 分级（表示 4 个生长状态）
- 如果找不到现成的，能不能用 AI 工具（如 Meshy、Tripo）生成

Phase 3 先不实际动代码，只给我资源清单和操作流程。我先去收集模型。

【Phase 4+ 后续】
- 真实时间的光影系统（去掉 FORCE_NOON）
- Oura OAuth 后端
- 部署到 Vercel
这些后面单独处理。

请先回复【项目理解确认】+ 【Phase 1 的具体执行步骤】，不要一下子全做完。
每做完一个阶段让我 review 再推进下一步。
```

---

## 接下来的工作节奏

每次开新的会话，用以下模板：

### 模式 A：明确任务
```
请做 X。要求：
- 遵守 CLAUDE.md 的设计原则
- 不要违反 "Absolute Do-Nots" 清单
- 完成后告诉我要 refresh 哪些文件来预览
```

### 模式 B：探索性讨论
```
我在想 Y。你觉得这个改动会破坏 CLAUDE.md 里的哪些原则？
先别写代码，给我 3 个备选方案 + 各自的利弊。
```

### 模式 C：Debug
```
浏览器 console 报错：[粘贴错误]
相关文件：src/corals/coralLoader.js
帮我定位问题并修复。
```

---

## 重要 tips

**1. 让 Claude 读图**
VS Code 里可以直接拖拽图片到 Claude Code 对话框。比如你看到 Hokora 渲染效果不对，截屏拖进去，问"对比 CLAUDE.md 提到的参考图，现在这个屋顶哪里不对？"

**2. 用斜杠命令**
- `/compact` —— 对话太长时压缩上下文（类似你在 artifact 里用的 "Continue"）
- `/clear` —— 完全清空上下文，准备开新话题（CLAUDE.md 仍会自动加载）
- `/context` —— 查看当前加载了哪些文件

**3. git 尽早用起来**
```bash
cd coral-garden
git init
git add .
git commit -m "Initial migration from artifact"
```
之后每做一个 Phase 提交一次。Claude Code 做错了可以 `git reset --hard`。

**4. 预览方式**
```bash
npm run dev    # Vite 启动 dev server
# 浏览器打开 http://localhost:5173
```
Claude Code 写完代码后，浏览器 refresh 就能看到。如果没反应，看浏览器 console 有没有报错，把报错截图或粘贴给 Claude Code。

**5. 大文件放 .gitignore**
GLB 模型文件可能很大，建议：
```
# .gitignore
node_modules/
dist/
assets/models/*.glb.backup
# 保留压缩后的 glb 进 git，不保留原始高精度备份
```

---

## 如果 Claude Code 表现怪异

- 回复英文了 → 直接说："请继续用中文"
- 忽视了 CLAUDE.md 的某条原则 → 提醒："这违反了 CLAUDE.md 的 Do-Not 第 X 条，重做"
- 改动超出你的预期 → `git diff` 看它改了什么，不满意就 `git checkout .` 回退
- 上下文太混乱 → `/clear` 重来，CLAUDE.md 会重新加载，历史决策还在文档里

---

祝开发顺利！有问题随时可以回到 claude.ai 继续和我讨论高层设计决策，
具体执行层的事让 VS Code 里的 Claude Code 做。
