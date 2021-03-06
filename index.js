if (!process.env.MEMBERSHIP_PROFILE_FIELDS) {
  global.membershipProfileFields = ['display-name', 'display-email']
} else {
  global.membershipProfileFields = process.env.MEMBERSHIP_PROFILE_FIELDS.split(',')
}
global.minimumOrganizationNameLength = parseInt(process.env.MINIMUM_ORGANIZATION_NAME_LENGTH || '1', 10)
global.maximumOrganizationNameLength = parseInt(process.env.MAXIMUM_ORGANIZATION_NAME_LENGTH || '50', 10)
global.minimumInvitationCodeLength = parseInt(process.env.MINIMUM_INVITATION_CODE_LENGTH || '6', 10)
global.maximumInvitationCodeLength = parseInt(process.env.MAXIMUM_INVITATION_CODE_LENGTH || '50', 10)

module.exports = {
  setup: async () => {
    if (process.env.ORGANIZATIONS_STORAGE) {
      const Storage = require('@userdashboard/dashboard/src/storage.js')
      const storage = await Storage.setup('ORGANIZATIONS')
      const StorageList = require('@userdashboard/dashboard/src/storage-list.js')
      const storageList = await StorageList.setup(storage, 'ORGANIZATIONS')
      const StorageObject = require('@userdashboard/dashboard/src/storage-object.js')
      const storageObject = await StorageObject.setup(storage, 'ORGANIZATIONS')
      module.exports.Storage = storage
      module.exports.StorageList = storageList
      module.exports.StorageObject = storageObject
    } else {
      const dashboard = require('@userdashboard/dashboard')
      module.exports.Storage = dashboard.Storage
      module.exports.StorageList = dashboard.StorageList
      module.exports.StorageObject = dashboard.StorageObject
    }
  }
}
