import { RouterosAPI } from './routeros.mjs'

export class PppoeSyncService {
  async sync(account) {
    const api = new RouterosAPI(3)
    const conn = await api.connect(process.env.MIKROTIK_HOST, process.env.MIKROTIK_USER, process.env.MIKROTIK_PASSWORD)
    if (!conn) throw new Error('Failed to connect to router')

    try {
      // Check if PPPoE secret already exists
      const existing = await api.comm('/ppp/secret/print', {
        '?name': account.username,
      })

      const params = {
        name: account.username,
        password: account.password,
        service: account.service || 'pppoe',
      }
      if (account.profile) params.profile = account.profile
      if (account.ipAddress) params['remote-address'] = account.ipAddress
      if (account.disabled) params.disabled = 'yes'

      if (existing && existing.length > 0) {
        params['.id'] = existing[0]['.id']
        await api.comm('/ppp/secret/set', params)
      } else {
        await api.comm('/ppp/secret/add', params)
      }

      return { success: true }
    } finally {
      api.disconnect()
    }
  }

  async disableOnRouter(username) {
    const api = new RouterosAPI(3)
    const conn = await api.connect(process.env.MIKROTIK_HOST, process.env.MIKROTIK_USER, process.env.MIKROTIK_PASSWORD)
    if (!conn) throw new Error('Failed to connect to router')

    try {
      const existing = await api.comm('/ppp/secret/print', { '?name': username })
      if (existing && existing.length > 0) {
        await api.comm('/ppp/secret/set', { '.id': existing[0]['.id'], disabled: 'yes' })
      }
      return { success: true }
    } finally {
      api.disconnect()
    }
  }

  async enableOnRouter(username) {
    const api = new RouterosAPI(3)
    const conn = await api.connect(process.env.MIKROTIK_HOST, process.env.MIKROTIK_USER, process.env.MIKROTIK_PASSWORD)
    if (!conn) throw new Error('Failed to connect to router')

    try {
      const existing = await api.comm('/ppp/secret/print', { '?name': username })
      if (existing && existing.length > 0) {
        await api.comm('/ppp/secret/set', { '.id': existing[0]['.id'], disabled: 'no' })
      }
      return { success: true }
    } finally {
      api.disconnect()
    }
  }

  async removeFromRouter(username) {
    const api = new RouterosAPI(3)
    const conn = await api.connect(process.env.MIKROTIK_HOST, process.env.MIKROTIK_USER, process.env.MIKROTIK_PASSWORD)
    if (!conn) throw new Error('Failed to connect to router')

    try {
      const existing = await api.comm('/ppp/secret/print', { '?name': username })
      if (existing && existing.length > 0) {
        await api.comm('/ppp/secret/remove', { '.id': existing[0]['.id'] })
      }
      return { success: true }
    } finally {
      api.disconnect()
    }
  }
}

export default PppoeSyncService
