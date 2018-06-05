var html = require('choo/html')
var css = require('sheetify')
var Nanocomponent = require('choo/component')
var mitt = require('mitt')
var amme = mitt()
const { postKey, getData } = require('../fetch')

var TITLE = '分类记录'

module.exports = view

class QDropdown extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.handleClick = this.handleClick.bind(this)
    this.clickList = this.clickList.bind(this)
    this.name = '收运员'
  }

  createElement () {
    return html`
      <div
        class="w-60 relative">
        <div
          onclick=${this.handleClick}
          class="flex items-center semantic-input w-100 justify-between">
          <span class="dib">${this.name}</span>
          <i class="icon icon-20 icon_dropdown dib"></i>
        </div>
        <ul class='mt0 w-100 pa0 list absolute top100 left-0 z-100 ${this.isShow ? "": "hide"}'>
          ${this.state.collectors.map(d => html`
            <li
              onclick=${this.clickList(d)}
              class='w-100 semantic-input br0 mb0'>${d.name}</li>
          `)}
        </ul>
      </div>
    `
  }

  clickList (data) {
    return e => {
      this.name = data.name
      this.isShow = false
      amme.emit('allow')
      this.emit('state:collectorId', data.id)

      this.render()
    }
  }

  handleClick () {
    this.isShow = !this.isShow
    this.render()
  }

  update () {
    return true
  }
}

class QSubmit extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.submit = this.submit.bind(this)
    this.machineFn= this.machineFn.bind(this)
    this.machine = {
      banned: {
        ALLOW: 'idle'
      },
      idle: {
        CLICK: 'loading'
      },
      loading: {
        RESOLVE: 'goat',
        REJECT: 'error'
      },
      error: {
        CLICK: 'loading'
      }
    }
    this.command = {
      idle: () => {},
      loading: this.loading.bind(this),
      goat: () => {
        setTimeout(() => {
          var win = window.open('', '_self')
          win.close()
        }, 1000)
      },
      error: () => {}
    }
    this.text = {
      banned: '提交',
      idle: '提交',
      loading: '提交中...',
      goat: '提交成功',
      error: '网络错误'
    }
  }

  createElement () {
    return html`
      <button
        onclick=${this.submit()}
        class='bn bg-purple-blue h2 br2 white ${this.state.fetchState === "banned" ? "disabled" : ""}'>
        ${this.text[this.state.fetchState]}
      </button>
    `
  }

  submit () {
    return this.machineFn('CLICK')
  }

  load () {
    amme.on('allow', () => {
      this.machineFn('ALLOW')()
    })
  }

  machineFn (action) {
    return () => {
      var nextState = this.transition(this.state.fetchState, action)
      if (!nextState) return
      this.emit('state:fetchState', nextState)
      this.command[nextState]()
      this.render()
    }
  }

  loading () {
    // var data = {
    //   id: Number(this.state.id),
    //   villageId: Number(this.state.villageId),
    //   score: this.state.score,
    //   photo: this.state.photo,
    //   date: new Date().getTime()
    // }
    //
    // postData(data, () => {
    //   this.machineFn('RESOLVE')()
    // }, () => {
    //   this.machineFn('REJECT')()
    // })
  }

  transition (s, a) {
    return this.machine[s][a]
  }

  update () {
    return true
  }
}

class QkeySubmit extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.submit = this.submit.bind(this)
    this.machineFn= this.machineFn.bind(this)
    this.machine = {
      idle: {
        CLICK: 'loading'
      },
      loading: {
        RESOLVE: 'goat',
        REJECT: 'error'
      },
      error: {
        CLICK: 'loading'
      }
    }
    this.command = {
      loading: this.loading.bind(this),
      goat: () => {

      },
      error: () => {}
    }
    this.text = {
      idle: '提交',
      loading: '提交中...',
      goat: '提交成功',
      error: '号码错误'
    }
  }

  loading () {
    var key = document.getElementById('key').value

    postKey(JSON.stringify({ key }), (datas) => {
      if (datas.length) {
        var data = datas[0]
        this.emit('state:id', data.id)
        this.emit('state:villageId', data.villageId)
        this.emit('state:key', data.key)

        localStorage.setItem('ljcz:id', data.id)
        localStorage.setItem('ljcz:villageId', data.villageId)
        localStorage.setItem('ljcz:key', data.key)

        this.machineFn('RESOLVE')()
        setTimeout(() => {
          this.emit('render')
        }, 500)
      } else {
        this.machineFn('REJECT')()
      }
    }, () => {
      this.machineFn('REJECT')()
    })
  }

  createElement () {
    return html`
      <button
        onclick=${this.submit()}
        class='bn bg-purple-blue h2 br2 white'>
        ${this.text[this.state.keyState]}
      </button>
    `
  }

  submit () {
    return this.machineFn('CLICK')
  }

  machineFn (action) {
    return () => {
      var nextState = this.transition(this.state.keyState, action)
      if (!nextState) return
      this.emit('state:keyState', nextState)
      this.command[nextState]()
      this.render()
    }
  }

  transition (s, a) {
    return this.machine[s][a]
  }

  update () {
    return true
  }
}

class QScore extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.score = this.score.bind(this)
  }

  createElement () {
    var score = this.state.score
    return html`
      <div class='w-100 bt bw1 b--light-gray pt3 pb1 mt2'>
        <div class='w-80 flex justify-between'>
          <i onclick=${this.score(1)} class='icon ${score === 1 ? "icon_good_active animated pulse" : "icon_good"}'></i>
          <i onclick=${this.score(2)} class='icon ${score === 2 ? "icon_soso_active animated pulse" : "icon_soso"}'></i>
          <i onclick=${this.score(3)} class='icon ${score === 3 ? "icon_bad_active animated pulse" : "icon_bad"}'></i>
          <i onclick=${this.score(4)} class='icon ${score === 4 ? "icon_awful_active animated pulse" : "icon_awful"}'></i>
        </div>
      </div>
    `
  }

  score (score) {
    return e => {
      this.emit('state:score', score)
      this.render()
    }
  }

  update () {
    return true
  }
}

class Component extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.page = 'polling'
    this.unHeightFix = true
    this.state = state
    this.emit = emit
    this.handleChange = this.handleChange.bind(this)
    this.qScore = new QScore(state, emit)
    this.qkeySubmit = new QkeySubmit(state, emit)
    this.qSubmit = new QSubmit(state, emit)
    this.qDropdown = new QDropdown(state, emit, this.qSubmit)
  }

  createElement () {
    var score = this.state.score

    if (localStorage.getItem('ljcz:id')) {
      this.emit('state:id', localStorage.getItem('ljcz:id'))
      this.emit('state:villageId', localStorage.getItem('ljcz:villageId'))
      this.emit('state:key', localStorage.getItem('ljcz:key'))
    }

    return html`
      <main class='w-100 flex flex-column flex-auto bg-dz items-center'>
        <header class='w-100 tc purple-blue f3 bold05 bg-white pv2 tracked'>称重纪录</header>
        ${
          this.state.key ?
          (
            this.state.loading ?
            html`
              <section class='w-90'>
                <div class='tc mt4'>
                  <i class='icon icon_spinner icon-40'></i>
                </div>
              </section>
            ` :
            html`
              <section class='w-90'>
                <p class='f5 navy'>
                  ${this.qSubmit.render()}
                </p>
                ${this.qDropdown.render()}
                ${this.qScore.render()}
                <p class='f4 purple-blue'>重量：</p>
                <input onchange=${this.handleChange} name='rot' class='semantic-input db' type='number' placeholder='可腐烂垃圾 (kg)' />
                <input name='unrot' class='semantic-input db' type='number' placeholder='不可腐烂垃圾 (kg)' />
                <input name='recycle' class='semantic-input db' type='number' placeholder='可回收 (kg)' />
                <input name='harm' class='semantic-input db' type='number' placeholder='有毒有害 (kg)' />
                <p class='f4 purple-blue'>有毒有害垃圾个数：</p>
                <input class='semantic-input db' type='number' placeholder='电池 (个)' />
                <input class='semantic-input db' type='number' placeholder='节能灯泡 (个)' />
                <input class='semantic-input db' type='number' placeholder='农药瓶 (个)' />
                <input class='semantic-input db' type='number' placeholder='农药袋 (个)' />
              </section>
            `
          ) :
          html`
            <section class='w-90'>
              <p class='w-100 f5 navy bb pb3 bw1 b--light-gray'>
                ${this.qkeySubmit.render()}
              </p>
              <input id='key' class='semantic-input' type='text' placeholder='请输入巡检员号' />
            </section>
          `
        }
      </main>
    `
  }

  load () {
    if (this.state.loading) {
      var villageId = Number(this.state.villageId)
      getData('collector', JSON.stringify({ villageId }), datas => {
        this.emit('state:collectors', datas)
        this.emit('state:loading', false)
        this.emit('render')
      }, err => {
        console.log(err)
      })
    }
  }

  handleChange (e) {
    var num = 0

    if (!isNaN(e.target.value)) {
      num = Number(e.target.value)
    }
    
    this.emit(`state:${e.target.name}`, num)
  }

  update () {
    return true
  }
}

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  var component = new Component(state, emit)

  return html`
    <body class='w-100 flex flex-column bg-n-white'>
      ${component.render()}
    </body>
  `
}
