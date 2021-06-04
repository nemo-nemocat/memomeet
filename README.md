# Memo-meet
<img src=https://user-images.githubusercontent.com/53745427/120762640-673ce900-c551-11eb-9454-960888c1face.jpg width="800">

회의록 자동작성과 분석을 제공해주는 그룹형 화상회의 플랫폼을 제공합니다.

## 1. Project
### 1-1. 시스템 아키텍쳐
<p align="center"><img src=https://user-images.githubusercontent.com/53828411/120753695-897d3980-c546-11eb-8877-fb0cbb6c10ae.JPG width="600"></p>

### 1-2. DB 구조
<p align="center"><img src=https://user-images.githubusercontent.com/53828411/120754296-6dc66300-c547-11eb-812b-2a7b52cf79b9.JPG width="600"></p>

### 1-3. UI
<p align="center"><img src=https://user-images.githubusercontent.com/53745427/120763074-d4e91500-c551-11eb-8f94-1037440ff412.jpg width="800"></p>

## 2. 실행
### 2-1. 실행 환경
- [install](https://nodejs.org/ko/download/) nodeJS 16.3.0 ver
- [install](https://www.python.org/downloads/) python 3.7.0 ver
- [install](https://github.com/microsoftarchive/redis) redis window ver
- [install](https://www.mysql.com/downloads/) mySQL 8.0 ver

### 2-2. 실행 방법
- clone git
<pre>
<code>
git clone https://github.com/nemo-nemocat/memomeet.git
</code>
</pre>
- npm install
<pre>
<code>
npm init
npm install
</code>
</pre>
- pip install
<pre>
<code>
cd memomeet/server/analysis.py
pip freeze > requirements.txt
pip install -r requirements.txt
</code>
</pre>
- run redis 
<pre>
<code>
cd C:\Program Files\Redis
redis-server
</code>
</pre>
- run program
<pre>
<code>
npm run dev
</code>
</pre>


## 3. 시연 영상
**Click URL** [MEMO-MEET 포스터 설명 및 시연 영상](https://www.youtube.com/watch?v=5eFKKNgEY80&t=9s)   
<img src=https://user-images.githubusercontent.com/53745427/120763571-504ac680-c552-11eb-90df-4540417186d1.jpg width="100">   

## 4. 접속 URL
Support chrome, microsoft edge, safari browser.   
**Click URL** [MEMO-MEET](https://memomeet.herokuapp.com/)

# 5. Contributors
|  <center>Name</center> |  <center>Position</center> |  <center>Github</center> |
|:--------:|:--------:|:--------:|
| 김하연 | <center>STT & NLP</center> |[haayun](https://github.com/haayun)|
| 박혜린 | <center>Web Frontend</center> |[hyeppy226](https://github.com/hyeppy226)|
| 유효민 | <center>Web Backend</center> |[Hyomin6349](https://github.com/Hyomin6349)|
| 이다해 | <center>Video Conferencing</center> |[dahaelee](https://github.com/dahaelee)|
