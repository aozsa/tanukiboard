"use strict"
const http = require("node:http")
const auth = require("http-auth")
const route = require("./lib/router")

const basic = auth.basic({
  realm: "Enter username and password",
  file: "./.htpasswd",
})
const server = http
  .createServer(
    basic.check((req, res) => {
      route.route(req, res)
    }),
  )
  .on("error", (e) => {
    console.error("Server Error", e)
  })
  .on("clientError", (e) => {
    console.error("Client Error", e)
  })

const port = process.env.PORT || 8000
server.listen(port, () => {
  console.info(`Listening at http://localhost:${port}/`)
})
