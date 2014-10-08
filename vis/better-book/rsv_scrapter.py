import csv
from bs4 import BeautifulSoup
from urllib2 import urlopen
import os
# from unicodewriter import *
import json




base = os.getcwd()
site = "https://www.biblegateway.com"

soup = BeautifulSoup(urlopen("https://www.biblegateway.com/versions/Revised-Standard-Version-RSV-Bible/#booklist"))
links = []
books = soup.findAll('td', attrs={'class': 'chapters collapse'})
for book in books:
	links += book.findAll('a')

count = 0




for l in links[1318:]:
	title = l['title']
	soup = BeautifulSoup(urlopen(site+l['href']))
	content = soup.find('div', attrs={'class': 'result-text-style-normal'})
	
	# html = content.prettify("utf-8")
	html = content.decode_contents(formatter="html")
	with open(base+'/data/'+title+'.html', "wb") as html_file:
	    html_file.write(html)

	# if count > 1: 
	# 	break
	count += 1


# with open(base+'/data/RSV.json','w') as fjson:
# 	json.dump(chapters, fjson)




# base = os.getcwd()
# site = 'http://www.rosings.com/users/rsv/'
# soup = BeautifulSoup(urlopen(site))

# links = soup.find('div', attrs={'id': 'books'}).findAll('a')
# for l in links:
# 	soup = BeautifulSoup(urlopen(site+l['href']))
# 	body = soup.find('body')
# 	for d in body.findAll('div'):
# 		d.extract()
# 	print body


# with open(base+'/data/austlii/all.csv','w') as f, open(base+'/data/austlii/all.json','w') as fjson:

# json.dump(obj, fjson)

