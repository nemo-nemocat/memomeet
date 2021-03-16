import os
import sys
import base64
import io
import json

from wordcloud import WordCloud
from collections import Counter

from flask import Flask
from flask import request
import pymysql

from krwordrank.sentence import summarize_with_sentences
from krwordrank.word import summarize_with_keywords
from krwordrank.word import KRWordRank
from kss import split_sentences

# 개발 시에는 eunjeon import, 배포 시에는 mecab import
env = os.environ.get("FLASK_ENV")

if(env =="production"):
    import mecab
else:
    from eunjeon import Mecab
    mecab = Mecab()

app = Flask(__name__)

# db 환경 분리
if(env =="production"):
    db = pymysql.connect(host="us-cdbr-east-03.cleardb.com", user="b5dfcc92d33e0e", passwd="0c8450fd", db="heroku_9c78ff95d911e67", charset="utf8")
else:
    db = pymysql.connect(host="localhost", user="root", passwd="root", db="memomeet", charset="utf8")

cur = db.cursor()

@app.route('/keyword-tag', methods=['POST'])
def index():
    meet_id = request.json['meet_id']
    sql = 'SELECT content FROM MEETSCRIPT WHERE MEET_ID=%s'
    cur.execute(sql, meet_id)
    contents = cur.fetchall()
    
    def get_noun(contents, stopwords):

        nouns = mecab.nouns(contents)

        # for i, v in enumerate(nouns):
        #     if len(v) < 2:
        #         nouns.pop(i)

        # 명사 빈도 카운트
        count = Counter(nouns)

        # 두글자 이상의 명사만 (한글자인 '것', '수', '등' 등 제외)
        # remove_char_counter = Counter({x: count[x] for x in count if len(x) >= 2})
        # 불용어 제외
        remove_char_counter = Counter({x: count[x] for x in count if x not in stopwords})
        noun_list = remove_char_counter.most_common(100)
        return noun_list

    def visualize(noun_list):
        if len(noun_list) < 3 :
            with open("./noWordcloud.png", "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode()
            return encoded_string
        else:
            wc = WordCloud(font_path='./SeoulNamsanB.ttf', \
                        background_color="white", \
                        width=1000, \
                        height=1000, \
                        max_words=100, \
                        max_font_size=300)

            # wc.generate_from_frequencies(dict(noun_list))
            # wc.to_file('keyword.png')
            pil_img = wc.generate_from_frequencies(dict(noun_list)).to_image()
            img = io.BytesIO()
            pil_img.save(img, "PNG")
            img.seek(0)
            img_b64 = base64.b64encode(img.getvalue()).decode()
            return img_b64


    def summarize(contents, stopwords):
        contents = contents.replace(",", "")
        sentences = split_sentences(contents)
        penalty = lambda x:0 if (25 <= len(x) <= 80) else 1
        words, sents = summarize_with_sentences(
            sentences,
            penalty=penalty,
            stopwords = stopwords,
            diversity=0.7,
            num_keysents=3,
            scaling=lambda x:1,
            verbose=False,
        )
        i = 0
        key_sents = ""
        while(i<3):
            key_sents += (sents[i] + " ")
            i += 1
        return key_sents

    with open("stopwords.txt", 'r', encoding='utf-8') as f:
        stopwords = f.readlines()
    stopwords = [x.strip() for x in stopwords]

    noun_list = get_noun(contents[0][0], stopwords)
    word_cloud = visualize(noun_list)
    #key_sents = summarize(contents[0][0], stopwords)
    # 'a b c'
    i = 0
    for v in noun_list:
        if(v[0] and i<3):
            i = i+1
            sql = 'INSERT INTO TAGLIST(meet_id, tag) VALUE(%s, %s)'
            cur.execute(sql, (meet_id, v[0]))
            db.commit()

    summary = "summary 예시 아직 미완성"
    sql = 'INSERT INTO FINISHEDMEET VALUE(%s,%s,%s)'
    cur.execute(sql, (meet_id, summary, word_cloud))
    db.commit()

    return str(noun_list)


if __name__=="__name__":
    app.run()

