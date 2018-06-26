/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe('/administrator/organizations/memberships', () => {
  describe('Memberships#BEFORE', () => {
    it('should bind memberships to req', async () => {
      const administrator = await TestHelper.createAdministrator()
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      await TestHelper.createInvitation(owner)
      await TestHelper.acceptInvitation(user, owner)
      const req = TestHelper.createRequest(`/administrator/organizations/memberships?accountid=${owner.account.accountid}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.memberships, null)
      assert.equal(req.data.memberships[0].membershipid, user.membership.membershipid)
    })
  })

  describe('Memberships#GET', () => {
    it('should limit memberships to one page', async () => {
      const administrator = await TestHelper.createAdministrator()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const owner = await TestHelper.createUser()
        await TestHelper.createOrganization(owner)
        await TestHelper.createInvitation(owner)
        await TestHelper.acceptInvitation(user, owner)
      }
      const req = TestHelper.createRequest(`/administrator/organizations/memberships?accountid=${user.account.accountid}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('memberships-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const administrator = await TestHelper.createAdministrator()
      const user = await TestHelper.createUser()
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        const owner = await TestHelper.createUser()
        await TestHelper.createOrganization(owner)
        await TestHelper.createInvitation(owner)
        await TestHelper.acceptInvitation(user, owner)
      }
      const req = TestHelper.createRequest(`/administrator/organizations/memberships`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        const table = doc.getElementById('memberships-table')
        const rows = table.getElementsByTagName('tr')
        assert.equal(rows.length, global.PAGE_SIZE + 1)
      }
      return req.route.api.get(req, res)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const administrator = await TestHelper.createAdministrator()
      const user = await TestHelper.createUser()
      const memberships = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const owner = await TestHelper.createUser()
        await TestHelper.createOrganization(owner)
        await TestHelper.createMembership(user, owner)
        memberships.unshift(user.membership)
      }
      const req = TestHelper.createRequest(`/administrator/organizations/memberships?offset=${offset}`, 'GET')
      req.administratorAccount = req.account = administrator.account
      req.administratorSession = req.session = administrator.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
          assert.notEqual(null, doc.getElementById(memberships[offset + i].membershipid))
        }
      }
      return req.route.api.get(req, res)
    })
  })
})
