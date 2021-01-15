// 필요한 모듈 import
const express = require('express')
const http = require('http')
const socket = require('socket.io')
const { v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')

// express http 서버 생성 후, 서버를 socket.io에 바인딩
const app = express()
const server = http.Server(app)
const io = socket(server)

const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use('/peerjs', peerServer)

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`) // uuid 생성된 URL로 redirect
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room }) // room.ejs 렌더링, 생성된 uuid를 roomId로 넘김
})

io.on('connection', socket => {
    
    socket.on('joinRoom', (roomId, userId) => {
      socket.join(roomId)
      socket.to(roomId).broadcast.emit('userConnected', userId)
      
      socket.on('message', (message, userId) => {
          io.to(roomId).emit('creatMessage', message, userId)
      })

      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('userDisconnected', userId)
      })
    })
})

server.listen(3000)