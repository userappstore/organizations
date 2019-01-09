/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe('/api/user/organizations/memberships-count', async () => {
  describe('MembershipsCount#GET', () => {
    it('should count memberships', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner, { email: owner.profile.email, name: 'My organization' })
      const user = await TestHelper.createUser()
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      const owner2 = await TestHelper.createUser()
      await TestHelper.createOrganization(owner2, { email: owner2.profile.email, name: 'My organization' })
      await TestHelper.createMembership(user, owner2)
      const owner3 = await TestHelper.createUser()
      await TestHelper.createOrganization(owner3, { email: owner3.profile.email, name: 'My organization' })
      await TestHelper.createMembership(user, owner3)
      const req = TestHelper.createRequest(`/api/user/organizations/memberships-count?accountid=${user.account.accountid}`)
      req.account = user.account
      req.session = user.session
      const result = await req.get(req)
      assert.strictEqual(result, 3)
    })
  })
})