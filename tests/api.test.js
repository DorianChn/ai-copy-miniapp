const assert = require('node:assert/strict')
const test = require('node:test')

let storedHistory
global.wx = {
  getStorageSync: () => storedHistory,
  setStorageSync: (_key, value) => { storedHistory = value },
  removeStorageSync: () => { storedHistory = undefined }
}

const api = require('../utils/api')

test.afterEach(() => {
  storedHistory = undefined
})

test('normalizeHistory ignores corrupt storage values and malformed records', () => {
  const valid = { id: 1, content: 'hello' }

  assert.deepEqual(api.normalizeHistory({ id: 1, content: 'not an array' }), [])
  assert.deepEqual(api.normalizeHistory([valid, null, [], 'invalid', { id: 2 }]), [valid])
})

test('getHistory returns only usable records without overwriting raw storage', () => {
  const valid = { id: 'saved', content: 'hello' }
  storedHistory = [valid, { id: 'missing-content' }]

  assert.deepEqual(api.getHistory(), [valid])
  assert.deepEqual(storedHistory, [valid, { id: 'missing-content' }])
})

test('saveHistory recovers from a non-array value and does not mutate its input', () => {
  storedHistory = { corrupted: true }
  const input = { type: 'friend', content: 'hello' }

  const saved = api.saveHistory(input)

  assert.deepEqual(input, { type: 'friend', content: 'hello' })
  assert.equal(saved.content, 'hello')
  assert.equal(storedHistory.length, 1)
  assert.deepEqual(storedHistory[0], saved)
})

test('normalizeHistory retains the newest 100 entries', () => {
  const records = Array.from({ length: 105 }, (_, id) => ({ id, content: String(id) }))

  const normalized = api.normalizeHistory(records)

  assert.equal(normalized.length, 100)
  assert.equal(normalized[0].id, 0)
  assert.equal(normalized.at(-1).id, 99)
})
