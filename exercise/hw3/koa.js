const Koa = require('koa');
const app = module.exports = new Koa();

app.use(async function(ctx) {
  switch(ctx.url){
    case'/hello': ctx.body = "你好" ; break
    case '/name' :  ctx.body = "周聖洋"; break
    case '/id' :  ctx.body = "110510510"; break
    default :ctx.status = 404;
  }



});

if (!module.parent) app.listen(3000);