const api = require('../../utils/api')

Page({
  data: { list: [] },
  onShow() { this.setData({ list: api.getHistory() }) },
  viewItem(e) {
    wx.navigateTo({ url: '/pages/result/result?id=' + e.currentTarget.dataset.id })
  },
  clearAll() {
    wx.showModal({
      title: '确认清空', content: '删除所有历史记录？',
      success: res => {
        if (res.confirm) {
          api.clearHistory()
          this.setData({ list: [] })
        }
      }
    })
  }
})