const http = require("http");
const fs = require("fs");
const path = require("path");


const server = http.createServer();
server
  .on("request", function (req, res) {
    if (req.method === "GET") {
      if (req.url === "/") {
        let html = fs.readFileSync("./index.html", "utf-8");
        res.writeHead(200, {
          "content-type": "text/html",
        });
        res.write(html);
        res.end();
      } else if (req.url.match(".css$")) {
        var cssPath = path.join(__dirname, req.url);
        var fileStream = fs.createReadStream(cssPath, "UTF-8");
        res.writeHead(200, {
          "Content-Type": "text/css",
        });
        fileStream.pipe(res);
      }
    } else if (req.method === "POST") {
      console.log("inside post method");
      if (req.url === "/signup") {
        console.log("inside signup");
        let body = [];
        req
          .on("data", (chunk) => {
            body.push(chunk);
          })
          .on("end", () => {
            body = Buffer.concat(body).toString();
            const urlParams = new URLSearchParams(body);
            console.log(urlParams);
            let formData = {};
            urlParams.forEach((key, value) => {
              formData[value] = key;
              return formData;
            });
            console.log(formData);
            let emailParam = formData.email;
            let isExists = false;
            let dbData = {};
            let dataToPush = {};
            let data = fs.readFileSync("./db.json", {
              encoding: "utf8",
              flag: "r",
            });
            dbData = JSON.parse(data);
            for (let item of dbData) {
              if (item[emailParam]) {
                isExists = true;
                break;
              }
            }
            if (isExists) {
              sendResponse(
                res,
                400,
                JSON.stringify({
                  error: "Email already exists",
                })
              );
            } else {
              dataToPush = {
                [formData.email]: {
                  password: formData.password,
                  username: formData.username,
                },
              };
              try {
                dbData.push(dataToPush);
                fs.writeFileSync("./db.json", JSON.stringify(dbData));
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write('Signed up successfully!');
                res.end();
              } catch (error) {
                res.writeHead(505, {'Content-Type': 'application/json'});
                res.write('Server Error');
                res.end();
              }
            }
          });
      } else if (req.url === "/login") {
        console.log("inside login");
        let body = [];
        req
          .on("data", (chunk) => {
            body.push(chunk);
          })
          .on("end", () => {
            body = Buffer.concat(body).toString();
            const urlParams = new URLSearchParams(body);
            console.log(urlParams);
            let formData = {};
            urlParams.forEach((key, value) => {
              formData[value] = key;
              return formData;
            });
            console.log(formData);
            let emailParam = formData.email;
            let isExists = false;
            let dbData = {};
            let dataToValidate = {};
            let data = fs.readFileSync("./db.json", {
              encoding: "utf8",
              flag: "r",
            });
            dbData = JSON.parse(data);
            for (let item of dbData) {
              if (item[emailParam]) {
                dataToValidate = {
                  'email': item[emailParam],
                  'password': item[emailParam].password
                }
                isExists = true;
                break;
              }
            }
            if (isExists) {
              if (dataToValidate.password == formData.password) {
                console.log("Matching");
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.write('Logged in successfully!');
                res.end();
              } else {
                res.writeHead(403, {'Content-Type': 'application/json'});
                res.write('Wrong Credentials');
                res.end();
                console.log("Wrong Credentials");
              }
            } else {
              res.writeHead(404, {'Content-Type': 'application/json'});
              res.write('Not Found!');
              res.end();
              console.log("not found");
            }
          });
      }
    }
  })
  .listen(3000);
