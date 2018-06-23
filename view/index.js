var html = require('choo/html')
var css = require('sheetify')
var Nanocomponent = require('choo/component')
var mitt = require('mitt')
var amme = mitt()
const { postKey, getData, postData } = require('../fetch')

var TITLE = '称重记录'

module.exports = view

class QLogout extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
    this.handleClick = this.handleClick.bind(this)
  }

  createElement () {
    return html`
      <button
        onclick=${this.handleClick}
        class='fr bn bg-purple-blue h2 br2 white'>
        退出
      </button>
    `
  }

  handleClick () {
    localStorage.removeItem('ljcz:id')
    localStorage.removeItem('ljcz:villageId')
    localStorage.removeItem('ljcz:key')
    amme.off('allow')
    this.emit('state:init')
    this.emit('render')
  }

  update () {
    return true
  }
}

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
      this.emit('state:lastUpdate', data.lastUpdate)
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
  constructor (state, emit, qRate) {
    super()
    this.state = state
    this.emit = emit
    this.submit = this.submit.bind(this)
    this.machineFn= this.machineFn.bind(this)
    this.allow = this.allow.bind(this)
    this.qRate = qRate
    this.machine = {
      banned: {
        ALLOW: 'idle'
      },
      idle: {
        CLICK: 'loading'
      },
      goat: {
        CLICK: 'loading'
      },
      loading: {
        RESOLVE: 'goat',
        REJECT: 'error',
        DUPLICATION: 'duplication'
      },
      error: {
        CLICK: 'loading'
      },
      duplication: {
        CLICK: 'loading'
      }
    }
    this.command = {
      idle: () => {},
      loading: this.loading.bind(this),
      goat: () => {
        this.emit('state:buss_init')
        this.emit('render')
      },
      error: () => {},
      duplication: () => {}
    }
    this.text = {
      banned: '提交',
      idle: '提交',
      loading: '提交中...',
      goat: '提交成功',
      error: '网络错误',
      duplication: '重复提交'
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

  allow () {
    this.machineFn('ALLOW')()
  }

  load () {
    amme.on('allow', this.allow)
  }

  unload () {
    amme.off('allow', this.allow)
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
    var data = {
      id: Number(this.state.id),
      villageId: Number(this.state.villageId),
      collectorId: Number(this.state.collectorId),
      rot: this.state.rot,
      unrot: this.state.unrot,
      harm: this.state.harm,
      recycle: this.state.recycle,
      battery: this.state.battery,
      bottle: this.state.bottle,
      bag: this.state.bag,
      bulb: this.state.bulb,
      score: this.state.score
    }

    var midnight = new Date()

    midnight.setHours(0,0,0,0)

    if (this.state.lastUpdate && this.state.lastUpdate > midnight.getTime()) {
      this.machineFn('DUPLICATION')()
      return
    }

    var t = this.state.rot + this.state.unrot + this.state.harm + this.state.recycle
    var percent = ((this.state.rot + this.state.harm + this.state.recycle)/t  * 100).toFixed(1) + '%'
    this.emit('state:drate', percent)
    this.qRate.render()

    postData(data, () => {
      this.machineFn('RESOLVE')()
    }, () => {
      this.machineFn('REJECT')()
    })
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

class QRate extends Nanocomponent {
  constructor (state, emit) {
    super()
    this.state = state
    this.emit = emit
  }

  createElement () {
    return html`
      <p class='f4 purple-blue'>重量：<span class='fr'>减量率: <b class='black'>${this.state.drate}</b></span></p>
    `
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
    this.qRate = new QRate(state, emit)
    this.qScore = new QScore(state, emit)
    this.qkeySubmit = new QkeySubmit(state, emit)
    this.qSubmit = new QSubmit(state, emit, this.qRate)
    this.qLogout = new QLogout(state, emit)
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
                  ${this.qLogout.render()}
                </p>
                ${this.qDropdown.render()}
                ${this.qScore.render()}
                ${this.qRate.render()}
                <input onchange=${this.handleChange} name='rot' class='semantic-input db' type='number' placeholder='可腐烂垃圾 (kg)' />
                <input onchange=${this.handleChange} name='unrot' class='semantic-input db' type='number' placeholder='不可腐烂垃圾 (kg)' />
                <input onchange=${this.handleChange} name='recycle' class='semantic-input db' type='number' placeholder='可回收 (kg)' />
                <input onchange=${this.handleChange} name='harm' class='semantic-input db' type='number' placeholder='有毒有害 (kg)' />
                <p class='f4 purple-blue'>有毒有害垃圾个数：</p>
                <input onchange=${this.handleChange} name='battery' class='semantic-input db' type='number' placeholder='电池 (个)' />
                <input onchange=${this.handleChange} name='bulb' class='semantic-input db' type='number' placeholder='节能灯泡 (个)' />
                <input onchange=${this.handleChange} name='bottle' class='semantic-input db' type='number' placeholder='农药瓶 (个)' />
                <input onchange=${this.handleChange} name='bag' class='semantic-input db' type='number' placeholder='农药袋 (个)' />
                <p class='w-100'><a href='https://lg-xjjg.github.io/' class='no-underline f3 pt4 pb4'>统计结果</a></p>
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
    if (this.state.loading && this.state.key) {
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
