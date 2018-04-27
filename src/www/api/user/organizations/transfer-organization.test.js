/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/user/organizations/transfer-organization', () => {
  it('should require a user', TestHelper.requireAccount('/api/user/organizations/transfer-organization'))
  it('should require an organizationid', TestHelper.requireParameter('/api/user/organizations/transfer-organization', 'organizationid'))
  describe('TransferOrganization#PATCH', () => {
    it('should require own organization', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const other = await TestHelper.createUser()
      await TestHelper.createOrganization(other)
      const req = TestHelper.createRequest(`/api/user/organizations/transfer-organization?organizationid=${other.organization.organizationid}`, 'PATCH')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        accountid: other.account.accountid
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-organization')
      }
    })

    it('should require new owner is member', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/api/user/organizations/transfer-organization?organizationid=${owner.organization.organizationid}`, 'PATCH')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        accountid: user.account.accountid
      }
      try {
        await req.route.api.patch(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-accountid')
      }
    })

    it('should lock session for authorization', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      await TestHelper.createMembership(user, owner.organization.organizationid)
      const req = TestHelper.createRequest(`/api/user/organizations/transfer-organization?organizationid=${owner.organization.organizationid}`, 'PATCH')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        accountid: user.account.accountid
      }
      await req.route.api.patch(req)
      const req2 = TestHelper.createRequest(`/api/user/session?sessionid=${owner.session.sessionid}`, 'GET')
      req2.account = owner.account
      req2.session = owner.session
      const sessionNow = await req2.route.api.get(req2)
      assert.equal(sessionNow.lockURL, `/api/user/organizations/transfer-organization?organizationid=${owner.organization.organizationid}`)
    })

    it('should transfer organization after authorization', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      await TestHelper.createMembership(user, owner.organization.organizationid)
      const req = TestHelper.createRequest(`/api/user/organizations/transfer-organization?organizationid=${owner.organization.organizationid}`, 'PATCH')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        accountid: user.account.accountid
      }
      await req.route.api.patch(req)
      const req2 = TestHelper.createRequest(`/api/user/organizations/organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req2.account = owner.account
      req2.session = owner.session
      try {
        await req2.route.api.get(req2)
      } catch (error) {
        assert.equal(error.message, 'invalid-organization')
      }
    })
  })
})
