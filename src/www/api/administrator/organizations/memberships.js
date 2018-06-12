const orgs = require('../../../../../index.js')

module.exports = {
  get: async (req) => {
    const offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0
    const memberships = await orgs.Membership.listAll(offset)
    if (!memberships || !memberships.length) {
      return null
    }
    return memberships
  }
}
