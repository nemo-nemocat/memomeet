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

env = os.environ.get("PYTHON_ENV")

if(env =="production"):
    import mecab
    mecab = mecab.MeCab()
else :
    from eunjeon import Mecab
    mecab = Mecab()

app = Flask(__name__)

db = pymysql.connect(host="localhost", user="root", passwd="root", db="memomeet", charset="utf8")
cur = db.cursor()

@app.route('/keyword-tag', methods=['POST'])
def index():
    meet_id = request.json['meet_id']
    sql = 'SELECT content FROM MEETSCRIPT WHERE MEET_ID=%s'
    cur.execute(sql, meet_id)
    contents = cur.fetchall()
    
    def get_noun(contents, stopwords):

        mecab = Mecab()
        nouns = mecab.nouns(contents)

        # 명사 빈도 카운트
        count = Counter(nouns)

        # 두글자 이상의 명사만 (한글자인 '것', '수', '등' 등 제외)
        remove_char_counter = Counter({x: count[x] for x in count if len(x) > 1})
        # 불용어 제외
        remove_char_counter = Counter({x: remove_char_counter[x] for x in count if x not in stopwords})
        noun_list = remove_char_counter.most_common(100)
        return noun_list

    def visualize(noun_list):
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

    with open("stopwords.txt", 'r', encoding='utf-8') as f:
        stopwords = f.readlines()
    stopwords = [x.strip() for x in stopwords]

    noun_list = get_noun(contents[0][0], stopwords)
    word_cloud = visualize(noun_list)

    i = 0
    for v in noun_list:
        if(v[0] and i<3):
            i = i+1
            sql = 'INSERT INTO TAGLIST(meet_id, tag) VALUE(%s, %s)'
            cur.execute(sql, (meet_id, v[0]))
            db.commit()

    summary = "summary 예시 in flask"
    sql = 'INSERT INTO FINISHEDMEET VALUE(%s,%s,%s)'
    cur.execute(sql, (meet_id, summary, word_cloud))
    db.commit()

    return "success input taglist"


if __name__=="__name__":
    app.run(port=5000, debug = True)


