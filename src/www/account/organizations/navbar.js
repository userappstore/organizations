module.exports = {
  render: renderNavigation
}

async function renderNavigation (req, doc) {
  const template = doc.getElementById('navbar-template')
  const children = template.child ? template.child.length : 0
  doc.renderTemplate(req.query, template, template)
  if (children) {
    template.child.splice(0, children)
  }
}
