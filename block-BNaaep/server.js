var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');

var userPath = __dirname + `/contacts/`;

const server = http.createServer(handleRequest);

function handleRequest(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var store = ``;

  req.on(`data`, (chunk) => {
    store += chunk;
  });

  req.on(`end`, () => {
    if (req.method === `GET` && req.url === `/form`) {
      res.setHeader('Content-Type', 'text/html');
      fs.readFile('./form.html', (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    } else if (req.method === `GET` && req.url.startsWith('/assets/')) {
      fs.readFile('.' + req.url, (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    } else if (req.method === `GET` && req.url === `/about`) {
      res.setHeader('Content-Type', 'text/html');
      fs.readFile('./about.html', (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    } else if (req.url === `/contacts` && req.method === `POST`) {
      var data = qs.parse(store); // { }
      console.log(data);
      var username = data.username;
      fs.open(userPath + username + `.json`, `wx`, (err, fd) => {
        if (err) return console.log(err);
        fs.writeFileSync(fd, JSON.stringify(data));
        res.end(`${username} created successfully`);
      });
    } else if (parsedUrl.pathname === `/contacts` && req.method === `GET`) {
      var username = parsedUrl.query.username;
      console.log(username);
      fs.readFile(userPath + username + `.json`, (err, content) => {
        console.log(err, content);
        if (err) return console.log(err);
        res.setHeader(`Content-Type`, `application/json`);
        res.end(content);
      });
    } else if (parsedUrl.pathname === `/contacts` && req.method === `PUT`) {
      var username = parsedUrl.query.username;
      console.log(username);
      fs.open(userPath + username + `.json`, `r+`, (err, fd) => {
        if (err) return console.log(err);
        fs.ftruncate(fd, (err) => {
          if (err) return console.log(err);
          fs.writeFile(fd, store, (err) => {
            if (err) return console.log(err);
            fs.close(fd, () => {
              res.end(`${username} updated successfully`);
            });
          });
        });
      });
    } else if (parsedUrl.pathname === `/contacts` && req.method === `DELETE`) {
      var username = parsedUrl.query.username;
      fs.unlink(userPath + username + `.json`, (err) => {
        if (err) return console.log(err);
        res.end(`${username} deleted successfully`);
      });
    } else {
      res.statusCode = 404;
      res.end(`Page Not Found`);
    }
  });
}
server.listen(5000, () => {
  console.log(`Server is listing on port 5k`);
});
