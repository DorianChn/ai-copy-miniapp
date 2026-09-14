import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../utils/api.js', import.meta.url), 'utf8')

function loadApi(wx) {
  const module = { exports: {} }
  vm.runInNewContext(source, { module, exports: module.exports, wx })
  return module.exports
}

test('generateCopy uses the cloud function when available', async () => {
  let request
  const api = loadApi({
    cloud: {
      callFunction(options) {
        request = options
        options.success({ result: { success: true, content: '生成结果' } })
      }
    }
  })

  const content = await api.generateCopy('friend', '周末旅行', '海边', '轻松幽默')

  assert.equal(content, '生成结果')
  assert.deepEqual(JSON.parse(JSON.stringify(request.data)), {
    type: 'friend',
    topic: '周末旅行',
    keywords: '海边',
    style: '轻松幽默'
  })
})

test('generateCopy rejects unsuccessful cloud results', async () => {
  const api = loadApi({
    cloud: {
      callFunction(options) {
        options.success({ result: { success: false, error: '请输入主题' } })
      }
    }
  })

  await assert.rejects(
    api.generateCopy('friend', '', '', '轻松幽默'),
    /请输入主题/
  )
})
