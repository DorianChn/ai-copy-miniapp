<div align="center">

# ✨ AI文案助手

**一款基于 AI 的多平台文案生成微信小程序**

![微信小程序](https://img.shields.io/badge/微信小程序-原生-blue)
![AI模型](https://img.shields.io/badge/AI模型-Qwen2.5--7B-green)
![API](https://img.shields.io/badge/API-SiliconFlow-orange)
![免费](https://img.shields.io/badge/费用-永久免费-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

<br/>

📱 **朋友圈** · 📕 **小红书** · 🎵 **抖音** · 💬 **微博**

一键生成高质量文案，告别写作焦虑

</div>

---

## 📸 界面预览

<div align="center">
  <img src="https://img.shields.io/badge/首页-选择类型-blue" />
  <img src="https://img.shields.io/badge/输入-主题与关键词-green" />
  <img src="https://img.shields.io/badge/结果-AI生成-orange" />
  <img src="https://img.shields.io/badge/历史-记录保存-purple" />
</div>

---

## ✨ 功能特性

| 功能 | 说明 |
|:---|:---|
| 🎯 **多平台支持** | 朋友圈、小红书、抖音、微博，四大平台一键切换 |
| 🤖 **AI 驱动** | 基于 Qwen2.5-7B 大模型，生成自然流畅的文案 |
| 🎨 **风格自选** | 轻松幽默、文艺清新、专业正式、情绪共鸣、悬念吸引 |
| 📋 **一键复制** | 生成后直接复制，粘贴到任何地方 |
| 📤 **分享功能** | 支持转发给好友 |
| 📝 **历史记录** | 自动保存，随时查看之前的生成结果 |
| 💰 **完全免费** | SiliconFlow 提供永久免费模型，零成本运行 |

---

## 🚀 快速开始

> **安全提示**：本项目把请求直接从小程序发送到模型 API，适合个人本地预览。不要把真实 API Key 提交到 Git 或发布到面向公众的小程序；生产使用应通过自己的后端代理、短期凭证或服务端密钥管理来转发请求。

### 前置条件

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [微信小程序账号](https://mp.weixin.qq.com/)（个人即可，免费注册）

### 1️⃣ 克隆项目

```bash
git clone https://github.com/DorianChn/ai-copy-miniapp.git
cd ai-copy-miniapp
```

### 2️⃣ 导入项目

1. 打开微信开发者工具
2. **导入项目** → 选择 `ai-copy-miniapp` 文件夹
3. 填入你的小程序 **AppID**
4. 后端服务选择 **不使用云服务**

### 3️⃣ 配置 API（仅本地调试）

1. 注册 [SiliconFlow](https://siliconflow.cn)（免费）
2. 获取 API Key
3. 仅在本地调试时编辑 `utils/api.js` 中的占位符：

```javascript
const API_KEY = 'sk-你的key'
```

⚠️ 小程序端的请求头会被用户看到，API Key 不能视为秘密。不要把真实密钥提交到 Git、发布到公开小程序或用于生产；生产请使用云函数，并在云函数环境变量中配置 `SILICONFLOW_API_KEY`。示例见 [`cloudfunctions/generateCopy/.env.example`](cloudfunctions/generateCopy/.env.example)。

如果历史上曾把密钥提交到仓库，请先在 SiliconFlow 控制台撤销并重新生成，再部署云函数；只删除当前文件不能清除 Git 历史中的旧密钥。

### 4️⃣ 配置请求域名

登录 [微信公众平台](https://mp.weixin.qq.com/)：

```
开发管理 → 开发设置 → 服务器域名 → request合法域名
添加：https://api.siliconflow.cn
```

### 5️⃣ 运行

在开发者工具中点击 **编译** → 预览即可。

---

## 📂 项目结构

```
ai-copy-miniapp/
├── pages/
│   ├── index/          # 🏠 首页 - 选择类型 + 输入主题
│   ├── result/         # 📄 结果页 - 查看 + 复制文案
│   └── history/        # 📚 历史记录
├── utils/
│   └── api.js          # 🔌 API 接口 + Prompt 模板
├── images/             # 🎨 Tab 图标
├── app.js              # 应用入口
├── app.json            # 应用配置
├── app.wxss            # 全局样式
└── project.config.json # 项目配置
```

---

## 🧠 Prompt 设计

每个平台都有专属的 Prompt 模板，针对平台特性优化：

| 平台 | 核心策略 |
|:---|:---|
| **朋友圈** | 画面感开头 + 细节描写 + 情绪钩子，禁止话题标签 |
| **小红书** | 数字+痛点标题 + 干货分段 + 互动引导 + 精准标签 |
| **抖音** | 冲突式hook + 分镜头脚本 + 行动号召 |
| **微博** | 精炼观点 + 态度表达 + 热门话题 |

---

## 💡 技术栈

- **前端**：微信原生小程序（WXML + WXSS + JS）
- **AI 模型**：Qwen/Qwen2.5-7B-Instruct（SiliconFlow 提供）
- **API**：OpenAI 兼容格式（`/v1/chat/completions`）
- **存储**：本地 Storage（历史记录）

---

## 🔧 自定义

### 更换模型

在 `utils/api.js` 中修改：

```javascript
const MODEL = 'Qwen/Qwen2.5-7B-Instruct'  // 免费模型
// 或付费模型，效果更好：
// const MODEL = 'deepseek-ai/DeepSeek-V3'
```

### 添加新平台

在 `utils/api.js` 的 `TYPES` 和 `PROMPTS` 中添加新条目即可。

---

## 📄 License

[MIT](LICENSE) © [DorianChn](https://github.com/DorianChn)

---

<div align="center">

**如果觉得有用，点个 ⭐ Star 支持一下！**

</div>
