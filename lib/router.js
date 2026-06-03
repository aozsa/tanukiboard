"use strict"
const postsHandler = require("./posts-handler")
const tariHandler = require("./tariHandler")
const util = require("./handler-utils")

function route(req, res) {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
    util.handleNotFound(req, res)
  }

  switch (req.url) {
    case "/":
      util.handleIndex(req, res)
      break
    case "/posts":
      postsHandler.handle(req, res)
      break
    case "/posts/delete":
      postsHandler.handleDelete(req, res)
      break
    case "/poststari":
      tariHandler.handle(req, res)
      break
    case "/logout":
      util.handleLogout(req, res)
      break
    case "/changeTheme":
      util.handleChangeTheme(req, res)
      break
    case "/favicon.ico":
      util.handleFavicon(req, res)
      break
    case "/style.css":
      util.handleStyleCssFile(req, res)
      break
    case "/tanukita.js":
      util.handleStyleJsFile(req, res)
      break
    default:
      util.handleNotFound(req, res)
      break
  }
}

module.exports = {
  route,
}
