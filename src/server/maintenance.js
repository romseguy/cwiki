const fs = require("fs");
const http = require("http");

const server = http.createServer(function (request, response) {
  fs.createReadStream("./public/maintenance.html", {
    bufferSize: 4 * 1024,
    encoding: "utf-8"
  }).pipe(response);
});

server.listen(8001);
