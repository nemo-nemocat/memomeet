const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
});

const peers = {}

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream) // 다른 유저의 call에 answer
        const video = document.createElement('video')
        call.on('stream', userVideoStream => { // 다른 유저의 video를 내 화면에 추가
          addVideoStream(video, userVideoStream) 
        })
    })

    // 새로운 user에게 연결되면
    socket.on('userConnected', (userId) => {
        $('ul').append(`<font color=#CC3B33>${userId} 입장</font></br>`) // 채팅창에 append
        setTimeout(() => {connectToNewUser(userId, stream)}, 1000)
    })
})

socket.on('userDisconnected', userId => {
    $('ul').append(`<font color=#CC3B33>${userId} 퇴장</font></br>`) // 채팅창에 append
    if (peers[userId]) peers[userId].close()
  })

let myId
peer.on('open', id => { // id는 peer의 고유한 id
    myId = id
    socket.emit('joinRoom', ROOM_ID, id) 
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream) // 다른 유저의 userId로 다른 유저를 call
    const video = document.createElement('video') // 다른 유저를 위해 video element를 생성
    call.on('stream', userVideoStream => { 
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        removeVideoStream(video, userVideoStream)
    })

    peers[userId] = call
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

function removeVideoStream(video, stream){
    video.srcObject = stream
    videoGrid.remove(video)
}

let text = $('input')

$('html').keydown((e) => { // 엔터 입력 시 input 확인하고 text 전송 후 비우기
    if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val(), myId);
        text.val('')
    }
})

socket.on('creatMessage', (message, userId) => {
    $('ul').append(`<li class="message"><b>${userId}</b> ${message}</li>`) // 채팅창에 append
    scrollToBottom() // 자동스크롤
})

const scrollToBottom = () => {
    $('.main__chat_window').scrollTop($('.main__chat_window').prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  
  const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
  const setMuteButton = () => {
    const html = `<span>마이크 끄기</span>`
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `<span>마이크 켜기</span>`
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setStopVideo = () => {
    const html = `<span>카메라 끄기</span>`
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `<span>카메라 켜기</span>`
    document.querySelector('.main__video_button').innerHTML = html;
  }