require('dotenv').config()
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const express = require('express')
const app = express()

app.use(express.static('dist')) // Esto hace que el servidor sirva los archivos estáticos que están en la carpeta dist.
app.use(cors()) 
app.use(express.json()) //Esto hace que la propiedad body de la request sea un objeto JS y no undefined.
app.use(morgan('tiny'))

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({error: error.message})
    }
    
    next(error)
}

app.use(errorHandler)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    Person.find({}).then(persons => {
        response.send(
            '<p>Phonebook has info for ' + persons.length + ' people</p>' +
            '<p>' + new Date() + '</p>'
        )
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
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => {
    return Math.floor(Math.random() * 1000000)
}

app.post('/api/persons', (request, response, next) => {
    
    const body = request.body

    if (!body) {
        return response.status(400).json({
            error: 'content missing'
        })
    } else if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    }) 
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (!body) {
        return response.status(400).json({
            error: 'content missing'
        })
    } else if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})