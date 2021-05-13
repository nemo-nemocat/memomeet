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


def get_noun(contents, stopwords, sentences, members):
    try:
        wordrank_extractor = KRWordRank(
            min_count=5, max_length=10, verbose=True)
        keywords, rank, graph = wordrank_extractor.extract(
            sentences, beta=0.85, max_iter=10)

        passwords = {word: score for word, score in sorted(
            keywords.items(), key=lambda x: -x[1])[:100] if not (word in stopwords)}

    except:
        passwords = {"": 0}

    tags = {}
    i = 3
    for t in list(passwords.keys()):
        if i>0: 
            tags[t] = 100*i
        i = i-1
    result = {'type':'tags','data': list(tags.keys())}
    r.publish('server', json.dumps(result, ensure_ascii=False))

    #기여도
    if (len(tags) != 0):
        for m in members:
            if m in chat:
                for c in chat[m]:
                    for t in list(tags.keys()):
                        if t in c:
                            contribute[m] += tags[t]

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
chat = {}
contribute = {}

while True:       
    message = sub.get_message()

    if message:
        data = message['data']
        if not data == 1:
            data = data.decode('utf-8')
            data = json.loads(data)
            if (data['type'] == "analysis"):
                contents = data['contents'].replace(",", " ")
                sentences = split_sentences(contents)
                members = data['members']

                th1 = Thread(target=get_noun, args=(contents,stopwords,sentences, members ))
                th2 = Thread(target=visualize, args=(contents, ))
                th3 = Thread(target=summarize, args=(contents,stopwords,sentences))
                
                th1.start()
                th2.start()
                th3.start()

                th1.join()
                th2.join()
                th3.join()

                sum = 0
                con = {}
                for m in members:
                    if m in chat:
                        sum += contribute[m]

                for m in members:
                    con[m] = int(contribute[m]/sum*100)
                    del(contribute[m])
                    del(chat[m])

                r.publish('server', json.dumps({'type': 'contribute','room': data['room'], 'contribute': con}, ensure_ascii=False))

            if (data['type'] == "chat"):
                if data['key'] in chat:
                    chat[data['key']].append(data['value'])
                    contribute[data['key']] += len(data['value'])
                else: 
                    chat[data['key']] = [data['value']]
                    contribute[data['key']] = 0