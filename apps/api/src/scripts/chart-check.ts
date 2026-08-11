import assert from 'node:assert'
import { chartForTool } from '../modules/admin-assistant/tools.ts'

const c1 = chartForTool('agent_stats', {
  total: 3,
  topAgents: [
    { name: 'A', conversations: 10, messages: 40 },
    { name: 'B', conversations: 5, messages: 12 },
  ],
})
assert.equal(c1?.type, 'bar')
assert.deepEqual(c1?.labels, ['A', 'B'])
assert.equal(c1?.series?.[0].values[0], 10)

const c2 = chartForTool('conversation_stats', { byChannel: { web: 8, api: 2 } })
assert.equal(c2?.type, 'pie')
assert.deepEqual(c2?.items, [
  { name: 'web', value: 8 },
  { name: 'api', value: 2 },
])

assert.equal(chartForTool('user_stats', { total: 5 }), null)
assert.equal(chartForTool('agent_stats', { topAgents: [] }), null)
assert.equal(chartForTool('agent_stats', { topAgents: 'nope' }), null)
assert.equal(chartForTool('agent_stats', null), null)

console.log('chartForTool OK')