require('dotenv').config()
const express = require('express')
const pgp = require('pg-promise')()

pgp.pg.defaults.ssl = {
  rejectUnauthorized: false,
}

const PORT = process.env.PORT || 3000
const DB = pgp(process.env.DATABASE_URL)


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/db/seed', async (req, res) => {
  DB
    .any('CREATE TABLE test_table(id SERIAL PRIMARY KEY, key TEXT NOT NULL UNIQUE, value TEXT);')
    .then(_ => {
      res.send('DB successfully seeded')
    })
    .catch(error => res.send(`Unable to seed database: ${error}`))
})

app.post('/db/upsert', (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    DB
      .any('INSERT INTO test_table(key, value) VALUES($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value])
      .catch(error => {
        res.send(`Unable to upsert item into database: ${error}`)
        return
      })
  }

  res.send('Added data to database')
})

app.get('/', (req, res) => {
  res.send('Hello DevOps Tooling!')
})

app.get('/db', async (req, res) => {
  DB
    .any('SELECT key, value FROM test_table')
    .then(data => res.send(data))
    .catch(error => res.send(`Unable to retrieve items from database: ${error.message}`))
})

app.get('/db/query/:id', (req, res) => {
  const id = req.params.id

  if (!id) {
    res.send('Please provide an id')
    return
  }

  DB
    .any('SELECT key, value FROM test_table WHERE id = $1', id)
    .then(data => res.send(data[0]))
    .catch(error => res.send(`Unable to retrieve item from database: ${error}`))
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
