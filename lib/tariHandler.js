const pug = require("pug")
const utils = require("./handler-utils")
const Cookies = require("cookies")
const { themeKey } = require("../config")
const { prisma } = require("./db")

const dayjs = require("dayjs")
const utc = require("dayjs/plugin/utc")
const timezone = require("dayjs/plugin/timezone")
const relativeTime = require("dayjs/plugin/relativeTime")
require("dayjs/locale/ja")
dayjs.locale("ja")
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.tz.setDefault("Asia/Tokyo")

async function handle(req, res) {
  const cookies = new Cookies(req, res)
  const currentTheme = cookies.get(themeKey) || "light"

  switch (req.method) {
    case "GET":
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'self'; script-src https://* http://localhost:8000/; style-src https://* http://localhost:8000/; font-src https://*;",
      })
      const posts = await prisma.post.findMany({ orderBy: { id: "asc" } })
      posts.forEach((post) => {
        post.content = post.original
        post.relativeCreatedAt = dayjs(post.createdAt).tz().fromNow()
        post.absoluteCreatedAt = dayjs(post.createdAt).tz().format("YYYY年MM月DD日 HH時mm分ss秒")
      })

      res.end(
        pug.renderFile("./views/poststari.pug", {
          currentTheme,
          posts,
          user: req.user,
        }),
      )
      console.info(`View: user=${req.user}, addr=${req.socket.remoteAddress}, ua=${req.headers["user-agent"]}`)
      break

    default:
      utils.handleBadRequest(req, res)
      break
  }
}

module.exports = {
  handle,
}
