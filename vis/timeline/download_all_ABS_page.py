
from bs4 import BeautifulSoup
from urllib2 import urlopen
import os
import re
from unicodewriter import *
import csv
import json
import time
import xlrd
from datetime import date,datetime,time
from xlrd import open_workbook,xldate_as_tuple
from selenium import webdriver # selenium is SOOOOOOO much better than phantomJS

# this scrapes the ABS and puts it into a useable DB
# loose amount of data: 
#		http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/1364.0.15.003Jun%20Qtr%202014?OpenDocument

# =========================
# Download all the files listed on a page
# =========================

base_dir = os.getcwd()

# base_url = 'http://www.abs.gov.au'
# site = 'http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/1364.0.15.003Jun%20Qtr%202014?OpenDocument'

# profile = webdriver.firefox.firefox_profile.FirefoxProfile()
# profile.set_preference("browser.download.folderList",2)
# profile.set_preference("browser.download.dir",base_dir)
# profile.set_preference('browser.helperApps.neverAsk.saveToDisk', 'application/vnd.ms-excel')
# driver = webdriver.Firefox(profile)

# soup = BeautifulSoup(urlopen(site))
# limit = 0
# file_names = []
# for tr in soup.find_all('tr', attrs={'class': 'listentry'}):
# 	file_names.append(tr.find('td').string)
# 	driver.get(base_url+tr.find_all('a')[0]['href'])
# 	limit += 1

# print limit, "files downloaded"
# print file_names

file_names = [u'Table 01:NIF Private Consumption - Seasonally Adjusted', u'Table 02:NIF Demand and Expenditure - Seasonally Adjusted ($million)', u'TABLE 03:NIF Private Gross Fixed Capital Formation - Seasonally Adjusted ($ million)', u'Table 04:NIF Depreciation and Deductions - Original ($ million)', u'Table 05:NIF Interest Payments - Seasonally Adjusted ($ million)', u'Table 06:NIF Product Aggregates - Seasonally Adjusted ($ million)', u'TABLE 07:NIF Stocks of Physical and Financial Assets - Seasonally Adjusted ( $ million)', u'Table 08:NIF Increases in Stocks - Seasonally Adjusted ($ million)', u'Table 09:NIF Imports and Exports of Goods and Services - Seasonally Adjusted ($ million)', u"TABLE 10:NIF Labour Market - Seasonally Adjusted ('000)", u'TABLE 11:NIF Implicit Price Deflators - Seasonally Adjusted', u'TABLE 12:NIF Tax Rates - Original (%)', u'TABLE 13:NIF Taxes & Transfers - Seasonally Adjusted ($ million)', u'TABLE 14:NIF Incomes - Seasonally Adjusted ($ million)', u'TABLE 15:NIF Budget Sector - Seasonally Adjusted ($ million)', u'TABLE 16:NIF Changes in Public Authorities Stocks - Seasonally Adjusted ($ million)', u'TABLE 17:NIF Miscellaneous - Seasonally Adjusted']

# this'll close even if they aren't all downloaded
# driver.close()


# =========================
# go through all the files and make a json api - smaller, auto gzipped by gh-pages, sexy
# =========================

downloaded_files = []
import os
for f in os.listdir(base_dir):
	if f.endswith(".xls"):
		downloaded_files.append(f)

assert(len(downloaded_files) ==  len(file_names))


allrows = []
source_tables = ['']
neat_data = []
first = True
for name_i,name in enumerate(file_names):
	name = name.encode("utf-8")
	m = re.match('.*Table ([0-9]{2}).*', name, re.IGNORECASE)
	table_num = int(m.group(1))
	
	# look for corresponding file
	for f in downloaded_files:
		m = re.match('.*([0-9]{2}).xls', f)
		if table_num == int(m.group(1)):
			break


	wb = xlrd.open_workbook(f)
	sheet = wb.sheet_by_name('Data1')

	# convert to csv
	print f, 'and', name
	new_f = f.split('.')[0] + '.csv.json'
	with open(base_dir + '/' + new_f, 'w') as csvfile:
		writer = csv.writer(csvfile)

		for i in range(sheet.nrows):
			row = [ c.value for c in sheet.row(i)]
			if i > 9:
				row[0] = date( *xldate_as_tuple(row[0],wb.datemode)[:3] )
			writer.writerow(row)
			
			if name_i == 0:
				allrows.append(row)
			else:
				allrows[i] = allrows[i] + row[1:] # exclude date


	for i in range(1,sheet.ncols):
		source_tables.append(name)

	neat_data.append({'name': name, 'file': new_f,'timeseries':[]})

	# print sheet.row(9)
	# print sheet.row(10)
with open(base_dir+'/modeller_db_tables.json','w') as f:
	json.dump(neat_data, f)

with open(base_dir+'/modeller_db_all.csv.json', 'w') as allfile:
	allwriter = csv.writer(allfile)
	allwriter.writerow(source_tables)
	for row in allrows:
		allwriter.writerow(row)