import net from 'node:net'
import crypto from 'node:crypto'

export class RouterosAPI {
  constructor(timeout = 3) {
    this.debug = false
    this.connected = false
    this.port = 8728
    this.timeout = timeout
    this.attempts = 5
    this.delay = 3
    this.socket = null
  }

  connect(ip, login, password) {
    return new Promise((resolve) => {
      this.connected = false

      const attempt = async (retry) => {
        if (retry > this.attempts) {
          return resolve(false)
        }

        try {
          await new Promise((res, rej) => {
            this.socket = new net.Socket()
            this.socket.setTimeout(this.timeout * 1000)

            this.socket.on('connect', async () => {
              try {
                this.socket.setTimeout(0)
                await this.write('/login')
                await this.write('=name=' + login)
                await this.write('=password=' + password)
                const response = await this.read(false)

                if (response[0] === '!done') {
                  const match = response.find(r => r.startsWith('=ret='))
                  if (match) {
                    const challenge = match.substring(5)
                    await this.write('/login')
                    await this.write('=name=' + login)
                    const md5 = crypto.createHash('md5')
                    const hash = md5.update('\x00' + password + Buffer.from(challenge, 'hex')).digest('hex')
                    await this.write('=response=00' + hash)
                    const resp2 = await this.read(false)
                    if (resp2[0] === '!done') {
                      this.connected = true
                      res()
                    } else {
                      rej(new Error('Login failed (MD5 challenge)'))
                    }
                  } else {
                    this.connected = true
                    res()
                  }
                } else {
                  rej(new Error('Login failed'))
                }
              } catch (err) {
                rej(err)
              }
            })

            this.socket.on('error', (err) => {
              rej(err)
            })

            this.socket.on('timeout', () => {
              this.socket.destroy()
              rej(new Error('Connection timeout'))
            })

            this.socket.connect(this.port, ip)
          })
          return resolve(true)
        } catch {
          if (this.socket) {
            this.socket.destroy()
            this.socket = null
          }
          await new Promise(r => setTimeout(r, this.delay * 1000))
          return await attempt(retry + 1)
        }
      }

      attempt(1)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.destroy()
      this.socket = null
    }
    this.connected = false
  }

  comm(command, params = {}) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        return reject(new Error('Not connected'))
      }

      this.write(command).then(async () => {
        const keys = Object.keys(params)
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i]
          const v = params[k]
          const prefix = k.startsWith('?') ? '' : '='
          const isLast = i === keys.length - 1
          await this.write(prefix + k + '=' + v, isLast)
        }
        if (keys.length === 0) {
          await this.write('', true)
        }
        const result = await this.read()
        resolve(result)
      }).catch(reject)
    })
  }

  write(command, end = true) {
    return new Promise((resolve, reject) => {
      if (this.debug) {
        console.log('Write:', command)
      }

      const length = Buffer.byteLength(command)
      let header

      if (length < 0x80) {
        header = Buffer.from([length])
      } else if (length < 0x4000) {
        const len = length | 0x8000
        header = Buffer.from([(len >> 8) & 0xFF, len & 0xFF])
      } else if (length < 0x200000) {
        const len = length | 0xC00000
        header = Buffer.from([(len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF])
      } else if (length < 0x10000000) {
        const len = length | 0xE0000000
        header = Buffer.from([(len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF])
      } else {
        header = Buffer.from([0xF0, (length >> 24) & 0xFF, (length >> 16) & 0xFF, (length >> 8) & 0xFF, length & 0xFF])
      }

      const data = Buffer.concat([header, Buffer.from(command)])
      const endByte = end ? Buffer.from([0x00]) : Buffer.alloc(0)

      this.socket.write(Buffer.concat([data, endByte]), resolve)
    })
  }

  read(parse = true) {
    return new Promise((resolve, reject) => {
      const rawResponses = []
      let onError, onClose
      let cleaned = false

      function cleanup() {
        if (cleaned) return
        cleaned = true
        if (onError) this.socket?.off('error', onError)
        if (onClose) this.socket?.off('close', onClose)
      }

      onError = (err) => {
        cleanup.call(this)
        reject(err)
      }

      onClose = () => {
        cleanup.call(this)
        reject(new Error('Socket closed during read'))
      }

      this.socket.on('error', onError)
      this.socket.on('close', onClose)

      const collectData = () => {
        this.socket.once('data', (buf) => {
          const str = buf.toString()
          const words = str.split('\x00').filter(w => w)

          for (const word of words) {
            rawResponses.push(word)
            if (word === '!done' || word === '!fatal' || word === '!trap') {
              cleanup.call(this)
              resolve(parse ? this.parseResponse(rawResponses) : rawResponses)
              return
            }
          }

          collectData()
        })
      }

      collectData()
    })
  }

  parseResponse(response) {
    const result = []
    let i = -1

    for (const r of response) {
      if (r === '!re') {
        i++
      } else if (r.startsWith('=')) {
        const eqIdx = r.indexOf('=', 1)
        if (eqIdx > 0) {
          const key = r.substring(1, eqIdx)
          const val = r.substring(eqIdx + 1)
          if (!result[i]) result[i] = {}
          result[i][key] = val
        }
      } else if (r === '!trap' || r === '!fatal') {
        // Error response
        if (!result[i]) result[i] = {}
        result[i]._error = true
      }
    }

    return Object.values(result)
  }
}

export default RouterosAPI
