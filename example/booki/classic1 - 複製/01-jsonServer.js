var fs = require('mz/fs')
var path = require('path')
var logger = require('koa-logger')
var koaStatic = require('koa-static')
var Koa = require('koa')
var Router = require('koa-router')
var M = require('../lib/model')
var V = require('./view')

var app = new Koa()
var router = new Router()

var json = async function (ctx, next) { // view(mdFile):convert *.md to html
  console.log('json()')
  const book = ctx.params.book
  const file = ctx.params.file || 'README.md'
  const type = path.extname(file)
  console.log('book=%s file=%s', book, file)
  const bookObj = await M.getBook(book)
  const fileObj = await M.getBookFile(book, file)
  const bookFile = { book:bookObj, file:fileObj }
  console.log('bookFile=%j', bookFile)
  ctx.body = JSON.stringify(bookFile, null, 2)
  ctx.type = 'json'
}

app.use(logger())
app.use(koaStatic(path.join(__dirname, 'web')))
app.use(koaStatic(path.join(__dirname, 'user')))

router
  .get('/', function (ctx, next) {
    console.log('ctx=%j', ctx)
    ctx.redirect(M.setting.home)
  })
  .get('/view/:book/:file?', view)
  .get('/json/:book/:file?', json)

async function main() {
  await M.init(__dirname + '/../')
  V.init(__dirname)
  var port = M.setting.port || 8080
  app.use(router.routes()).listen(port)
  console.log('http server started: http://localhost:' + port)
}

main()
