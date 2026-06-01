"use strict"
const pug = require("pug")
const fs = require("node:fs")
const Cookies = require("cookies")
const { themeKey } = require("../config")

function handleLogout(req, res) {
  res.writeHead(401, {
    "Content-Type": "text/html; charset=utf-8",
    "WWW-Authenticate": 'Basic realm="Enter username and password."',
  })
  res.end(`<!DOCTYPE html><html lang="ja"><body><h1>ログアウトしました</h1><a href="/posts">ログイン</a></body></html>`)
  // res.writeHead(303, {
  //   Location: "http://logout:logout@localhost:8000/posts",
  // })
  // res.end()
}

function handleIndex(req, res) {
  res.writeHead(404, {
    "Content-Type": "text/html; charset=utf-8",
  })
  res.end(pug.renderFile("./views/index.pug"))
}

function handleNotFound(req, res) {
  res.writeHead(404, {
    "Content-Type": "text/html; charset=utf-8",
  })
  res.end(pug.renderFile("./views/404.pug"))
}

function handleBadRequest(req, res) {
  res.writeHead(400, {
    "Content-Type": "text/plain; charset=utf-8",
  })
  res.end("不正なリクエストです")
}

function handleChangeTheme(req, res) {
  const cookies = new Cookies(req, res)
  const curTheme = cookies.get(themeKey) !== "light" ? "light" : "dark"
  cookies.set(themeKey, curTheme)
  res.writeHead(303, {
    Location: "/posts",
  })
  res.end()
}

function handleFavicon(req, res) {
  res.writeHead(200, {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=604800",
  })
  const favicon = fs.readFileSync("./public/favicon.ico")
  res.end(favicon)
}

function handleStyleCssFile(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/css",
  })
  const style = fs.readFileSync("./public/style.css")
  res.end(style)
}

function handleStyleJsFile(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/javascript",
  })
  const js = fs.readFileSync("./public/tanukita.js")
  res.end(js)
}

module.exports = {
  handleLogout,
  handleIndex,
  handleNotFound,
  handleBadRequest,
  handleChangeTheme,
  handleFavicon,
  handleStyleCssFile,
  handleStyleJsFile,
}
