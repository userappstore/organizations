/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/organizations/membership', () => {
  it('should require an administrator', TestHelper.requireAdministrator('/api/administrator/organizations/membership'))
  it('should require a membershipid', TestHelper.requireParameter('/api/administrator/organizations/membership', 'membershipid'))
  describe('Membership#GET', () => {
    it('should return membership data', async () => {
      const administrator = await TestHelper.createAdministrator()
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      await TestHelper.createMembership(owner, owner.organization.organizationid)
      const req = TestHelper.createRequest(`/api/administrator/organizations/membership?membershipid=${owner.membership.membershipid}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const membership = await req.route.api.get(req)
      assert.notEqual(membership, null)
      assert.notEqual(membership.membershipid, null)
    })

    it('should redact membership code', async () => {
      const administrator = await TestHelper.createAdministrator()
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      await TestHelper.createMembership(owner, owner.organization.organizationid)
      const req = TestHelper.createRequest(`/api/administrator/organizations/membership?membershipid=${owner.membership.membershipid}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const membership = await req.route.api.get(req)
      assert.notEqual(membership, null)
      assert.notEqual(membership.membershipid, null)
      assert.equal(membership.code, null)
    })
  })
})
