/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/api/administrator/organizations/organizations', () => {
  describe('Organizations#GET', () => {
    it('should return organization list', async () => {
      const administrator = await TestHelper.createAdministrator()
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const owner2 = await TestHelper.createUser()
      await TestHelper.createOrganization(owner2)
      const owner3 = await TestHelper.createUser()
      await TestHelper.createOrganization(owner3)
      const req = TestHelper.createRequest('/api/administrator/organizations/organizations', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const organizations = await req.route.api.get(req)
      assert.equal(true, organizations.length >= 3)
      assert.equal(organizations[0].organizationid, owner3.organization.organizationid)
      assert.equal(organizations[1].organizationid, owner2.organization.organizationid)
      assert.equal(organizations[2].organizationid, owner.organization.organizationid)
    })

    it('should filter by accountid', async () => {
      const administrator = await TestHelper.createAdministrator()
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const owner2 = await TestHelper.createUser()
      await TestHelper.createOrganization(owner2)
      const owner3 = await TestHelper.createUser()
      await TestHelper.createOrganization(owner3)
      const req = TestHelper.createRequest(`/api/administrator/organizations/organizations?accountid=${owner.account.accountid}`, 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const organizations = await req.route.api.get(req)
      assert.equal(organizations.length, 1)
      assert.equal(organizations[0].organizationid, owner.organization.organizationid)
    })

    it('should enforce page size', async () => {
      const administrator = await TestHelper.createAdministrator()
      for (let i = 0, len = 20; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.createOrganization(user)
      }
      const req = TestHelper.createRequest('/api/administrator/organizations/organizations', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      global.PAGE_SIZE = 8
      const organizationsNow = await req.route.api.get(req)
      assert.equal(organizationsNow.length, 8)
    })

    it('should enforce specified offset', async () => {
      const administrator = await TestHelper.createAdministrator()
      const organizations = [ ]
      for (let i = 0, len = 30; i < len; i++) {
        const user = await TestHelper.createUser()
        await TestHelper.createOrganization(user)
        organizations.unshift(user.organization)
      }
      const req = TestHelper.createRequest('/api/administrator/organizations/organizations?offset=10', 'GET')
      req.account = administrator.account
      req.session = administrator.session
      const organizationsNow = await req.route.api.get(req)
      for (let i = 0, len = 10; i < len; i++) {
        assert.equal(organizationsNow[i].codeid, organizations[10 + i].codeid)
      }
    })
  })
})
