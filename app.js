const http = require('http');
const fs = require('fs');
const path = require('path');

function paramsToObject(entries) {
  const result = {}
  let jsonObject = {}
  for (const [key, value] of entries) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  emailKey = result.email;
  delete result.email;
  jsonObject[emailKey] = result;
  return jsonObject;
}

const server = http.createServer();
server.on('request', function (req, res) {
  if (req.method === 'GET') {
    if (req.url === '/') {
      let html = fs.readFileSync('./index.html', 'utf-8');
      res.writeHead(200, { 'content-type': 'text/html' });
      res.write(html);
      res.end();
    } else if (req.url.match("\.css$")) {
      var cssPath = path.join(__dirname, req.url);
      var fileStream = fs.createReadStream(cssPath, "UTF-8");
      res.writeHead(200, { "Content-Type": "text/css" });
      fileStream.pipe(res);
    }
  }
  else if (req.method === 'POST') {
    console.log("inside post method");
    if (req.url === '/signup') {
      //console.log("inside signup");
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const urlParams = new URLSearchParams(body);
        console.log(urlParams);
        const entries = urlParams.entries(); //returns an iterator of decoded [key,value] tuples
        console.log(entries);
        const params = paramsToObject(entries); //{abc:"foo",def:"[asf]",xyz:"5"}
        //console.log(params);

        fs.readFile('db.json', function (err, data) {
          let dbData = JSON.parse(data);
          dbData.push(params);
          fs.writeFileSync('./db.json', JSON.stringify(dbData));
        })
        //let postData = JSON.stringify([params]);
      });
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end();
    } else if (req.url === '/login') {
      console.log("inside login");
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const urlParams = new URLSearchParams(body);
        const entries = urlParams.entries(); //returns an iterator of decoded [key,value] tuples
        const params = paramsToObject(entries); //{abc:"foo",def:"[asf]",xyz:"5"}
        console.log(params);

        fs.readFile('db.json', function (err, data) {
          console.log("inside read file");
          let dbData = JSON.parse(data);
          console.log(dbData);
          for (let i = 0; i < dbData.length; i++) {
            if (dbData[i].email === params.email) {
              if (dbData[i].password === params.password) {
                console.log("Matching !!");
                break;
              } else {
                console.log("Wrong password !!");
                break;
              }
            } 
            console.log("User not found");
          }
          
          //   for (let i=0;i<dbData.length;i++) {
          //     console.log(dbData[i].email);
          //  }
        })
      });
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end();
    }
  }
}).listen(3000);


// if (current) {
//   if (current.password === password) {
//     sendResponse(res, 200, JSON.stringify({"success": true, username: current.username}));
//   } else {
//     sendResponse(res, 403, JSON.stringify({"error": "Wrong Password"}));
//   }
// } else {
//   sendResponse(res, 403, JSON.stringify({"error": "Wrong Email"}));
// }
// break;