
import csv
from pylab import *

with open('/home/mikey/Downloads/data(1)/Tuggeranong_out.csv') as f:
	csv_reader = csv.DictReader(f)

	csv_reader.fieldnames

	for row in csv_reader:
		print row