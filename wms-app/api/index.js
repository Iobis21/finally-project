// Vercel Serverless ფუნქცია — ბექენდი ონლაინ ვერსიისთვის (/api/*).
// იგივე json-server + json-server-auth, რაც ლოკალურად, მაგრამ მონაცემები მეხსიერებაშია:
// Vercel-ზე ფაილში ჩაწერა შეუძლებელია, ამიტომ ცვლილებები დროებითია (ფუნქციის გადატვირთვამდე).
import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

const require = createRequire(import.meta.url)
const jsonServer = require('json-server')
const auth = require('json-server-auth')

const seed = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'db.json'), 'utf8'))

const app = jsonServer.create()
const router = jsonServer.router(seed) // ობიექტი → მეხსიერებაში მომუშავე ბაზა
app.db = router.db // json-server-auth-ს ბაზაზე წვდომა სჭირდება

app.use(jsonServer.defaults({ logger: false }))
app.use('/api', auth)
app.use('/api', router)

export default app
