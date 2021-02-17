#from konlpy.tag import Okt

import sys
import base64

from collections import Counter
from nltk.corpus import stopwords
from eunjeon import Mecab

def get_noun(news, stopwords):
# def get_noun(news):
    #okt 객체 생성
    mecab = Mecab()
    noun = mecab.nouns(news)

    # 명사 빈도 카운트
    count = Counter(noun)

    # 두글자 이상의 명사만 (한글자인 '것', '수', '등' 등 제외)
    remove_char_counter = Counter({x: count[x] for x in count if len(x) > 1})
    # 불용어 제외
    remove_char_counter = Counter({x: remove_char_counter[x] for x in count if x not in stopwords})
    noun_list = remove_char_counter.most_common(3)
    return noun_list


#filename = "news.txt"
#f = open(filename, 'r', encoding='utf-8')
#news = f.read()

with open("stopwords.word.txt", 'r', encoding='utf-8') as f:
    stopwords = f.readlines()
stopwords = [x.strip() for x in stopwords]


mecab = Mecab()
noun_list = get_noun(sys.argv[1], stopwords)

# for v in noun_list:
#     result = str(v)

result = ''
for v in noun_list:
    result += (v[0] + ' ')
print(base64.b64encode(result.encode('utf-8')))

    
