/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/organizations/organization`, () => {
  describe('Organization#BEFORE', () => {
    it('should reject non-member', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      const req = TestHelper.createRequest(`/account/organizations/organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req.account = user.account
      req.session = user.session
      let errorMessage
      try {
        await req.route.api.before(req)
      } catch (error) {
        errorMessage = error.message
      }
      assert.equal(errorMessage, 'invalid-account')
    })

    it('should bind organization to req', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      const req = TestHelper.createRequest(`/account/organizations/organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.organization, null)
      assert.equal(req.data.organization.organizationid, owner.organization.organizationid)
    })
  })

  describe('Organization#GET', () => {
    it('should have row for organization', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      const req = TestHelper.createRequest(`/account/organizations/organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const organizationRow = doc.getElementById(owner.organization.organizationid)
        assert.notEqual(null, organizationRow)
      }
      return req.route.api.get(req, res)
    })
  })
})
