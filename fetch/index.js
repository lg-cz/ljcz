var host = 'https://api.mlab.com/api/1/databases/my-db1/collections/'
var apiKey = 'q4vsE-BwyJnqZDJSC_d1240H82QBoKVv'

module.exports = {
  postKey (q, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}

    fetch(url('pollingman', q))
    .then(res => res.json())
    .then(resolve)
    .catch(reject)
  },

  getData (collection, q, resolve, reject) {
    resolve = resolve ? resolve : function (){}
    reject = reject ? reject : function (){}
    fetch(url(collection, q))
    .then(res => res.json())
    .then(resolve)
    .catch(reject)
  },

  postData (data, resolve, reject) {
    fetch(url('collector', JSON.stringify({id : data.collectorId })))
    .then(res => res.json())
    .then(datas => {
      var collector = datas[0]
      collector[`score${data.score}`]++

      var arr = [ 'battery', 'bottle', 'bag', 'bulb' ]

      arr.forEach(o => {
        if (collector[o] === void 0) {
          collector[o] = 0
        } else {
          collector[o] += data[o]
        }        
      })    

      collector.lastUpdate = data.lastUpdate
      
      return collector
    })
    .then(collector => {
      return fetch(url('collector'), {
        method: 'post',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(collector)
      })
    })
    .then(() => {
      return fetch(url('village', JSON.stringify({id : data.villageId })))
    })
    .then(res => res.json())
    .then(datas => {
      var village = datas[0]
      
      var arr = [ 'rot', 'unrot', 'recycle', 'harm' ]

      arr.forEach(o => {
        if (village[o]=== void 0) {
          village[o] = 0
        }
        village[o] += data[o]
      })

      var midnight = new Date()

      midnight.setHours(0,0,0,0)

      if (!village.cDate || village.cDate < midnight.getTime()) {
        village.t_rot = 0
        village.t_unrot = 0
        village.t_recycle = 0
        village.t_harm = 0
        var d = new Date()
        village.cDate = d.getTime()
      }

      arr.forEach(o => {
        if (village['t_' + o] === void 0) {
          village['t_' + o] = 0
        }
        village['t_' + o] += data[o]
      })        

      return village
    })
    .then(village => {
      return fetch(url('village'), {
        method: 'post',
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(village)
      })
    })
    .then(resolve)
    .catch(reject)
  }
}

function url(collection, q) {
  if (q) {
    return `${host}${collection}?apiKey=${apiKey}&q=${q}`
  }
  return `${host}${collection}?apiKey=${apiKey}`
}
