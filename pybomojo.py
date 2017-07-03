import json
import re
import sys

import bs4
import requests


def get_movie_id(search_term):
    response = requests.get('http://www.boxofficemojo.com/search/', params={
        'q': search_term
    })
    response.raise_for_status()

    document = bs4.BeautifulSoup(response.content, 'html.parser')

    movie_link_pattern = re.compile(r'/movies/\?id=([\w\.]+)')

    def movie_id_from_row(row):
        first_cell = row.select_one('td:nth-of-type(1)')
        if first_cell is None:
            return None
        movie_link = first_cell.find('a')
        if movie_link is None:
            return None
        movie_link_match = movie_link_pattern.search(movie_link['href'])
        if movie_link_match:
            return movie_link_match.group(1)

    matching_row = document.select_one('tr[bg-color="#FFFF99"]')
    if matching_row is not None:
        return movie_id_from_row(matching_row)

    for row in document.find_all('tr'):
        movie_id = movie_id_from_row(row)
        if movie_id:
            return movie_id


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
            'rank': parse_int(rank),
            'gross': parse_int(gross),
            'theaters': parse_int(theaters)
        })

    return results


def parse_int(value):
    try:
        return int(re.sub(r'[$,]', '', value))
    except ValueError:
        return None


if __name__ == '__main__':
    search_term = sys.argv.pop()
    movie_id = get_movie_id(search_term)
    box_office = get_box_office(movie_id)
    json.dump(box_office, sys.stdout)
