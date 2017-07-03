import json
import re
import sys

import bs4
import requests


def get_box_office(movie_id):
    url = ('http://www.boxofficemojo.com/movies/'
           '?id=%(movie_id)s&page=daily&view=chart') % {'movie_id': movie_id}

    response = requests.get(url)
    response.raise_for_status()

    document = bs4.BeautifulSoup(response.content, 'html.parser')
    chart = document.find(id='chart_container')
    table = chart.next_sibling
    rows = table.find_all('tr')

    results = []
    gross_pattern = re.compile(r'\$\d[\d,]+')

    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 10:
            continue

        day, date, rank, gross, _, _, theaters = [cell.text
                                                  for cell in cells[:7]]
        if not gross_pattern.match(gross):
            continue

        results.append({
            'day': day,
            'date': date,
            'rank': rank,
            'gross': gross,
            'theaters': theaters
        })

    return results


if __name__ == '__main__':
    movie_id = sys.argv.pop()
    box_office = get_box_office(movie_id)
    json.dump(box_office, sys.stdout)
