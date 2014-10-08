import os
import csv
import json
import xlrd
import sqlite3
import re

root = '/home/mikey/ABS/census_datapacks'

def sort():
	# get all table files and meta files
	all_files = []
	meta_files = []
	for path, subdirs, files in os.walk(root):
	    for name in files:
	    	f = os.path.join(path, name)
	    	if f.endswith('_AUST_SA2_long.csv'):
	    		all_files.append(f)
	    	if name.startswith('Metadata_2011'):
	    		meta_files.append(f)

	print 'tables:', len(all_files)
	print 'data_packs:', len(meta_files)


	# for each meta files, get all table names
	tables = {}
	for f in meta_files:
		wb = xlrd.open_workbook(f)
		sheet_names = wb.sheet_names()
		sheet = wb.sheet_by_name(sheet_names[0])
		table_name = sheet.cell(0,0).value
		tables[table_name] = []
		for i in range(sheet.nrows):
			row = [c.value for c in sheet.row(i)]
			tables[table_name].append(row) 

	with open('census_tables.json','w') as f:
		json.dump(tables, f)


	# for each table file, get column names
	all_columns = []
	column_set = set()
	col_by_table = {}
	for f in all_files:
		m=re.match('2011Census_(.+)_AUST_SA2_long.csv', os.path.basename(f)) 
		table_name = m.group(1)
		col_by_table[table_name] = []
		with open(f, 'r') as csvfile:
			csvReader = csv.reader(csvfile)
			cols = csvReader.next()
			# for i,col in enumerate(cols):
			for i,col in enumerate(cols[1:]):
				if True or col.endswith('_Total'):
					# print f, col
					all_columns.append(col)
					col_by_table[table_name].append(col)
					column_set.add(col)

	with open('census_columns.json','w') as f:
		json.dump(col_by_table, f)



	# chuck them in sqlite db for joins


	# con = sqlite3.connect("census.db")
	# cur = con.cursor()

	# for f in all_files:
	# 	with open(f,'rb') as fin: # `with` statement available in 2.5+
	# 		# csv.DictReader uses first line in file for column headings by default
	# 		dr = csv.DictReader(fin) # comma is default delimiter
	# 		m=re.match('2011Census_(.+)_AUST_SA2_long.csv', os.path.basename(f)) 
	# 		table_name = m.group(1)
	# 		dr_fieldnames = list(set(dr.fieldnames)) # ensure unique
	# 		# print table_name, ( ",".join(dr.fieldnames) )
	# 		col_names =  ",".join(['"'+i+'"' for i in dr_fieldnames]) 
	# 		cur.execute("CREATE TABLE " + table_name + " ("+ col_names +");")
	# 		# to_db = []
	# 		for i in dr:
	# 			# print "INSERT INTO " + table_name + " (" + ( ",".join(dr_fieldnames) ) + ") VALUES (" + (','.join( [i[v] for v in dr_fieldnames] )) + ")"
	# 			cur.execute("INSERT INTO " + table_name + " (" + col_names + ") VALUES (" + (','.join( [i[v] for v in dr_fieldnames] )) + ");")
	# 			# to_db.append()
	# 		# cur.executemany("INSERT INTO " + table_name + " VALUES (" + (','.join(['?' for i in dr_fieldnames])) + ");", to_db)
	# con.commit()




	# print all_columns
	print 'columns:', len(all_columns)
	print 'unique columns:',  len(column_set)


def parser(d,i):
	if i == 0:
		return d
	if d == None:
		return ''
	else:
		return round(float(d), 2)

def fetch():

	# for col and table names search file:///home/mikey/Dropbox/asher.org.au/mjasher.github.io/vis/abs/census_columns.json
	with open('select_census.csv','w') as csvfile:
		csvWriter = csv.writer(csvfile)

		con = sqlite3.connect("census.db")
		cur = con.cursor()

		cur.execute("""select P02.region_id, P02.Median_mortgage_repayment_monthly, P02.Average_household_size, P02.Median_total_household_income_weekly,
					 1.0*P35.No_Internet_connection_Total/P35.Total_Total,
					T26.Total_Couple_families_Female_income_is_higher_than_male_income_2011_Census_Percentage,
					 I14A.Percent_Unemployment_Total_Persons,
					 1.0*(B46.One_method_Train_Persons + B46.One_method_Tram_includes_light_rail_Persons + B46.One_method_Bus_Persons + B46.Two_methods_Train_and_Total_Persons + B46.Two_methods_Bus_and_Total_Persons + B46.Three_methods_Bus_and_two_other_methods_excludes_train_Persons + B46.Three_methods_Train_and_two_other_methods_Persons)/(B46.Three_methods_Total_three_methods_Persons + B46.Two_methods_Total_two_methods_Persons + B46.One_method_Total_one_method_Persons),
					 1.0*(B45B.Persons_Total_Occupation_Managers )/ B45B.Persons_Total_Total
					 from P02 
					  join P35 on P02.region_id = P35.region_id
					  join T26 on P02.region_id = T26.region_id
					  join B45B on P02.region_id = B45B.region_id
					  join B46 on P02.region_id = B46.region_id
					  join I14A on P02.region_id = I14A.region_id""")

		headings = ["region_id", "median_mortgage", "average_household_size", "median_household_income",
					"percent_female_earner", "percent_no_internet", "percent_unemployment", "percent_public_transport", "percent_born_managers"]
		csvWriter.writerow(headings)
		rows = cur.fetchall()
		for row in rows:
			print row
			csvWriter.writerow([parser(c,i) for i,c in enumerate(row)])

# sort()
fetch()

# with open('selected_cols.json','w') as f:
# 	json.dump(selected_cols, f)


# Selected Medians and Averages !!!!!!!!!!!!!!!!





# wage and earner stats
# http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/5673.0.55.0032005-06%20to%202010-11?OpenDocument
# estimates of personal income
# http://www.abs.gov.au/AUSSTATS/abs@.nsf/DetailsPage/6524.0.55.0022005-06%20to%202010-11?OpenDocument
