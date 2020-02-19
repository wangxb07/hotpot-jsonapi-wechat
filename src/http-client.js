export class HttpClient {
  constructor(urlBuilder, options) {
    const defaultOptions = {
      responseProcess: (res) => res.data,
    }

    options = Object.assign({}, defaultOptions, options)

    this.urlBuilder = urlBuilder
    this.responseProcess = options.responseProcess
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
}
