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
from flask import make_response

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


@app.route('/keyword-tag', methods=['POST'])
def index():
    contents = request.json['contents']
    
    def get_noun(contents, stopwords):

        nouns = mecab.nouns(contents)

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
            return 'noWordcloud'
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
            return '%s%s.png' %("/uploads/", filename)

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

    noun_list = get_noun(contents, stopwords)
    word_cloud = visualize(noun_list)

    tags = []

    if len(noun_list) > 3:
        for i in range(3):
            tags.append(noun_list[i][0])
    else:
        for t in noun_list:
            tags.append(t[0])
        for _ in range(3 - len(noun_list)):
            tags.append("")

    summary =  summarize(contents, stopwords)

    result = {'tag1': tags[0], 'tag2': tags[1], 'tag3': tags[2], 'summary': summary, 'wordcloud': word_cloud}
    res = json.dumps(result, ensure_ascii=False)
    r = make_response(res)
    return r

# 개발 시에만 debug mode ON, 배포 시에는 외부 서버에서도 접근 가능하게
if __name__ == "__main__":
    if env == "production":
        app.run(host='0.0.0.0', port=port)
    else: 
        app.run(debug=True, port=port)

print(f'********** FLASK SERVER is running on port {port} **********')
