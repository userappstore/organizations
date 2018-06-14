const dashboard = require('@userappstore/dashboard')
const Navigation = require('./navbar.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    throw new Error('invalid-organization')
  }
  const organization = await global.api.user.organizations.Organization.get(req)
  if (!organization) {
    throw new Error('invalid-organization')
  }
  if (organization.ownerid !== req.account.accountid) {
    const memberships = await global.api.user.organizations.Memberships.get(req)
    let isMember = false
    for (const membership of memberships) {
      if (membership.organizationid === req.query.organizationid) {
        isMember = true
        break
      }
    }
    if (!isMember) {
      throw new Error('invalid-account')
    }
  }
  organization.created = dashboard.Timestamp.date(organization.created)
  req.data = { organization }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  dashboard.HTML.renderTemplate(doc, req.data.organization, 'organization-row-template', 'organizations-table')
  if (req.data.organization.ownerid !== req.account.accountid) {
    doc.removeElementsById([
      `invitations-link-${req.query.organizationid}`,
      `edit-organization-link-${req.query.organizationid}`,
      `delete-organization-link-${req.query.organizationid}`
    ])
  }
  return dashboard.Response.end(req, res, doc)
}
