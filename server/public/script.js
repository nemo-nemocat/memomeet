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
// 유저의 브라우저로부터 Media Device들을 받아오는 과정
navigator.mediaDevices.getUserMedia({ 
    video: true,
    audio: true
}).then(stream => { // Media Device를 받아오는 데 성공하면 stream을 넘겨받을 수 있음
    myVideoStream = stream
    addVideoStream(myVideo, stream) // 받아온 stream을 내 브라우저에 추가하는 함수

    peer.on('call', call => { // 이후 누군가 나에게 요청을 보내면 받기 위해 event를 on해줌
      // 나에게 응답을 준 다른 유저의 요청에 수락. 
      // 이 과정에서 내 stream을 다른 유저에게 보내주고, answer가 발생하면 'stream'이라는 event를 통해 다른 유저의 stream을 받아옴
      call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => { // 다른 유저의 stream을 내 브라우저에 추가하는 콜백 함수가 실행됨
          addVideoStream(video, userVideoStream) 
        })
    })

    // 'userConnected' event가 발생하면 서버로부터 새로 접속한 유저의 userId를 받아온 후 call 요청을 보냄
    socket.on('userConnected', (userId) => {
        $('ul').append(`<font color=#CC3B33>${userId} 입장</font></br>`) // 채팅창에 append
        setTimeout(() => {connectToNewUser(userId, stream)}, 1000)
    })
})

// 유저가 나가면 socket.io에서는 자동으로 'disconnect' event를 발생시킴. 다른 유저의 stream을 close시킴. 
socket.on('userDisconnected', userId => {
    $('ul').append(`<font color=#CC3B33>${userId} 퇴장</font></br>`) // 채팅창에 append
    if (peers[userId]) peers[userId].close()
  })

let user_id, user_name
// peer 서버와 정상적으로 통신이 된 경우 'open' event가 발생.
// 'open' event가 발생하면 url의 uuid를 통해 유저를 room에 join시킴
peer.on('open', () => { 
    user_id = searchParam('user_id')
    user_name = searchParam('user_name')
    $('ul').append(`<font color=#CC3B33>${user_name} 입장</font></br>`) // 채팅창에 append
    socket.emit('joinRoom', ROOM_ID, user_id, user_name)
})

// 새로운 유저가 접속하면 그 유저의 stream을 내 브라우저에 추가하기 위해 요청을 보냄 (peer.call)
function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream) 
    const video = document.createElement('video') // 다른 유저를 위해 video element를 생성
    // 상대 유저가 answer했을 때 'stream' event가 발생되는데,
    // 이를 통해 상대 유저의 stream을 받아오고 내 화면에 추가시킴
    call.on('stream', userVideoStream => { 
        addVideoStream(video, userVideoStream)
    })
    // 상대가 나가서 상대의 stream에 대해 'close' event가 발생하면 상대의 video를 제거하는 콜백 함수가 실행됨
    call.on('close', () => {
      //video.remove()
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
        socket.emit('message', text.val(), user_name);
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

// URL query용
const URLSearch = new URLSearchParams(location.search)
function searchParam(key){
  return new URLSearchParams(location.search).get(key)
}

// 여기부터 버튼 기능 함수들

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