const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');
const req = require('express/lib/request');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// MODELS
class User {
  constructor(name, username){
      this.id = uuidv4()
      this.name = name
      this.username = username
      this.todos = []
    }

    findTodoById(id){
      return this.todos.find(todo => todo.id === id)
    }
}

class Todo {
  constructor(title, deadline){
    this.id = uuidv4()
    this.title = title
    this.done = false
    this.deadline = new Date(deadline)
    this.created_at = new Date()
  }

  setDeadline(deadline) {
    this.deadline = new Date(deadline)
  }

  finish() {
    this.done = true
  }
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)

  if (!user) return response.status(404).json({error: "user not found!"})

  request.user = user
  next()
}

function checksExistsTodo(request, response, next) {
  const { user } = request
  const { id } = request.params

  const todo = user.findTodoById(id)
  if (!todo) return response.status(404).json({ error: "todo not found!" })

  request.todo = todo
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (users.some(user => user.username === username)) return response.status(400).json({error: "User already exists!"})

  const user = new User(name, username)
  users.push(user);

  response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  response.status(200).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = new Todo(title, deadline)
  user.todos.push(todo)

  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request
  const { title, deadline } = request.body

  todo.title = title
  todo.setDeadline(deadline)

  return response.status(201).send(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { todo } = request
  
  todo.finish()
  return response.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request

  user.todos.splice(todo, 1)
  return response.status(204).send()
});

module.exports = app;