const API_KEY = 'YOUR_API_KEY'
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'
const MODEL = 'Qwen/Qwen2.5-7B-Instruct'
const USE_CLOUD_FUNCTION = true

const TYPES = {
  friend: { name: '朋友圈', emoji: '📱', desc: '轻松有趣的朋友圈文案' },
  xiaohongshu: { name: '小红书', emoji: '📕', desc: '种草风格的小红书笔记' },
  douyin: { name: '抖音', emoji: '🎵', desc: '吸睛的短视频脚本' },
  weibo: { name: '微博', emoji: '💬', desc: '简短有力的微博文案' }
}

const SYSTEM_PROMPT = `你是一个顶尖的社交媒体文案创作者，曾为多个百万粉丝账号撰写内容。你的文案特点是：
- 语言自然流畅，像朋友聊天一样真实，绝不用"真的绝了""太棒了"等低质量感叹词
- 善用细节描写制造画面感，让读者身临其境
- 懂得制造情绪共鸣，引发读者的认同感或好奇心
- 排版干净舒服，emoji使用克制精准
- 每篇文案都有一个让人忍不住读下去的开头`

const PROMPTS = {
  friend: (topic, keywords, style) =>
    `请为以下主题写一条朋友圈文案：

主题：${topic}
${keywords ? '关键词：' + keywords : ''}
风格要求：${style}

写作要求：
1. 开头要有画面感或悬念，不要用"今天""分享一下"这类平淡开头
2. 用具体细节代替抽象描述（比如不说"很开心"，而是描写让开心的那个瞬间）
3. 控制在3-5行，短而有力
4. emoji最多用2-3个，放在关键位置
5. 结尾可以留一个让人想评论的小钩子
6. 不要加#话题标签#，朋友圈不需要

参考风格示例：
"咖啡凉了第三杯，窗外的雨还没停。
有些事就是这样，急不来。"

直接输出文案，不要任何解释。`,

  xiaohongshu: (topic, keywords, style) =>
    `请为以下主题写一篇小红书笔记：

主题：${topic}
${keywords ? '关键词：' + keywords : ''}
风格要求：${style}

写作要求：
1. 标题：用数字+痛点/好奇心，比如"3个方法让我从月薪3k到3w"
2. 开头：用一个真实场景或反常识观点切入，不要用"姐妹们！！"这种老套路
3. 正文：分3-5个小段，每段一个小标题+具体内容，要有干货感
4. 结尾：总结+互动引导（比如"你们还有什么好方法？评论区聊聊"）
5. 话题标签：3-5个，混搭热门标签和精准标签
6. 总字数300-500字

直接输出笔记，不要任何解释。`,

  douyin: (topic, keywords, style) =>
    `请为以下主题写一个抖音短视频脚本：

主题：${topic}
${keywords ? '关键词：' + keywords : ''}
风格要求：${style}

写作要求：
1. 【标题】吸引点击的标题（15字内）
2. 【开头hook 0-3秒】用冲突/悬念/反常识抓住注意力，比如"我花了3000块学到的教训"
3. 【正文 3-25秒】分2-3个要点，每个要点配画面描述+口播文案
4. 【结尾 25-30秒】总结金句+行动号召（关注/收藏/评论）
5. 标注每个部分的画面和口播

格式示例：
【标题】xxx
【画面】xxx
【口播】xxx

直接输出脚本，不要任何解释。`,

  weibo: (topic, keywords, style) =>
    `请为以下主题写一条微博：

主题：${topic}
${keywords ? '关键词：' + keywords : ''}
风格要求：${style}

写作要求：
1. 140字以内，精炼有力
2. 开头抓眼球，可以用提问/反转/金句
3. 有态度有观点，不要泛泛而谈
4. 加1-2个相关话题标签
5. emoji点缀1-2个即可

直接输出文案，不要任何解释。`
}

function generateCopy(type, topic, keywords, style) {
  if (USE_CLOUD_FUNCTION && wx.cloud && typeof wx.cloud.callFunction === 'function') {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'generateCopy',
        data: { type, topic, keywords, style },
        success: res => {
          const result = res?.result || {}
          if (result.success && result.content) {
            resolve(result.content)
          } else {
            reject(new Error(result.error || '云函数返回异常'))
          }
        },
        fail: reject
      })
    })
  }

  if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
    return Promise.reject(new Error('请配置云函数，或仅在本地调试时配置 API Key'))
  }

  return new Promise((resolve, reject) => {
    const promptFn = PROMPTS[type] || PROMPTS.friend
    wx.request({
      url: API_URL,
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptFn(topic, keywords, style || '轻松幽默') }
        ],
        max_tokens: 1000,
        temperature: 0.85,
        top_p: 0.9
      },
      timeout: 30000,
      success: res => {
        if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
          resolve(res.data.choices[0].message.content.trim())
        } else {
          reject(new Error('API返回异常'))
        }
      },
      fail: err => reject(err)
    })
  })
}

function saveHistory(record) {
  const history = wx.getStorageSync('copy_history') || []
  record.id = Date.now()
  record.time = new Date().toLocaleString('zh-CN')
  history.unshift(record)
  if (history.length > 100) history.pop()
  wx.setStorageSync('copy_history', history)
  return record
}

function getHistory() {
  return wx.getStorageSync('copy_history') || []
}

function clearHistory() {
  wx.removeStorageSync('copy_history')
}

module.exports = { TYPES, generateCopy, saveHistory, getHistory, clearHistory }
