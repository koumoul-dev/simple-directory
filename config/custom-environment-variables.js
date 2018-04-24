module.exports = {
  publicUrl: 'PUBLIC_URL',
  kid: 'JWT_KID',
  jwt: {
    expiresIn: 'JWT_LIFETIME'
  },
  webhooks: {
    updateEntityNames: {
      __name: 'NAMES_WEBHOOKS',
      __format: 'json'
    }
  },
  brand: {
    logo: 'BRAND_LOGO',
    title: 'BRAND_TITLE',
    description: 'BRAND_DESCRIPTION'
  }
}
