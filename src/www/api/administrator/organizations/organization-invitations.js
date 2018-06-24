const dashboard = require('@userappstore/dashboard')
const orgs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    if (!req.query || !req.query.organizationid) {
      throw new Error('invalid-organizationid')
    }
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const invitationids = await dashboard.RedisList.list(`organization:invitations:${req.query.organizationid}`, offset)
    if (!invitationids || !invitationids.length) {
      return null
    }
    const invitations = await orgs.Invitation.loadMany(invitationids)
    for (const invitation of invitations) {
      delete (invitation.code)
    }
    return invitations
  }
}
