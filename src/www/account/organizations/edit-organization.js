const dashboard = require('@userdashboard/dashboard')

module.exports = {
  before: beforeRequest,
  get: renderPage,
  post: submitForm
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
  req.data = { organization }
}

async function renderPage (req, res, messageTemplate) {
  if (req.success) {
    if (req.query && req.query.returnURL && req.query.returnURL.indexOf('/') === 0) {
      return dashboard.Response.redirect(req, res, decodeURI(req.query.returnURL))
    }
    messageTemplate = 'success'
  } else if (req.error) {
    messageTemplate = req.error
  }
  const doc = dashboard.HTML.parse(req.route.html, req.data.organization, 'organization')
  if (messageTemplate) {
    dashboard.HTML.renderTemplate(doc, null, messageTemplate, 'message-container')
    if (messageTemplate === 'success') {
      const submitForm = doc.getElementById('submit-form')
      submitForm.parentNode.removeChild(submitForm)
      return dashboard.Response.end(req, res, doc)
    }
  }
  const nameField = doc.getElementById('name')
  const emailField = doc.getElementById('email')
  if (req.method === 'POST') {
    nameField.setAttribute('value', req.body.name || '')
    emailField.setAttribute('value', req.body.email || '')
  } else {
    nameField.setAttribute('value', req.data.organization.name)
    emailField.setAttribute('value', req.data.organization.email)
  }
  return dashboard.Response.end(req, res, doc)
}

async function submitForm (req, res) {
  if (!req.body) {
    return renderPage(req, res)
  }
  req.body.name = req.body.name && req.body.name.trim ? req.body.name.trim() : req.body.name
  if (!req.body.name || !req.body.name.length) {
    return renderPage(req, res, 'invalid-organization-name')
  }
  if (global.minimumOrganizationNameLength > req.body.name.length ||
    global.maximumOrganizationNameLength < req.body.name.length) {
    return renderPage(req, res, 'invalid-organization-name-length')
  }
  req.body.email = req.body.email && req.body.email.trim ? req.body.email.trim() : req.body.email
  if (!req.body.email || !req.body.email.length) {
    return renderPage(req, res, 'invalid-organization-email')
  }
  try {
    await global.api.user.organizations.UpdateOrganization.patch(req)
    if (req.success) {
      return renderPage(req, res, 'success')
    }
    return renderPage(req, res, 'unknown-error')
  } catch (error) {
    return renderPage(req, res, error.message)
  }
}
