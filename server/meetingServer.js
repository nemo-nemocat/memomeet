// 필요한 모듈 import
const express = require('express')
const http = require('http')
const serverPort = 3003
const socket = require('socket.io')
const { v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// express http 서버 생성 후, 서버를 socket.io에 바인딩
const app = express()
const server = http.Server(app)
const io = socket(server)
app.use(cors());
app.use(bodyParser.json());

const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use('/peerjs', peerServer)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'))

// 3000/meeting/ -> 3003/ 으로 바꿔주는데 3000/ 으로 보임
// app.get('/meeting', (req, res) => {
//     res.redirect("/meeting-start") // uuid 생성된 URL로 redirect
// })

app.get('/:room', (req, res) => {
    console.log("meeting enter");
    res.render('room', { roomId: req.params.room }) // room.ejs 렌더링, 생성된 uuid를 roomId로 넘김
})

io.on('connection', socket => {
  
  // 지금 userID는 DB에 있는 아이디가 아니라 peer의 고유 id를 받아온 것!!! so 입장,퇴장은 고유 id로 나옴.
  socket.on('joinRoom', (roomId, userId, userName) => {

    // 소켓에 id, 이름 저장해두기
    // socket.id = userId
    // socket.name = userName
    console.log("룸번호는" + roomId + "입니다.")

    socket.join(roomId)
    socket.to(roomId).broadcast.emit('userConnected', userId)

    // socket.on 함수 밖으로 빼는 거 시도하기...
    socket.on('message', (message) => {
      io.to(roomId).emit('creatMessage', message, userName)
    })

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('userDisconnected', userId)
    })
  })
})

server.listen(serverPort, function () {
  console.log(`Example app listening on port ${serverPort}!`);
});