# pip install --upgrade google-api-python-client

# Authorize server-to-server interactions from Google Compute Engine.
# from oauth2client import gce
# import httplib2

# credentials = gce.AppAssertionCredentials(
#   scope='https://www.googleapis.com/auth/devstorage.read_write')
# http = credentials.authorize(httplib2.Http())


# sudo pip install python-fusiontables
from fusiontables import fileimport

fileimport.CSVImporter()
