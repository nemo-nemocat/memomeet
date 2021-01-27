const socket = io()
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
const myVideoBx = document.createElement('div')
const myNameTag = document.createElement('div')
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
  socket.emit('joinRoom', room_id, peerid, user_name)
})

// 소켓 연결 코드
socket.on('connect', function() {
  room_id = ROOM_ID
  user_id = USER_ID
  user_name = USER_NAME
  console.log('[SOCKET CONNECTED] ' + room_id, user_id, user_name)
})

let myVideoStream
// 유저의 브라우저로부터 Media Device들을 받아오는 과정
navigator.mediaDevices.getUserMedia({ 
    video: true,
    audio: true
}).then(stream => { // Media Device를 받아오는 데 성공하면 stream을 넘겨받을 수 있음
    myVideoStream = stream
    user_name = USER_NAME
    addVideoStream(myVideoBx, myNameTag, myVideo, user_name, stream) // 받아온 stream을 내 브라우저에 추가하는 함수

    peer.on('call', call => { // 이후 누군가 나에게 요청을 보내면 받기 위해 event를 on해줌
      // 나에게 응답을 준 다른 유저의 요청에 수락. 
      // 이 과정에서 내 stream을 다른 유저에게 보내주고, answer가 발생하면 'stream'이라는 event를 통해 다른 유저의 stream을 받아옴
      call.answer(stream)
        const video = document.createElement('video')
        const videoBx = document.createElement('div')
        const nameTag = document.createElement('div')
        call.on('stream', userVideoStream => { // 다른 유저의 stream을 내 브라우저에 추가하는 콜백 함수가 실행됨
          addVideoStream(videoBx, nameTag, video, "받아온 이름", userVideoStream) 
        })
    })

    // 'userConnected' event가 발생하면 서버로부터 새로 접속한 유저의 userId를 받아온 후 call 요청을 보냄
    socket.on('userConnected', (userId, userName) => {
      setTimeout(() => {connectToNewUser(userId, userName, stream)}, 1000)
    })
})

// 유저가 나가면 socket.io에서는 자동으로 'disconnect' event를 발생시킴. 다른 유저의 stream을 close시킴. 
socket.on('userDisconnected', userId => {
    if (peers[userId]) peers[userId].close()
  })

// 새로운 유저가 접속하면 그 유저의 stream을 내 브라우저에 추가하기 위해 요청을 보냄 (peer.call)
function connectToNewUser(userId, userName, stream) {
    const call = peer.call(userId, stream) 
    const videoBx = document.createElement('div')
    const nameTag = document.createElement('div')
    const video = document.createElement('video') // 다른 유저를 위해 video element를 생성
    // 상대 유저가 answer했을 때 'stream' event가 발생되는데,
    // 이를 통해 상대 유저의 stream을 받아오고 내 화면에 추가시킴
    call.on('stream', userVideoStream => { 
        addVideoStream(videoBx, nameTag, video, userName, userVideoStream)
    })
    // 상대가 나가서 상대의 stream에 대해 'close' event가 발생하면 상대의 video를 제거하는 콜백 함수가 실행됨
    call.on('close', () => {
      //video.remove()
      removeVideoStream(video, stream)
    })

    peers[userId] = call
}

function addVideoStream(videoBx, nameTag, video, userName, stream){
    videoBx.style.marginRight = '10px';

    let nameText = document.createTextNode(userName);
    nameTag.className = 'nameTag';
    if(!nameTag.hasChildNodes())nameTag.appendChild(nameText);

    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })

    videoBx.append(nameTag);
    videoBx.append(video);

    videoGrid.append(videoBx);

    if(videoGrid.childElementCount>4) videoGrid.style.gridTemplateColumns = "1fr 1fr 1fr";
}

function removeVideoStream(video, stream){
    video.srcObject = stream;
    const videoParent = video.parentNode;
    videoGrid.removeChild(videoParent);
    if(videoGrid.childElementCount<4) videoGrid.style.gridTemplateColumns = "1fr 1fr";
}

/************************************ 채팅 송수신 ************************************/

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
    document.getElementById('chat_message').value = '' 

    // 데이터 담아서 서버로 message 이벤트 emit
    socket.emit('message', {type: 'mymessage', message: message, time: getTime()})
    socket.emit('message', {type: 'message', message: message, time: getTime()})
  }
}

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function getTime(){
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  // add a zero in front of numbers<10
  m = checkTime(m);
  var time = h + ":" + m;
  return time;
}

socket.on('updateChat', (data) => {
  var chat = document.getElementById('chat')
  var msg = document.createElement('div')
  var bold = document.createElement('strong')
  var className = ''
  
  if(data.type == "system"){
    var node = document.createTextNode(`${data.name} ${data.message}`)
    bold.appendChild(node)
    msg.appendChild(bold)
  }
  else{
    var part1 = document.createTextNode(`${data.name}`)
    var part2 = document.createTextNode(` ${data.time}`)
    var part3 = document.createTextNode(`${data.message}`)
    var br = document.createElement('br')
  
    bold.appendChild(part1)
    msg.appendChild(bold)
    msg.appendChild(part2)
    msg.appendChild(br)
    msg.appendChild(part3)
  }

    // 타입에 따라 적용할 클래스를 다르게 지정
    switch(data.type) {
      case 'mymessage':
        className = 'me'
        break
      case 'message':
        className = 'other'
        break 
  
      case 'system':
        className = 'system'
        break
    }

    msg.classList.add(className)
    chat.appendChild(msg)
    scrollToBottom()
})

const scrollToBottom = () => {
  $('#chat').scrollTop($('#chat').prop("scrollHeight"));
}

/************************************ 사용자 목록 ************************************/

socket.on('updateMembers', (data) => {
  var members = document.getElementById('memberList');

  while(members.hasChildNodes()){
    members.removeChild(members.firstChild)
  }
  
  for(var i=0; i<data.num; i++) {
    var node = document.createTextNode(`${data.members[i]}`)
    var member = document.createElement('a')
    member.appendChild(node)
    members.appendChild(member)
  }
})

function memberList() {
   document.getElementById("memberList").classList.toggle("show")
}
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown__content")
      var i
      for (i = 0; i < dropdowns.length; i++) {
         var openDropdown = dropdowns[i]
         if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show')
            }
         }
      }
    }

/************************************ 버튼 기능 함수들 ************************************/

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

const exit = () => {
  if (confirm("회의에서 나가시겠습니까?")){
    self.close()
  }
}
  
const setMuteButton = () => { 
  const html = `<i class="fas fa-microphone fa-lg"></i><span>Mic off</span>`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `<i class="fas fa-microphone-slash fa-lg"></i><span>Mic on</span>`
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => { 
  const html = `<i class="fas fa-video fa-lg"></i><span>Cam off</span>`
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `<i class="fas fa-video-slash fa-lg"></i><span>Cam on</span>`
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

    // 데이터 담아서 서버로 message 이벤트 emit
    socket.emit('message', {type: 'mymessage', message: speechContent, time: getTime('mymessage')})
    socket.emit('message', {type: 'message', message: speechContent, time: getTime('message')})

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