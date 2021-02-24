import sys
import base64
import io
import json

from wordcloud import WordCloud
from collections import Counter
#from PyKomoran import Komoran, DEFAULT_MODEL
import mecab
mecab = mecab.MeCab()

def get_noun(contents, stopwords):

    #komoran = Komoran(DEFAULT_MODEL['FULL'])
    #nouns = komoran.get_nouns(contents)
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

noun_list = get_noun(sys.argv[1], stopwords)
word_cloud = visualize(noun_list)

# for v in noun_list:
#     result = str(v)

# result = ''
# for v in noun_list:
#     result += (v[0] + ' ')
# print(base64.b64encode(result.encode('utf-8')))

result = []

tags = ''
i = 0
for v in noun_list :
    if(i < 3) :
        if(v[0]):
            tags += (v[0] + ' ')
        else :
            tags += (' ')
    else :
        i = i + 1
        break    

data = {}
data['tag'] = tags
data['img'] = word_cloud

print(json.dumps(data))