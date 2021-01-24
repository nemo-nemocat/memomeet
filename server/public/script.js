const socket = io()
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

// 공용으로 PeerServer를 호스팅하는 서비스인 PeerServer cloud를 이용, 최대 50개의 동시연결까지 무료로 가능.
const peer = new Peer(USER_ID, { // peer 고유 id (자동생성) 대신 user id 사용
});

const peers = {}

let room_id, user_id, user_name
// peer 서버와 정상적으로 통신이 된 경우 'open' event가 발생.
// 'open' event가 발생하면 유저를 room에 join시킴.
peer.on('open', peerid => {
  room_id = ROOM_ID
  user_id = USER_ID
  user_name = USER_NAME
  console.log('[PEER CONNECTED] ' + room_id, user_id, user_name)
  $('ul').append(`<font color=#CC3B33>${user_name}님 하이</font></br>`) // 채팅창에 append
  socket.emit('joinRoom', room_id, peerid, user_name)
})

// 소켓 연결 코드
socket.on('connect', function() {
  console.log('[SOCKET CONNECTED] ' + room_id, user_id, user_name)
})

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

// 엔터 누르거나 전송 버튼 클릭 시 send() 함수 호출
$('html').keydown((e) => { 
    if (e.which == 13){
      send()
    }
})

// 메시지 길이가 0이 아니면 message를 emit
function send() {
  var message = document.getElementById('chat_message').value
  if(message.length !== 0) { 
    socket.emit('message', message);
      document.getElementById('chat_message').value = '' 
  }
}

socket.on('creatMessage', (message, userName) => {
    $('ul').append(`<li class="message"><b>${userName}</b> ${message}</li>`) // 채팅창에 append
    scrollToBottom() // 자동스크롤
})

const scrollToBottom = () => {
    $('.main__chat_window').scrollTop($('.main__chat_window').prop("scrollHeight"));
}

/************************************ 버튼 기능 함수 ************************************/

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
    recognition.stop();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
    recognition.start();
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
  const html = `<i class="fas fa-microphone-slash fa-lg"></i><span>Mic off</span>`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone fa-lg"></i><span>Mic on</span>`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `<i class="fas fa-video-slash fa-lg"></i><span>Cam off</span>`
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `<i class="fas fa-video fa-lg"></i><span>Cam on</span>`
  document.querySelector('.main__video_button').innerHTML = html;
}

/************************************ 음성 인식 시작 ************************************/

  try{
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
  }
  catch(e) {
    console.error(e);
    $('.no-browser-support').show();
    alert('Google Chrome에서만 동작합니다.')
  }
  
  var speechContent = '';

  /*-----------------------------
        Voice Recognition 
  ------------------------------*/
  // If false, the recording will stop after a few seconds of silence.
  // When true, the silence period is longer (about 15 seconds),
  // allowing us to keep recording even when the user pauses. 
  recognition.continuous = true;
  recognition.lang = "ko-KR";
  var recognizing = false;

  // This block is called every time the Speech APi captures a line. 
  // 음성 인식 결과 처리
  recognition.onresult = function(event) {
    // event is a SpeechRecognitionEvent object.
    // It holds all the lines we have captured so far. 
    // We only need the current one.
    var current = event.resultIndex;
  
    // Get a transcript of what was said.
    var transcript = event.results[current][0].transcript;

    if(typeof(event.results) == 'undefined'){
      console.log("undefined start")
      recognition.stop()
      recognizing = false
      recognition.start()
      console.log("undefined end")
      return;  
    }

    // Add the current transcript to the contents of our Note.
    // There is a weird bug on mobile, where everything is repeated twice.
    // There is no official solution so far so we have to handle an edge case.
    var mobileRepeatBug = (current == 1 && transcript == event.results[0][0].transcript);

    if(!mobileRepeatBug) {
      speechContent += transcript;
      console.log(speechContent);
    }
    // Reset variables and emit on chat
    socket.emit('message', speechContent); 
    speechContent = '';
  };

  recognition.onstart = function() {
    console.log('Voice recognition activated.')
    recognizing = true;
  }

  recognition.onend = function () {
    console.log("ONEND")
    recognition.stop()
    recognizing = false
    if(myVideoStream.getAudioTracks()[0].enabled){
      recognition.start()
    }
    //console.log('Voice recognition turned itself off.')
  }

  recognition.onerror = function(event) {
    console.log("ERROR")
    recognizing = false
    recognition.stop()
    if (event.error == 'no-speech') {
      console.log("NO SPEECH")
    }
    if (event.error == 'audio-capture') {
        console.log("Capture Problem")
    }
    if (event.error == 'not-allowed') {
        if (event.timeStamp - start_timestamp < 100) {
            console.log("Block")
        } else {
            console.log("Deny")
        }
    }
  }

  // 음성 인식 트리거
  recognition.start();

   /*-----------------------------
          Append Time
  ------------------------------*/