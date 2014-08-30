import csv
from bs4 import BeautifulSoup
from urllib2 import urlopen
import os
from unicodewriter import *
import re

from collections import Counter
import re


base = os.getcwd()

words = set()
counts = Counter()

i=0
# all one csv
with open(base+'/data/austlii/all.csv','r') as f:
	reader = csv.reader(f)
	for row in reader:
		i += 1
		name = row[2].split()
		for word in name:
			word = re.sub("\d+", "", word)
			word = re.sub("([()',])", "", word)
			if word not in ['',',','-']:
				words.add(word)
				counts.update([word])

with open(base+'/data/austlii/count.csv','w') as fout:
	writer = csv.writer(fout)
	writer.writerow(['word','count'])
	for word,count in counts.most_common():
		writer.writerow([word,count])


		# words.update(row[2].split())

print i
print len(words)
print counts


