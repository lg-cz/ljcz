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
  }
}

function url(collection, q) {
  if (q) {
    return `${host}${collection}?apiKey=${apiKey}&q=${q}`
  }
  return `${host}${collection}?apiKey=${apiKey}`
}
