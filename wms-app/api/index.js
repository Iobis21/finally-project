// Vercel Serverless ფუნქცია — ბექენდი ონლაინ ვერსიისთვის (/api/*).
// იგივე json-server + json-server-auth, რაც ლოკალურად, მაგრამ მონაცემები მეხსიერებაშია:
// Vercel-ზე ფაილში ჩაწერა შეუძლებელია, ამიტომ ცვლილებები დროებითია (ფუნქციის გადატვირთვამდე).
import { createRequire } from 'module'
import fs from 'fs'

const require = createRequire(import.meta.url)

let app = null
let initError = null

function createApp() {
  const jsonServer = require('json-server')
  const auth = require('json-server-auth')

  // db.json ფუნქციის ფაილის გვერდით (../db.json) — არ ვეყრდნობით process.cwd()-ს
  const seed = JSON.parse(fs.readFileSync(new URL('../db.json', import.meta.url), 'utf8'))

  const server = jsonServer.create()
  const router = jsonServer.router(seed) // ობიექტი → მეხსიერებაში მომუშავე ბაზა
  server.db = router.db // json-server-auth-ს ბაზაზე წვდომა სჭირდება

  server.use(jsonServer.bodyParser)
  server.use('/api', auth)
  server.use('/api', router)
  return server
}

export default function handler(req, res) {
  if (!app && !initError) {
    try {
      app = createApp()
    } catch (error) {
      initError = error
    }
  }

  if (initError) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'API init failed', message: String(initError.message) }))
    return
  }

  return app(req, res)
}
