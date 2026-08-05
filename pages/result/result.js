const api = require('../../utils/api')

Page({
  data: { record: {} },
  onLoad(options) {
    const history = api.getHistory()
    const record = history.find(r => r.id == options.id)
    if (record) this.setData({ record })
  },
  copyText() {
    wx.setClipboardData({
      data: this.data.record.content,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    })
  },
  onShareAppMessage() {
    return { title: 'AI文案助手 - 一键生成' + this.data.record.typeName, path: '/pages/index/index' }
  },
  goBack() { wx.navigateBack() }
})