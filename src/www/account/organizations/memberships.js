const dashboard = require('@userappstore/dashboard')
const Membership = require('../../../membership.js')
const Navigation = require('./navbar.js')
const Organization = require('../../../organization.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  const memberships = await Membership.listByAccount(req.account.accountid)
  if (memberships && memberships.length) {
    for (const membership of memberships) {
      membership.created = dashboard.Timestamp.date(membership.created)
      membership.createdRelative = dashboard.Format.relativePastDate(membership.created)
      const organization = await Organization.load(membership.organizationid)
      membership.organizationName = organization.name
      membership.organizationEmail = organization.email
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
