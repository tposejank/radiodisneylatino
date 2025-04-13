import cloudscraper
import re
import json
import glob

def get_next_data(request_text):
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', request_text, re.DOTALL)
    if match:
        return match.group(1)
    else:
        print("No matching script tag found.")

scraper = cloudscraper.create_scraper()
req = scraper.get('https://mx.radiodisney.com/')

extracted_data = get_next_data(req.text)
mexico_data = json.loads(extracted_data)

countries = mexico_data['props']['pageProps']['metaTags']['links']
print(countries)

country_list = []
for country in countries:
    print(country['href'])
    req = scraper.get(country['href'])
    extracted_data = get_next_data(req.text)
    country_data = json.loads(extracted_data)
    file = f"index_{country['hrefLang']}.json"
    country_list.append(country['hrefLang'])
    open(file, 'w').write(json.dumps(country_data, indent=4))

station_data = {}
for country in country_list:
    file = f"index_{country}.json"
    with open(file, 'r') as f:
        data = json.load(f)
        station_data[country] = data['props']['pageProps']['ENV']['stations']

open('stations.json', 'w').write(json.dumps(station_data, indent=4))