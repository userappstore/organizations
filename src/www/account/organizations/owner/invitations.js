const dashboard = require('@userappstore/dashboard')
const Invitation = require('../../../../invitation.js')
const Navigation = require('./navbar.js')
const Organization = require('../../../../organization.js')

module.exports = {
  before: beforeRequest,
  get: renderPage
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    throw new Error('invalid-organizationid')
  }
  const organization = await Organization.load(req.query.organizationid)
  if (!organization) {
    throw new Error('invalid-organization')
  }
  if (organization.ownerid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  const invitations = await Invitation.list(req.query.organizationid)
  if (invitations && invitations.length) {
    for (const invitation of invitations) {
      invitation.created = dashboard.Timestamp.date(invitation.created)
      invitation.createdRelative = dashboard.Format.relativePastDate(invitation.created)
    }
  }
  req.data = { invitations }
}

async function renderPage (req, res) {
  const doc = dashboard.HTML.parse(req.route.html)
  await Navigation.render(req, doc)
  if (req.data.invitations && req.data.invitations.length) {
    doc.renderTable(req.data.invitations, 'invitation-row-template', 'invitations-table')
    const removeElements = []
    for (const invitation of req.data.invitations) {
      if (invitation.accepted) {
        removeElements.push(`not-accepted-${invitation.invitationid}`)
      } else {
        removeElements.push(`accepted-${invitation.invitationid}`)
      }
      if (invitation.membershipid) {
        removeElements.push(`no-membership-${invitation.invitationid}`)
      } else {
        removeElements.push(`membership-${invitation.invitationid}`)
      }
    }
    doc.removeElementsById(removeElements)
  }
  return dashboard.Response.end(req, res, doc)
}
