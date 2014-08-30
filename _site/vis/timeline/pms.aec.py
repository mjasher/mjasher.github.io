import csv
from bs4 import BeautifulSoup
from urllib2 import urlopen
import os
base = os.getcwd()
soup = BeautifulSoup(urlopen('http://www.aec.gov.au/elections/australian_electoral_history/pm.htm'))
tables = soup.find_all('table') #, attrs={ "class" : "table-horizontal-line"}

pms = []
with open(base+'/data/pms.csv','r') as pmFile:
	reader = csv.reader(pmFile)
	for row in reader:
		pms.append(row[0])


i = 0
for table in tables:
	headers = [header.text for header in table.find_all('th')]
	rows = []
	for row in table.find_all('tr'):
		# rows.append([val.text.encode('utf8') for val in row.find_all('td')])
		vals = [val.text.encode('utf8').strip() for val in row.find_all('td')]
		
		if len(vals) == 2: 
			vals.insert(0, rows[-1][1])
		if len(vals) > 1: 
			vals[1] = vals[1].replace('1','')
			# find corresponding image
			for pm in pms:
				names = pm.split()
				if (names[0] in vals[0] and names[1] in vals[0]):
					vals.insert(0, ''.join(names)+'.jpg')
					break


		rows.append(vals)
	if (i==0): name = 'pms.aec'
	else: name = 'opps.aec' 
	with open(base+'/data/'+name+'.csv', 'wb') as f:
		writer = csv.writer(f)
		writer.writerow(['img']+headers)
		writer.writerows(row for row in rows if row)
	i += 1