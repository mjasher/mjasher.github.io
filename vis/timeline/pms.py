import csv,codecs,cStringIO

class UTF8Recoder:
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)
    def __iter__(self):
        return self
    def next(self):
        return self.reader.next().encode("utf-8")

class UnicodeReader:
    def __init__(self, f, dialect=csv.excel, encoding="utf-8-sig", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.reader(f, dialect=dialect, **kwds)
    def next(self):
        row = self.reader.next()
        return [unicode(s, "utf-8") for s in row]
    def __iter__(self):
        return self

class UnicodeWriter:
    def __init__(self, f, dialect=csv.excel, encoding="utf-8-sig", **kwds):
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()
    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8").strip() for s in row])
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        data = self.encoder.encode(data)
        self.stream.write(data)
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)



import mechanize
from time import sleep
import os
import urllib2
import csv
from bs4 import BeautifulSoup, UnicodeDammit
import re

# base = '/home/mikey/Dropbox/google_appengine/'
base = os.getcwd()
site = 'http://primeministers.naa.gov.au'

#Make a Browser (think of this as chrome or firefox etc)
br = mechanize.Browser()
html = br.open(site+'/primeministers/').read()
soup = BeautifulSoup(html)

pms = soup.find_all("div", class_="pmBox")
print soup.original_encoding

with open(base+'/data/pms.csv','wb') as fout:
    writer = UnicodeWriter(fout,quoting=csv.QUOTE_ALL)
    writer.writerow([unicode('name'),'imageurl','year'])
    for pm in pms:
        name = ' '.join([unicode(y) for y in pm.find('span', class_='title').contents if unicode(y.string) != 'None'])
        imageurl = unicode(pm.find('img')['src'])
        years =  [unicode(y) for y in pm.find('span', class_='year').contents if unicode(y.string) != u'None']

        for y in years:
            # print name, imageurl, y.encode('utf-8')
            writer.writerow([name,imageurl,y])

        # download images
        # sleep(0.1)
        # # f=open(base+imageurl,"w")
        # f = open(base+'/img/'+re.sub(r"\s+", "", name.encode("utf-8"))+'.jpg', 'w')
        # response = urllib2.urlopen(site+imageurl)
        # f.write(response.read())
        # f.close()


# ALP: Australian Labor Party; CP: Country Party; FT: Free Trade; LP: Liberal Party of Australia; LIB: The Liberal Party; UAP: United Australia Party; NAT: Nationalist; PROT: Protectionist; NL: National Labor.
# http://www.austlii.edu.au/au/cth/
