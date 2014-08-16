import csv
from bs4 import BeautifulSoup
from urllib2 import urlopen
import os
from unicodewriter import *


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


# all one csv
with open(base+'/data/austlii/all.csv','w') as f:
	writer = UnicodeWriter(f,quoting=csv.QUOTE_ALL)
	writer.writerow(['year','url','name',])
	for y in range(1901,2015):
		soup = BeautifulSoup(urlopen(site+str(y)))
		for li in soup.find_all('li'):
			# print li.find('a')['href'], li.find('a').string
			writer.writerow([ str(y), li.find('a')['href'].replace('../',''), li.find('a').string ])


