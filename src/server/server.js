const express = require('express')
const http = require('http')
const socket = require('socket.io')
const open = require('open')
const config = require('../../config.json')
const app = express()
const serv = new http.Server(app)
const io = new socket.Server(serv)

async function initServer () {
		const port = 8080
		app.use(express.json())
		app.use(express.urlencoded({ extended: true }))
	
		app.get('/', (_, res) => {
			res.sendFile('index.html', { root: __dirname })
		})

		serv.listen(port, () => {
			console.log(`Webpage started on http://localhost:${port}/`)
      if (config.page.autoOpen) open('http://localhost:8080/')
		})
}

const servUtils = {
	newFlip: (result) => {
    io.emit('flip', result)
  }
}

module.exports = {
	initServer,
	servUtils
}
