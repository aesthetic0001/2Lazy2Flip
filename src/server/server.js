const express = require('express')
const http = require('http')
const socket = require('socket.io')
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
			console.log(`Webpage started on localhost:${port}`)
		})
}

const servUtils = {
	newFlip: (result) => { io.emit('flip', result) }
}

module.exports = {
	initServer,
	servUtils
}
