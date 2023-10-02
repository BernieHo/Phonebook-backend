const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

morgan.token('content', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
const app = express()
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(cors())
app.use(express.static('dist'))

let data = [
  {
    'id': 1,
    'name': 'Arto Hellas',
    'number': '040-123456'
  },
  {
    'id': 2,
    'name': 'Ada Lovelace',
    'number': '39-44-5323523'
  },
  {
    'id': 3,
    'name': 'Dan Abramov',
    'number': '12-43-234345'
  },
  {
    'id': 4,
    'name': 'Mary Poppendieck',
    'number': '39-23-6423122'
  }
]

const generateId = () => {
  return Math.floor(Math.random() * 1e6)
}

app.get('/api/persons', (request, response) => {
  response.json(data)
})

app.get('/info', (request, response) => {
  const now = new Date().toString()
  response.send(`<p>Phonebook has info for ${data.length} people</p><p>${now}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = data.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  if (data.map(person => person.id).includes(id)) {
    data = data.filter(person => person.id !== id)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  if (data.map(person => person.name).includes(body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }
  data = data.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})