module.exports = (state, emitter) => {
  const ENV_DATA = {
    'keyState': 'idle',
    'fetchState': 'banned',
    'key': null,
    'villageId': null,
    'vId': null,
    'id': null,
    'villages': [],
    'collectorId': null,
    'loading': true,
    'collectors': []
  }

  const BUSS_DATA = {
    'rot': 0,
    'unrot': 0,
    'recycle': 0,
    'harm': 0,
    'battery': 0,
    'bottle': 0,
    'bag': 0,
    'bulb': 0,
    'score': 3,
    'drate': 0,
    'lastUpdate': null
  }

  Object.assign(state, ENV_DATA, BUSS_DATA)

  emitter.on('state:battery', battery => {
    state.battery = battery
  })

  emitter.on('state:bottle', bottle => {
    state.bottle = bottle
  })

  emitter.on('state:bag', bag => {
    state.bag = bag
  })

  emitter.on('state:bulb', bulb => {
    state.bulb = bulb
  })

  emitter.on('state:rot', rot => {
    state.rot = rot
  })

  emitter.on('state:unrot', unrot => {
    state.unrot = unrot
  })

  emitter.on('state:recycle', recycle => {
    state.recycle = recycle
  })

  emitter.on('state:harm', harm => {
    state.harm = harm
  })

  emitter.on('state:id', id => {
    state.id = id
  })

  emitter.on('state:villages', villages => {
    state.villages = villages
  })

  emitter.on('state:score', score => {
    state.score = score
  })

  emitter.on('state:villageId', villageId => {
    state.villageId = villageId
  })

  emitter.on('state:vId', vId => {
    state.vId = vId
  })

  emitter.on('state:key', key => {
    state.key = key
  })

  emitter.on('state:keyState', keyState => {
    state.keyState = keyState
  })

  emitter.on('state:fetchState', fetchState => {
    state.fetchState = fetchState
  })

  emitter.on('state:loading', loading => {
    state.loading = loading
  })

  emitter.on('state:collectorId', collectorId => {
    state.collectorId = collectorId
  })

  emitter.on('state:collectors', collectors => {
    state.collectors = collectors
  })

  emitter.on('state:lastUpdate', lastUpdate => {
    state.lastUpdate = lastUpdate
  })

  emitter.on('state:init', () => {
    Object.assign(state, ENV_DATA, BUSS_DATA)
  })

  emitter.on('state:buss_init', () => {
    Object.assign(state, BUSS_DATA)
  })

  emitter.on('state:drate', drate => {
    state.drate = drate
  })
}
