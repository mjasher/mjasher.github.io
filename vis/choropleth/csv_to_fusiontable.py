
# Google documentation for python api and fusion tables
# https://www.googleapis.com/fusiontables/v1/tables
# https://developers.google.com/api-client-library/python/start/installation


# 1. Go to code.google.com/apis/console
# 2. Turn on the Fusion Tables API
# 3. Accept the terms
# 4. go to APIs & aut -> credentials in left menu
# 5. Create oauth client id

# make a client_secrets.json like

# {
#   "web": {
#     "client_id": "[[INSERT CLIENT ID HERE]]",
#     "client_secret": "[[INSERT CLIENT SECRET HERE]]",
#     "redirect_uris": [],
#     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
#     "token_uri": "https://accounts.google.com/o/oauth2/token"
#   }
# }

import argparse
import sys

from apiclient.errors import HttpError
from apiclient import sample_tools
from oauth2client.client import AccessTokenRefreshError


# Declare command-line flags.
argparser = argparse.ArgumentParser(add_help=False)
argparser.add_argument('table_id', type=str,
                     help=('The table ID of the profile you wish to access. '
                           'Format is ga:xxx where xxx is your profile ID.'))


def main(argv):
  # Authenticate and construct service.
  service, flags = sample_tools.init(
      argv, 'analytics', 'v3', __doc__, __file__, parents=[argparser],
      scope='https://www.googleapis.com/auth/analytics.readonly')

  # Try to make a request to the API. Print the results or handle errors.
  try:
    results = get_api_query(service, flags.table_id).execute()
    print_results(results)

  except TypeError, error:
    # Handle errors in constructing a query.
    print ('There was an error in constructing your query : %s' % error)

  except HttpError, error:
    # Handle API errors.
    print ('Arg, there was an API error : %s : %s' %
           (error.resp.status, error._get_reason()))

  except AccessTokenRefreshError:
    # Handle Auth errors.
    print ('The credentials have been revoked or expired, please re-run '
           'the application to re-authorize')


if __name__ == '__main__':
  main(sys.argv)



# import urllib2, urllib, simplejson, sys, httplib

# pip install --upgrade google-api-python-client

# Authorize server-to-server interactions from Google Compute Engine.
# from oauth2client import gce
# import httplib2

# credentials = gce.AppAssertionCredentials(
#   scope='https://www.googleapis.com/auth/devstorage.read_write')
# http = credentials.authorize(httplib2.Http())


# sudo pip install python-fusiontables
# from fusiontables import fileimport

# fileimport.CSVImporter()




# class RunAPITest:
#   def __init__(self):
#     self.access_token = ""
#     self.params = ""

#   def main(self):
#     print "copy and paste the url below into browser address bar and hit enter"
#     print "https://accounts.google.com/o/oauth2/auth?%s%s%s%s" % \
#       ("client_id=%s&" % (client_id),
#       "redirect_uri=%s&" % (redirect_uri),
#       "scope=https://www.googleapis.com/auth/fusiontables&",
#       "response_type=code")

#     code = raw_input("Enter code (parameter of URL): ")
#     data = urllib.urlencode({
#       "code": code,
#       "client_id": client_id,
#       "client_secret": client_secret,
#       "redirect_uri": redirect_uri,
#       "grant_type": "authorization_code"
#     })

#     serv_req = urllib2.Request(url="https://accounts.google.com/o/oauth2/token",
#        data=data)

#     serv_resp = urllib2.urlopen(serv_req)
#     response = serv_resp.read()
#     tokens = simplejson.loads(response)
#     access_token = tokens["access_token"]
#     self.access_token = access_token
#     self.params = "?key=%s&access_token=%s" % \
#       (api_key, self.access_token)

# if __name__ == "__main__":
#   api_test = RunAPITest()
#   api_test.main()
