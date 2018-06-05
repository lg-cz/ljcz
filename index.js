var css = require('sheetify')
var choo = require('choo')

css('tachyons')

css('./style/animate.scss')
css('./style/icon.scss')
css('./style/index.scss')

var app = choo()

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(require('./store'))

app.route('/', require('./view'))

app.mount('body')
