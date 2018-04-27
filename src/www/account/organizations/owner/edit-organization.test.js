/* eslint-env mocha */
const assert = require('assert')
const TestHelper = require('../../../../test-helper.js')

describe(`/account/organizations/owner/edit-organization`, () => {
  it('should require a user', TestHelper.requireAdministrator(`/account/organizations/owner/edit-organization`))
  it('should require an organizationid', TestHelper.requireParameter(`/account/organizations/owner/edit-organization`, 'organizationid'))
  describe('EditOrganization#BEFORE', () => {
    it('should require owner', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const user = await TestHelper.createUser()
      await TestHelper.createOrganization(user, owner.organization.organizationid)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req.account = user.account
      req.session = user.session
      try {
        await req.route.api.before(req)
      } catch (error) {
        assert.equal(error.message, 'invalid-account')
      }
    })

    it('should bind organization to req', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      await req.route.api.before(req)
      assert.notEqual(req.data, null)
      assert.notEqual(req.data.organization, null)
      assert.equal(req.data.organization.organizationid, owner.organization.organizationid)
    })
  })

  describe('EditOrganization#GET', () => {
    it('should present the form', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'GET')
      req.account = owner.account
      req.session = owner.session
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        assert.notEqual(null, doc)
        assert.notEqual(null, doc.getElementById('email'))
        assert.notEqual(null, doc.getElementById('submitForm'))
        assert.notEqual(null, doc.getElementById('submitButton'))
      }
      await req.route.api.before(req)
      return req.route.api.get(req, res)
    })
  })

  describe('EditOrganization#POST', () => {
    it('should reject invalid fields', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'POST')
      req.session = owner.session
      req.account = owner.account
      req.body = {
        invalid: 'field'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const message = doc.getElementById('messageContainer').child[0]
        assert.equal('invalid-organization-field', message.attr.error)
      }
      await req.route.api.before(req)
      return req.route.api.post(req, res)
    })

    it('should enforce field length', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'POST')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        email: 'toooooooo_loooooooooooooooong@email-address.com'
      }
      global.MAXIMUM_ORGANIZATION_FIELD_LENGTH = 20
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        const doc = TestHelper.extractDoc(str)
        const message = doc.getElementById('messageContainer').child[0]
        assert.equal('invalid-organization-field-length', message.attr.error)
      }
      await req.route.api.before(req)
      return req.route.api.post(req, res)
    })

    it('should lock session pending authorization', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'POST')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        email: 'email@address.com'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        assert.notEqual(null, req.session.lock)
        assert.equal(req.session.lockURL, `/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`)
      }
      await req.route.api.before(req)
      return req.route.api.post(req, res)
    })

    it('should apply after authorization', async () => {
      const owner = await TestHelper.createUser()
      await TestHelper.createOrganization(owner)
      const req = TestHelper.createRequest(`/account/organizations/owner/edit-organization?organizationid=${owner.organization.organizationid}`, 'POST')
      req.account = owner.account
      req.session = owner.session
      req.body = {
        email: 'email@address.com'
      }
      const res = TestHelper.createResponse()
      res.end = async (str) => {
        await TestHelper.completeAuthorization(req)
        const res = TestHelper.createResponse()
        res.end = async (str) => {
          const doc = TestHelper.extractDoc(str)
          const messageContainer = doc.getElementById('messageContainer')
          assert.notEqual(null, messageContainer)
          assert.notEqual(null, messageContainer.child)
          const message = messageContainer.child[0]
          assert.equal('success', message.attr.error)
        }
        await req.route.api.before(req)
        return req.route.api.get(req, res)
      }
      await req.route.api.before(req)
      return req.route.api.post(req, res)
    })
  })
})
