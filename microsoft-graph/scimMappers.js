export function mapMicrosoftUserToScim(user) {
  return {
    emails: [
      { value: user.userPrincipalName, type: 'work', primary: true },
      ...(user.mail !== null ? [{ value: user.mail, type: 'work' }] : [])
    ],
    userName: user.userPrincipalName,
    id: user.id,
    name: {
      formatted: user.displayName,
      givenName: user.givenName,
      familyName: user.surname
    },
    displayName: user.displayName,
    title: user.jobTitle,
    phoneNumbers: [...(user.mobilePhone !== null ? [{ value: user.mobilePhone }] : [])],
    locale: user.preferredLanguage,
    active: true
  }
}

export function mapMicrosoftGroupToScim(group) {
  return {
    id: group.id,
    externalId: group.id,
    displayName: group.displayName,
    meta: {
      created: group.createdDateTime,
      lastModified: group.lastModifiedDateTime,
      resourceType: 'Group'
    }
  }
}

export function mapScimGroupToMicrosoft(group) {
  return {
    displayName: group.displayName,
    id: group.id,
    mailEnabled: false, // TODO: Implement mailEnabled
    mailNickname: 'NotSet',
    securityEnabled: true
  }
}

export function mapScimUserToMicrosoft(user) {
  return {
    userPrincipalName: user.userName,
    id: user.id,
    displayName: user.displayName ?? user.name?.formatted ?? `${user.name?.givenName} ${user.name?.familyName}`,
    givenName: user.name?.givenName,
    surname: user.name?.familyName,
    jobTitle: user.title,
    // mobilePhone: user.phoneNumbers[0]?.value,
    preferredLanguage: user.locale,
    accountEnabled: true,
    mailNickname: user.userName.split('@')[0]
  }
}
