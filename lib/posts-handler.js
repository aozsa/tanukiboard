"use strict"
const pug = require("pug")
const utils = require("./handler-utils")
require("dotenv/config")
const { PrismaPg } = require("@prisma/adapter-pg")
const { PrismaClient } = require("./generated/prisma/client")
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter, log: ["query"] })

const Cookies = require("cookies")
const { themeKey } = require("../config")

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

const crypto = require("node:crypto")
const onetimeTokenMap = new Map()

async function handle(req, res) {
  const cookies = new Cookies(req, res)
  const currentTheme = cookies.get(themeKey) || "light"
  cookies.set(themeKey, currentTheme, {
    maxAge: 30 * 86400 * 1000,
  })

  switch (req.method) {
    case "GET":
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'self'; script-src https://* http://localhost:8000/; style-src https://* http://localhost:8000/; font-src https://*;",
      })
      const posts = await prisma.post.findMany({ orderBy: { id: "asc" } })
      posts.forEach((post) => {
        post.relativeCreatedAt = dayjs(post.createdAt).tz().fromNow()
        post.absoluteCreatedAt = dayjs(post.createdAt).tz().format("YYYY年MM月DD日 HH時mm分ss秒")
      })
      const onetimeToken = crypto.randomBytes(8).toString("hex")
      onetimeTokenMap.set(req.user, onetimeToken)
      res.end(
        pug.renderFile("./views/posts.pug", {
          currentTheme,
          posts,
          user: req.user,
          onetimeToken,
        }),
      )
      console.info(`View: user=${req.user}, addr=${req.socket.remoteAddress}, ua=${req.headers["user-agent"]}`)
      break

    case "POST":
      let body = ""
      req
        .on("data", (chunk) => {
          body += chunk
        })
        .on("end", async () => {
          const params = new URLSearchParams(body)
          const origContent = params.get("content")

          const reqOnetimeToken = params.get("onetimeToken")
          if (!origContent) {
            handleRedirectPosts(req, res)
            return
          }
          if (!reqOnetimeToken) {
            utils.handleBadRequest(req, res)
            return
          }
          if (onetimeTokenMap.get(req.user) !== reqOnetimeToken) {
            utils.handleBadRequest(req, res)
            return
          }

          console.info("Sent:", origContent)
          const content = origContent
            .replaceAll("た", "")
            .replaceAll("タ", "")
            .replaceAll("だ", "゛")
            .replaceAll("ダ", "゛")
          await prisma.post.create({
            data: {
              content,
              original: origContent,
              postedBy: req.user,
            },
          })
          onetimeTokenMap.delete(req.user)
          handleRedirectPosts(req, res)
        })
      break
    default:
      utils.handleBadRequest(req, res)
      break
  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    Location: "/posts",
  })
  res.end()
}

function handleDelete(req, res) {
  switch (req.method) {
    case "POST":
      let body = ""
      req
        .on("data", (chunk) => {
          body += chunk
        })
        .on("end", async () => {
          const params = new URLSearchParams(body)
          const id = parseInt(params.get("id"))
          const reqToken = params.get("onetimeToken")
          if (!id) {
            handleRedirectPosts(req, res)
            return
          }
          if (!reqToken) {
            utils.handleBadRequest(req, res)
            return
          }
          if (onetimeTokenMap.get(req.user) !== reqToken) {
            utils.handleBadRequest(req, res)
            return
          }

          const post = await prisma.post.findUnique({ where: { id } })
          if (req.user === post.postedBy || req.user === "admin") {
            await prisma.post.delete({ where: { id } })
            console.info(`Deleted: user=${req.user}, addr=${req.socket.remoteAddress}, ua=${req.headers["user-agent"]}`)
            onetimeTokenMap.delete(req.user)
            handleRedirectPosts(req, res)
          }
        })
      break
    default:
      utils.handleBadRequest(req, res)
      break
  }
}

module.exports = {
  handle,
  handleDelete,
}
