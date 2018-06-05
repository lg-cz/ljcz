module.exports = (state, emitter) => {
  const INIT_DATA = {
    'rot': 0,
    'unrot': 0,
    'keyState': 'idle',
    'fetchState': 'banned',
    'recycle': 0,
    'harm': 0,
    'key': null,
    'villageId': null,
    'id': null,
    'score': 3,
    'collectorId': null,
    'loading': true,
    'collectors': []
  }

  Object.assign(state, INIT_DATA)

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

  emitter.on('state:score', score => {
    state.score = score
  })

  emitter.on('state:villageId', villageId => {
    state.villageId = villageId
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
}
