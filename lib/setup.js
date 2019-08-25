const deepmerge = require('deepmerge')
const request = require('request-promise-native')
const getPort = require('get-port')
const build = require('./build')

const OVERRIDE_STRATEGY_OVERWRITE = 'overwrite'
const OVERRIDE_STRATEGY_MERGE = 'merge'

let _port

const url = path => `http://localhost:${_port}${path}`
const get = (path, options = {}) => request({ url: url(path), ...options })

const loadConfig = (dir, fixture = null, override = {}, { overrideStrategy = OVERRIDE_STRATEGY_OVERWRITE } = {}) => {
  const config = require(`${dir}/fixture/${fixture ? fixture + '/' : ''}nuxt.config`)

  if (overrideStrategy === OVERRIDE_STRATEGY_MERGE) {
    return deepmerge.all([config, override])
  } else if (overrideStrategy === OVERRIDE_STRATEGY_OVERWRITE) {
    return {
      ...config,
      ...override
    }
  } else {
    console.error(`[@nuxtjs/module-test-utils] Provided overrideStrategy has invalid value "${overrideStrategy}"`)
  }
}

const setup = async (config, { port = null, waitFor = 0 } = {}) => {
  const { nuxt, builder } = await build(config, { waitFor })

  _port = port
  if (!_port) {
    _port = await getPort()
  }

  await nuxt.listen(_port)

  return {
    nuxt,
    builder
  }
}

module.exports = {
  setup,
  url,
  get,
  loadConfig
}
