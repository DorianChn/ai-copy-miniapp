const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const axios = require('axios')

// ===== 配置 =====
const API_KEY = 'sk-lohwmzvwousmullttlacvqatgthlrvtspkoyeufxzodcyfvn'  // 替换为你的key
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL = 'Qwen/Qwen2.5-7B-Instruct'  // 免费模型

// ===== Prompt模板 =====
const PROMPTS = {
  friend: (topic, keywords, style) =>
    `你是一个朋友圈文案高手。请写一条朋友圈文案。

要求：
- 主题：${topic}
- 关键词：${keywords || '无特殊要求'}
- 风格：${style}
- 字数：50-150字
- 适当加emoji，不要太夸张
- 可以加1-2个话题标签
- 直接输出文案，不要任何解释`,

  xiaohongshu: (topic, keywords, style) =>
    `你是一个小红书爆款笔记写手。请写一篇小红书笔记。

要求：
- 主题：${topic}
- 关键词：${keywords || '无特殊要求'}
- 风格：${style}
- 开头要吸引人，用"姐妹们"或感叹句开头
- 分段清晰，用emoji做段落标记
- 结尾加3-5个相关话题标签（#xxx#格式）
- 字数200-400字
- 直接输出笔记，不要任何解释`,

  douyin: (topic, keywords, style) =>
    `你是一个抖音短视频脚本策划。请写一个短视频脚本。

要求：
- 主题：${topic}
- 关键词：${keywords || '无特殊要求'}
- 风格：${style}
- 分三部分：【开头hook（3秒）】【正文（15-30秒）】【结尾（3秒）】
- 开头要有悬念或冲突，吸引停留
- 结尾要有互动引导（点赞/收藏/关注）
- 标注画面和旁白
- 直接输出脚本，不要任何解释`,

  weibo: (topic, keywords, style) =>
    `你是一个微博文案写手。请写一条微博。

要求：
- 主题：${topic}
- 关键词：${keywords || '无特殊要求'}
- 风格：${style}
- 简短有力，140字以内
- 可以适当用表情
- 加1-2个话题标签
- 直接输出文案，不要任何解释`
}

exports.main = async (event) => {
  const { type, topic, keywords, style } = event

  // 参数校验
  if (!topic || !topic.trim()) {
    return { error: '请输入主题', content: '' }
  }

  const promptFn = PROMPTS[type] || PROMPTS.friend
  const prompt = promptFn(topic.trim(), keywords?.trim(), style || '轻松幽默')

  try {
    const res = await axios.post(API_URL, {
      model: MODEL,
      messages: [
        { role: 'system', content: '你是一个专业的文案创作者，擅长各种平台的内容创作。输出要自然、有吸引力、符合平台调性。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    })

    const content = res.data.choices?.[0]?.message?.content?.trim()
    if (!content) throw new Error('AI返回为空')

    return { content, success: true }

  } catch (err) {
    console.error('AI调用失败:', err.message)
    // 降级到本地模板
    return {
      content: getLocalTemplate(type, topic, keywords),
      success: true,
      fallback: true
    }
  }
}

function getLocalTemplate(type, topic, keywords) {
  const t = topic.trim()
  const k = keywords?.trim() || ''
  const templates = {
    friend: `\n🌞 ${t}\n\n${k ? '关键词：' + k + '\n' : ''}今天的快乐是${t}给的~\n生活嘛，就是要对自己好一点 ✨\n\n#${t.replace(/\s/g,'')} #日常碎片 #记录生活`,
    xiaohongshu: `\n📕 ${t} | 真的绝了！\n\n姐妹们！！${t}真的太棒了 🔥\n\n✨ 亮点：\n1️⃣ ${k || '超乎想象的好'}\n2️⃣ 体验感满分\n3️⃣ 性价比超高\n\n📝 详细分享：\n这次${t}的体验真的很惊喜～\n\n#${t} #好物推荐 #生活分享`,
    douyin: `\n🎬 短视频脚本：${t}\n\n【开头 - 3秒hook】\n"${t}，你绝对想不到..."\n\n【正文】\n画面：展示${t}的过程\n旁白：${k || '效果出乎意料'}\n\n【结尾】\n"真的太值了！点赞收藏~"\n\n#${t} #短视频`,
    weibo: `\n${t} ${k || ''}\n\n太！棒！了！不接受反驳 😎\n\n#${t}# #日常分享#`
  }
  return templates[type] || templates.friend
}
