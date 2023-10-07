const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')

const Person = require('./models/person')

morgan.token('content', (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError' || error.name === 'BSONError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  return response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))
app.use(express.static('dist'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  const person = new Person({
    name: body.name, number: body.number
  })
  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.get('/info', (request, response) => {
  Person.count({}).then(personCount => {
    const now = new Date().toString()
    response.send(`<p>Phonebook has info for ${personCount} people</p><p>${now}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(person => {
      if (person) {
        response.status(204).end()
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndUpdate(request.params.id, { number: request.body.number }, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch((error => next(error)))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
