import csv
from bs4 import BeautifulSoup
from urllib2 import urlopen
import os
from unicodewriter import *
import json

base = os.getcwd()
site = 'http://www.austlii.edu.au/au/legis/cth/num_act/'

# for y in range(1901,2015):
# # for y in range(2014,2015):
# 	soup = BeautifulSoup(urlopen(site+str(y)))
# 	with open(base+'/data/austlii/'+str(y)+'.csv','w') as f:
# 		writer = UnicodeWriter(f,quoting=csv.QUOTE_ALL)
# 		writer.writerow(['url','name'])
# 		for li in soup.find_all('li'):
# 			# print li.find('a')['href'], li.find('a').string
# 			writer.writerow([ li.find('a')['href'].replace('../',''), li.find('a').string ])


# all one csv and json (json is auto gzipped by github pages)
with open(base+'/data/austlii/all.csv','w') as f, open(base+'/data/austlii/all.json','w') as fjson:
	headings = ['year','url','name']
	writer = UnicodeWriter(f,quoting=csv.QUOTE_ALL)
	writer.writerow(headings)

	headingObj = {}
	for h in range(len(headings)):
		headingObj[headings[h]] = h

	obj = { 'headings': headingObj,
			'values': [] }

	for y in range(1901,2015):
	# for y in range(2014,2015):
		soup = BeautifulSoup(urlopen(site+str(y)))
		for li in soup.find_all('li'):
			# print li.find('a')['href'], li.find('a').string
			row = [ str(y), li.find('a')['href'].replace('../',''), li.find('a').string ]
			writer.writerow(row)
			obj['values'].append(row)

	json.dump(obj, fjson)



    # def writerow(self, row):
    #     self.writer.writerow([s.encode("utf-8").strip() for s in row])
    #     data = self.queue.getvalue()
    #     data = data.decode("utf-8")
    #     data = self.encoder.encode(data)
    #     self.stream.write(data)
    #     self.queue.truncate(0)

# "headings": ["year", "url", "name"], "values":[