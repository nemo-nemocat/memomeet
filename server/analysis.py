# -*- coding: utf-8 -*- 
import sys
import io
import redis
import base64
import io
import json
import os

import shortuuid
from wordcloud import WordCloud
from collections import Counter

from krwordrank.sentence import summarize_with_sentences
from krwordrank.word import summarize_with_keywords
from krwordrank.word import KRWordRank
from kss import split_sentences
from threading import Thread

sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding = 'utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding = 'utf-8')

# 개발 시에는 eunjeon import, 배포 시에는 mecab import
env = os.environ.get("PYTHON_ENV")
tgtdir = ''
if env == "production":
    import mecab
    mecab = mecab.MeCab()
    tgtdir = '../client/build/uploads/'

else:
    from eunjeon import Mecab
    mecab = Mecab()
    tgtdir = '../client/public/uploads/'

with open("stopwords.txt", 'r', encoding='utf-8') as f:
    stopwords = f.readlines()
stopwords = [x.strip() for x in stopwords]


def get_noun(contents, stopwords, sentences, chat, roomId):
    try:
        wordrank_extractor = KRWordRank(
            min_count=5, max_length=10, verbose=True)
        keywords, rank, graph = wordrank_extractor.extract(
            sentences, beta=0.85, max_iter=10)

        passwords = {word: score for word, score in sorted(
            keywords.items(), key=lambda x: -x[1])[:100] if not (word in stopwords)}

    except:
        passwords = {"": 0}

    length = 0 # 방마다 전체 글자수
    for x in list(chat.values()):
        length += len(x)

    tags = {}
    for i, t in enumerate(list(passwords.keys()), start=1):
        if i <= 3:
            tags[t] = length * 0.01 * i

    result = {'type':'tags','data': list(tags.keys())}
    r.publish('server', json.dumps(result, ensure_ascii=False))

    members = list(chat.keys()) # 채팅에 참여한 멤버들 리스트
    contribute = {} # 멤버별 기여도 점수 딕셔너리

    # 기여도를 글자수로 초기화
    for m in members:
        contribute[m] = len(chat[m])

    # 기여도에 태그 가중치 추가
    if len(tags) != 0:
        for m in members:
            for t in tags:
                contribute[m] += chat[m].count(t) * tags[t]

    contribute_percent = {} # 멤버별 기여도 점수를 퍼센테이지로 변경한 딕셔너리
    contribute_sum = sum(contribute.values())
    for m in members:
        contribute_percent[m] = round(contribute[m] / contribute_sum * 100, 2)

    r.publish('server', json.dumps({'type': 'contribute','room': roomId, 'contribute':contribute_percent}, ensure_ascii=False))

def visualize(contents):
    nouns = mecab.nouns(contents)
    # 명사 빈도 카운트
    count = Counter(nouns)

    # 두글자 이상의 명사만 (한글자인 '것', '수', '등' 등 제외)
    remove_char_counter = Counter(
        {x: count[x] for x in count if len(x) >= 2})
    # 불용어 제외
    remove_char_counter = Counter(
        {x: count[x] for x in count if x not in stopwords})
    noun_list = remove_char_counter.most_common(100)

    filename = shortuuid.uuid()
    if len(noun_list) < 3:
        result = {'type': 'wordcloud', 'data': 'noWordcloud'}
        r.publish('server', json.dumps(result, ensure_ascii=False))
    else:
        wc = WordCloud(font_path='./SeoulNamsanB.ttf',
                        background_color="white",
                        width=1000,
                        height=1000,
                        max_words=100,
                        max_font_size=300)

        wc.generate_from_frequencies(dict(noun_list))
        wc.to_file('%s%s.png' % (tgtdir, filename))
        data = '%s%s.png' % ("/uploads/", filename)
        result = {'type': 'wordcloud', 'data': data}
        r.publish('server', json.dumps(result, ensure_ascii=False))

def summarize(contents, stopwords, sentences):
    try:
        def penalty(x): return 0 if (25 <= len(x) <= 80) else 1
        words, sents = summarize_with_sentences(
            sentences,
            penalty=penalty,
            stopwords=stopwords,
            diversity=0.7,
            num_keysents=3,
            scaling=lambda x: 1,
            verbose=False,
        )

        j = 0
        key_sents = ""
        key_idx= []
        while(j < len(sentences)):
            i = 0
            while(i < 3):
                if(j == i):
                    key_sents += (sents[i] + " ")
                i += 1
            j += 1
        result = {'type': 'summary', 'data': key_sents}
        r.publish('server', json.dumps(result, ensure_ascii=False))

    except: 
        result = {'type': 'summary', 'data': '요약할 대화가 충분하지 않습니다.'}
        r.publish('server', json.dumps(result, ensure_ascii=False))

if env == "production":
    r = redis.from_url(os.environ.get("REDIS_URL"))
else: 
    r = redis.StrictRedis(host='localhost', port=6379, db=0)

sub = r.pubsub()
sub.subscribe('analysis_channel')

while True:       
    message = sub.get_message()

    if message:
        data = message['data']
        if not data == 1:
            data = data.decode('utf-8')
            data = json.loads(data)

            contents = data['contents'].replace(",", " ")
            sentences = split_sentences(contents)
            chat = data['chat'] # 멤버별 전체string 딕셔너리
            members = list(chat.keys())
            roomId = data['room']

            th1 = Thread(target=get_noun, args=(contents,stopwords,sentences,chat,roomId))
            th2 = Thread(target=visualize, args=(contents, ))
            th3 = Thread(target=summarize, args=(contents,stopwords,sentences))
            
            th1.start()
            th2.start()
            th3.start()

            th1.join()
            th2.join()
            th3.join()