const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    throw new Error('invalid-organizationid')
  }
  const organization = await global.api.user.organizations.Organization.get(req)
  if (!organization) {
    throw new Error('invalid-organization')
  }
  if (organization.ownerid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  const memberships = await global.api.user.organizations.Memberships.get(req)
  if (memberships && memberships.length) {
    for (const membership of memberships) {
      membership.created = dashboard.Timestamp.date(membership.created)
      membership.createdRelative = dashboard.Format.date(membership.created)
    }
  }
  req.data = { memberships }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.memberships && req.data.memberships.length) {
    doc.renderTable(req.data.memberships, 'membership-row-template', 'memberships-table')
  } else {
    doc.removeElementById('memberships-table')
  }
  return dashboard.Response.end(req, res, doc)
}
