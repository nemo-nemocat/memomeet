import os
import sys
import base64
import io
import json

import shortuuid
from wordcloud import WordCloud
from collections import Counter

from flask import Flask
from flask import request
import pymysql

from krwordrank.sentence import summarize_with_sentences
from krwordrank.word import summarize_with_keywords
from krwordrank.word import KRWordRank
from kss import split_sentences

env = os.environ.get("FLASK_ENV")
port = int(os.environ.get('PORT', 5000))

# 개발 시에는 eunjeon import, 배포 시에는 mecab import
if env == "production":
    import mecab
else:
    from eunjeon import Mecab
    mecab = Mecab()

app = Flask(__name__)

# db 환경 분리
if env == "production":
    db = pymysql.connect(host="us-cdbr-east-03.cleardb.com", user="b5dfcc92d33e0e", passwd="0c8450fd", db="heroku_9c78ff95d911e67", charset="utf8")
else:
    db = pymysql.connect(host="localhost", user="root", passwd="root", db="memomeet", charset="utf8")

cur = db.cursor()

@app.route('/keyword-tag', methods=['POST'])
def index():
    # meet_id = "HU5uWbVoo"
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
        tgtdir = '../client/public/uploads/'
        filename = shortuuid.uuid()
        if len(noun_list) < 3 :
            with open("./noWordcloud.png", "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode()
            return '%s%s.png' %(tgtdir, noWordcloud)
        else:
            wc = WordCloud(font_path='./SeoulNamsanB.ttf', \
                        background_color="white", \
                        width=1000, \
                        height=1000, \
                        max_words=100, \
                        max_font_size=300)



            wc.generate_from_frequencies(dict(noun_list))
            wc.to_file('%s%s.png' %(tgtdir, filename))
            # pil_img = wc.generate_from_frequencies(dict(noun_list)).to_image()
            # img = io.BytesIO()
            # pil_img.save(img, "PNG")
            # img.seek(0)
            # img_b64 = base64.b64encode(img.getvalue()).decode()
            # return img_b64
            return '%s%s.png' %(tgtdir, filename)


    def summarize(contents, stopwords):
        contents = contents.replace(",", "")
        sentences = split_sentences(contents)
        try:
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
        
        except:
            return "요약할 대화가 충분하지 않습니다."

    with open("stopwords.txt", 'r', encoding='utf-8') as f:
        stopwords = f.readlines()
    stopwords = [x.strip() for x in stopwords]

    noun_list = get_noun(contents[0][0], stopwords)
    word_cloud = visualize(noun_list)
    # 'a b c'
    i = 0
    for v in noun_list:
        if(v[0] and i<3):
            i = i+1
            sql = 'INSERT INTO TAGLIST(meet_id, tag) VALUE(%s, %s)'
            cur.execute(sql, (meet_id, v[0]))
            db.commit()

    summary = summarize(contents[0][0], stopwords)
    sql = 'INSERT INTO FINISHEDMEET VALUE(%s,%s,%s)'
    cur.execute(sql, (meet_id, summary, word_cloud))
    db.commit()
    
    return str(noun_list)

# 개발 시에만 debug mode ON, 배포 시에는 외부 서버에서도 접근 가능하게
if __name__ == "__main__":
    if env == "production":
        app.run(host='0.0.0.0', port=port)
    else: 
        app.run(debug=True, port=port)

print(f'********** FLASK SERVER is running on port {port} **********')
