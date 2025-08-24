import cloudscraper
import re
import json
import glob

scraper = cloudscraper.create_scraper()
req = scraper.get('https://mx.radiodisney.com/api/streaming')

stations_data = json.loads(req.text)

station_data = {}
for country in stations_data['stations']:
    code = country['code'].upper()
    station_data[code] = country['stations']

open('stations.json', 'w').write(json.dumps(station_data, indent=4))