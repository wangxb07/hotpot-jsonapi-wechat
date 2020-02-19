import {
  getDefaultURLBuilder
} from './url-builder'

export class HttpClient {
  constructor(urlBuilder, options) {
    // 兼容老的host地址字符串的写法
    if (typeof urlBuilder === 'string') {
      this.urlBuilder = getDefaultURLBuilder(urlBuilder)
    } else {
      this.urlBuilder = urlBuilder
    }

    const defaultOptions = {
      identityKey: 'identifying',
      responseProcess: (res) => res.data,
    }

    options = Object.assign({}, defaultOptions, options)

    this.identityKey = options.identityKey;
    this.responseProcess = options.responseProcess
  }

  setURLBuilder(urlBuilder) {
    this.urlBuilder = urlBuilder
  }

  getURLBuilder() {
    return this.urlBuilder
  }

  /**
   * @deprecated
   */
  setHost(host) {
    this.host = host
  }

  setIdentityKey(key) {
    this.identityKey = key
  }

  fetch(path, options, withToken = false) {
    return this._fetch(path, options, withToken = false).then(this.responseProcess)
  }

  _fetch(path, options, withToken = false) {
    const host = this.urlBuilder.getHost()
    if (!withToken) {
      return new Promise((resolve, reject) => wx.request({
        url: this.urlBuilder.build(path),
        ...options,
        success(response) {
          const statusCode = String(response.statusCode).substr(0, 1)
          if (statusCode == 2) {
            resolve(response)
          } else {
            reject(response)
          }
        },
        fail(response) {
          reject(response)
        },
      }))
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${host}/session/token`,
        method: 'POST',
        header: {
          ...options.header,
        },
        success: (response) => {
          if (response.statusCode === 200) {
            options.header = {
              'X-CSRF-Token': response.data,
              ...options.header
            }

            wx.request({
              url: this.urlBuilder.build(path),
              ...options,
              success(response) {
                if (response.statusCode === 200 || response.statusCode === 201) {
                  resolve(response)
                } else {
                  reject(response)
                }
              },
              fail(response) {
                reject(response)
              },
            })
          }
        },
      })
    })
  }

  anonymousRequest(path, options = {}) {
    options.header = {
      Accept: 'application/json',
      ...options.header
    }

    return this.fetch(path, options)
  }

  authedRequest(path, options = {}, withToken = false) {
    const identity = wx.getStorageSync(this.identityKey) || {}
    if (typeof identity.sessid === 'undefined') {
      // TODO 当用户未登录情况下，调用authed request 将被触发一个权限异常
      console.error(`授权请求${path}时，身份信息丢失`)
      throw 'Identity miss'
    }

    options.header = {
      Accept: 'application/json',
      Authorization: `Bearer ${identity.jwt}`,
      Cookie: `${identity.session_name}=${identity.sessid}`,
      ...options.header,
    }

    return this.fetch(path, options, withToken)
  }
}

const http = new HttpClient(getDefaultURLBuilder())
export default http
