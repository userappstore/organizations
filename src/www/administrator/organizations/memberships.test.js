/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../test-helper.js')

describe('/administrator/organizations/memberships', () => {
  it('should require an administrator', TestHelper.requireAdministrator('/administrator/organizations/memberships'))
  describe('Memberships#BEFORE', () => {
    it('should bind memberships to req', async () => {
      const administrator = await TestHelper.createUser()
      await TestHelper.createOrganization(administrator)
      const user = await TestHelper.createUser()
      await TestHelper.createMembership(user, administrator.organization.organizationid)
      const req = TestHelper.createRequest(`/administrator/organizations/memberships?organizationid=${administrator.organization.organizationid}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.memberships, null)
      assert.equal(req.data.memberships[0].membershipid, user.membership.membershipid)
    })
  })

  describe('Memberships#GET', () => {
    it('should have row for each membership', async () => {
      const administrator = await TestHelper.createUser()
      await TestHelper.createOrganization(administrator)
      const user = await TestHelper.createUser()
      await TestHelper.createMembership(user, administrator.organization.organizationid)
      const req = TestHelper.createRequest(`/administrator/organizations/memberships?organizationid=${administrator.organization.organizationid}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const membershipRow = doc.getElementById(user.membership.membershipid)
        assert.notEqual(null, membershipRow)
      }
      await req.route.api.before(req)
      return req.route.api.get(req, res)
    })
  })
})
