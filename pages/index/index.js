const api = require('../../utils/api')

Page({
  data: {
    types: Object.entries(api.TYPES).map(([key, v]) => ({ key, ...v })),
    styles: ['轻松幽默', '文艺清新', '专业正式', '情绪共鸣', '悬念吸引'],
    currentType: 'friend',
    currentStyle: '轻松幽默',
    topic: '',
    keywords: '',
    loading: false
  },

  selectType(e) { this.setData({ currentType: e.currentTarget.dataset.key }) },
  selectStyle(e) { this.setData({ currentStyle: e.currentTarget.dataset.style }) },
  onTopic(e) { this.setData({ topic: e.detail.value }) },
  onKeywords(e) { this.setData({ keywords: e.detail.value }) },

  async generate() {
    const { currentType, topic, keywords, currentStyle } = this.data
    if (!topic.trim()) return wx.showToast({ title: '请输入主题', icon: 'none' })

    this.setData({ loading: true })
    try {
      const content = await api.generateCopy(currentType, topic, keywords, currentStyle)
      const record = api.saveHistory({
        type: currentType, typeName: api.TYPES[currentType].name,
        topic, keywords, style: currentStyle, content
      })
      wx.navigateTo({ url: '/pages/result/result?id=' + record.id })
    } catch (err) {
      wx.showToast({ title: '生成失败，请重试', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})