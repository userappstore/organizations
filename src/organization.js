const dashboard = require('@userappstore/dashboard')

module.exports = {
  count,
  countAll,
  create,
  deleteAccount,
  deleteOrganization,
  generateID,
  getProperty,
  list,
  listAll,
  load,
  loadMany,
  removeProperty,
  setProperty
}

async function load (organizationid, ignoreDeletedOrganization) {
  if (!organizationid || !organizationid.length) {
    throw new Error('invalid-organizationid')
  }
  const organization = await global.redisClient.hgetallAsync(`organization:${organizationid}`)
  if (!organization) {
    if (!ignoreDeletedOrganization) {
      throw new Error('invalid-organizationid')
    }
    return null
  }
  for (const field in organization) {
    try {
      const intValue = parseInt(organization[field], 10)
      if (intValue.toString() === organization[field]) {
        organization[field] = intValue
      }
    } catch (error) {

    }
  }
  return organization
}

async function count (accountid) {
  if (!accountid || !accountid.length) {
    throw new Error('invalid-accountid')
  }
  return global.redisClient.llenAsync(`organizations:account:${accountid}`) || 0
}

async function countAll () {
  return global.redisClient.llenAsync(`organizations`) || 0
}

async function create (accountid, name) {
  if (!accountid || !accountid.length) {
    throw new Error('invalid-accountid')
  }
  if (!name || !name.length) {
    throw new Error('invalid-organization-name')
  }
  if (global.MINIMUM_ORGANIZATION_NAME_LENGTH > name.length ||
    name.length > global.MAXIMUM_ORGANIZATION_NAME_LENGTH) {
    throw new Error('invalid-organization-name-length')
  }
  const organizationid = await generateID()
  const fieldsAndValues = [
    `object`, `organization`,
    `ownerid`, accountid,
    `organizationid`, organizationid,
    `name`, name,
    `created`, dashboard.Timestamp.now
  ]
  await global.redisClient.lpushAsync(`organizations:account:${accountid}`, organizationid)
  await global.redisClient.hmsetAsync(`organization:${organizationid}`, fieldsAndValues)
  await global.redisClient.lpushAsync('organizations', organizationid)
  await dashboard.Account.setProperty(accountid, 'organization_lastCreated', dashboard.Timestamp.now)
  return load(organizationid)
}

async function generateID () {
  const id = await dashboard.UUID.generateID()
  return `organization_${id}`
}

async function deleteOrganization (organizationid) {
  if (!organizationid || !organizationid.length) {
    throw new Error('invalid-organizationid')
  }
  const organization = await global.redisClient.hgetallAsync(`organization:${organizationid}`)
  if (!organization) {
    throw new Error('invalid-organizationid')
  }
  await global.redisClient.lremAsync(`organizations:account:${organization.ownerid}`, 1, organizationid)
  await global.redisClient.delAsync(`organization:${organizationid}`)
  await dashboard.Account.setProperty(organization.ownerid, 'organization_lastDeleted', dashboard.Timestamp.now)
  await global.redisClient.lremAsync('organizations', 1, organizationid)
  return true
}

async function list (accountid, offset) {
  if (!accountid || !accountid.length) {
    throw new Error('invalid-accountid')
  }
  offset = offset || 0
  const organizationids = await global.redisClient.lrangeAsync(`organizations:account:${accountid}`, offset, offset + global.PAGE_SIZE - 1)
  if (!organizationids || !organizationids.length) {
    return
  }
  return loadMany(organizationids)
}

async function listAll (offset) {
  offset = offset || 0
  const organizationids = await global.redisClient.lrangeAsync(`organizations`, offset, offset + global.PAGE_SIZE - 1)
  if (!organizationids || !organizationids.length) {
    return
  }
  return loadMany(organizationids, true)
}

async function loadMany (organizationids, ignoreDeletedOrganization) {
  if (!organizationids || !organizationids.length) {
    throw new Error('invalid-organizationids')
  }
  const organizations = []
  for (let i = 0, len = organizationids.length; i < len; i++) {
    const organization = await load(organizationids[i], ignoreDeletedOrganization)
    if (!organization) {
      continue
    }
    organizations.push(organization)
  }
  return organizations
}

async function setProperty (organizationid, property, value) {
  if (!organizationid || !organizationid.length) {
    throw new Error('invalid-organizationid')
  }
  if (!property || !property.length) {
    throw new Error('invalid-property')
  }
  if (value == null || value === undefined) {
    throw new Error('invalid-value')
  }
  await global.redisClient.hsetAsync(`organization:${organizationid}`, property, value)
}

async function getProperty (organizationid, property) {
  if (!organizationid || !organizationid.length) {
    throw new Error('invalid-organizationid')
  }
  if (!property || !property.length) {
    throw new Error('invalid-property')
  }
  return global.redisClient.hgetAsync(`organization:${organizationid}`, property)
}

async function removeProperty (organizationid, property) {
  if (!organizationid || !organizationid.length) {
    throw new Error('invalid-organizationid')
  }
  if (!property || !property.length) {
    throw new Error('invalid-property')
  }
  await global.redisClient.hdelAsync(`organization:${organizationid}`, property)
}

async function deleteAccount (accountid) {
  if (!accountid || !accountid.length) {
    throw new Error('invalid-accountid')
  }
  const organizationids = await global.redisClient.lrangeAsync(`organizations:account:${accountid}`, 0, -1)
  if (organizationids && organizationids.length) {
    for (const organizationid of organizationids) {
      await global.redisClient.delAsync(`organization:${organizationid}`)
      await global.redisClient.lremAsync('organizations', 1, organizationid)
    }
  }
  await global.redisClient.delAsync(`organizations:account:${accountid}`)
}
