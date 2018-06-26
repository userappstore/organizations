/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../../test-helper.js')

describe(`/api/user/organizations/invitations`, () => {
  describe('Invitations#GET', () => {
    it('should limit invitation list to one page', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const invitations = []
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createInvitation(owner)
        invitations.unshift(owner.invitation)
      }
      const req = TestHelper.createRequest(`/api/user/organizations/invitations?accountid=${owner.account.accountid}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      const invitationsNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(invitationsNow[i].invitationid, invitations[i].invitationid)
      }
    })

    it('should enforce page size', async () => {
      global.PAGE_SIZE = 3
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      for (let i = 0, len = global.PAGE_SIZE + 1; i < len; i++) {
        await TestHelper.createInvitation(owner)
      }
      const req = TestHelper.createRequest(`/api/user/organizations/invitations?accountid=${owner.account.accountid}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      const codesNow = await req.route.api.get(req)
      assert.equal(codesNow.length, global.PAGE_SIZE)
    })

    it('should enforce specified offset', async () => {
      const offset = 1
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const invitations = []
      for (let i = 0, len = global.PAGE_SIZE + offset + 1; i < len; i++) {
        const invitation = await TestHelper.createInvitation(owner)
        invitations.unshift(invitation)
      }
      const req = TestHelper.createRequest(`/api/user/organizations/invitations?accountid=${owner.account.accountid}&offset=${offset}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      const invitationsNow = await req.route.api.get(req)
      for (let i = 0, len = global.PAGE_SIZE; i < len; i++) {
        assert.equal(invitationsNow[i].invitationid, invitations[offset + i].invitationid)
      }
    })
  })
})
