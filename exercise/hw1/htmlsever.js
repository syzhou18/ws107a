const http = require('http')

http.createServer((req, res) => {
    console.log('url=', req.url)
    res.setHeader('Content-Type', 'text/plain ; charset=utf-8')
   
  switch(req.url){
    case '/' : res.write(" "); break  
    case '/hello' :  res.write("你好"); break
      case '/name' :  res.write("周聖洋"); break
      case '/id' :  res.write("110510510"); break
      default : res.statusCode = 404;
   }
   res.end()
  
}).listen(3000)

console.log('Server runnint at http://localhost:3000/')







