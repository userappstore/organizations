const dashboard = require('@userappstore/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
}

async function beforeRequest (req) {
  if (!req.query || !req.query.organizationid) {
    throw new Error('invalid-organization')
  }
  let invitation
  if (req.session.lockURL === req.url && req.session.unlocked) {
    try {
      invitation = await global.api.user.organizations.CreateInvitation._post(req)
    } catch (error) {
      req.error = error.message
    }
  }
  const organization = await global.api.user.organizations.Organization._get(req)
  if (!organization) {
    throw new Error('invalid-organization')
  }
  if (organization.ownerid !== req.account.accountid) {
    throw new Error('invalid-account')
  }
  organization.createdFormatted = dashboard.Timestamp.date(organization.created)
  req.data = { organization, invitation }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL) {
      return dashboard.Response.redirect(req, res, req.query.returnURL)
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.organization, 'organization')
  if (!messageTemplate && req.method === 'GET' && req.query && req.query.returnURL) {
    const submitForm = doc.getElementById('submit-form')
    const divider = submitForm.attr.action.indexOf('?') > -1 ? '&' : '?'
    submitForm.attr.action += `${divider}returnURL=${req.query.returnURL}`
  }
  doc.getElementById('organizationName').setAttribute('value', req.data.organization.name)
  doc.getElementById('code').setAttribute('value', req.body ? req.body.code : dashboard.UUID.random(10))
  if (messageTemplate) {
    req.data.invitation.dashboardServer = global.dashboardServer
    dashboard.HTML.renderTemplate(doc, req.data.invitation, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      const organizationTable = doc.getElementById('organizations-table')
      organizationTable.parentNode.removeChild(organizationTable)
    }
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  if (!req.body.code) {
    return renderPage(req, res, 'invalid-invitation-code')
  }
  try {
    const invitation = await global.api.user.organizations.CreateInvitation._post(req)
    if (req.success) {
      req.data.invitation = invitation
      return renderPage(req, res, 'success')
    }
    return dashboard.Response.redirect(req, res, '/account/authorize')
  } catch (error) {
    return renderPage(req, res, req.error)
  }
}
