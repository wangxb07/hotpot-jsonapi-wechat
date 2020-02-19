export class URLBuilder {
  constructor(host = '') {
    this.host = host
    this.params = {}
  }

  addGlobalQueryParam(field, value, groups) {
    this.params = {
      ...this.params,
      [field]: {
        value,
        groups,
      },
    }
  }

  build(path, groups) {
    // 如果没有指定，默认取所有的筛选条件
    if (typeof groups === 'undefined') {
      // const fields = Object.keys(this.params)
      // return fields.reduce((newUrl, field) => {
      //   if (newUrl.split('?').length === 2) {
      //     return `${newUrl}&filter[${field}.name]=${this.params[field].value}`
      //   }
      //   return `${newUrl}?&filter[${field}.name]==${this.params[field].value}`
      // }, `${this.host}${path}`)
      return `${this.host}${path}`
    }

    const fields = Object.keys(this.params)
      .filter((field) => this.params[field].groups.find((group) => groups.find((g) => group === g)))

    return fields.reduce((newUrl, field) => {
      if (newUrl.split('?').length === 2) {
        return `${newUrl}&${field}=${this.params[field].value}`
      }
      return `${newUrl}?&${field}=${this.params[field].value}`
    }, `${this.host}${path}`)
  }

  getHost() {
    return this.host
  }
}

const bulider = undefined

export const getDefaultURLBuilder = (host) => {
  if (typeof bulider === 'undefined') {
    return new URLBuilder(host)
  }

  return bulider
}

export default bulider