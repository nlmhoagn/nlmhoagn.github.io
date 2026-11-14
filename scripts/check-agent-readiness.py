from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import json
import re
import xml.etree.ElementTree as ET

DIST = Path(__file__).resolve().parent.parent / 'dist'
ORIGIN = 'https://nlmhoagn.github.io'

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.text = []
        self.headings = []
        self.links = []
        self.meta = {}
        self.jsonld = []
        self.capture_json = False
        self.ignore = 0
        self.feed(source)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style'):
            self.ignore += 1
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.capture_json = True
        if re.fullmatch(r'h[1-6]', tag):
            self.headings.append(int(tag[1]))
        if tag in ('a', 'link'):
            self.links.append(attrs)
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name', ''))] = attrs.get('content', '')
    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.ignore -= 1
            self.capture_json = False
    def handle_data(self, data):
        if self.capture_json:
            self.jsonld.append(json.loads(data))
        if not self.ignore:
            self.text.append(data)

def page(path):
    return Page((DIST / path).read_text(encoding='utf-8'))

home = page('index.html')
assert len(' '.join(home.text).strip()) >= 500
assert home.headings[0] == 1 and all(b <= a + 1 for a, b in zip(home.headings, home.headings[1:]))
assert any(x.get('rel') == 'canonical' and x.get('href') == ORIGIN + '/' for x in home.links)
assert home.meta['og:type'] == 'website'
assert (DIST / urlparse(home.meta['og:image']).path.lstrip('/')).is_file()
assert any(x.get('rel') == 'alternate' and x.get('type') == 'text/markdown' and x.get('href') == '/index.md' for x in home.links)
person, = home.jsonld
assert person['@type'] == 'Person' and person['url'] == ORIGIN + '/' and person['knowsAbout'] and person['sameAs']
assert person['email'] and person['telephone'] and person['address']['addressLocality']
for slug in ('about', 'contact', 'privacy'):
    p = page(f'{slug}/index.html')
    assert len(' '.join(p.text).strip()) >= 500, slug
    assert p.headings[0] == 1 and all(b <= a + 1 for a, b in zip(p.headings, p.headings[1:])), slug
    assert any(x.get('rel') == 'canonical' and x.get('href') == f'{ORIGIN}/{slug}/' for x in p.links)
    assert any(x.get('href') == f'/{slug}/' for x in home.links)
assert 'agent guide' in ' '.join(page('404.html').text).lower()
assert 'noindex' in page('resume.html').meta['robots']
assert 'noindex' in page('avatar-preview.html').meta['robots']
markdown = (DIST / 'index.md').read_text(encoding='utf-8')
assert markdown.startswith('# ') and len(markdown) > 500
llms = (DIST / 'llms.txt').read_text(encoding='utf-8')
assert llms.startswith('# ') and '\n> ' in llms and '## When to use this' in llms
for url in re.findall(r'\]\((https://nlmhoagn\.github\.io/[^)]*)\)', llms):
    path = urlparse(url).path.lstrip('/')
    assert (DIST / (path + 'index.html' if path.endswith('/') else path)).is_file(), url
root = ET.parse(DIST / 'sitemap.xml').getroot()
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = root.findall('s:url', ns)
assert {x.findtext('s:loc', namespaces=ns) for x in urls} == {ORIGIN + '/', *(f'{ORIGIN}/{s}/' for s in ('about', 'contact', 'privacy'))}
for entry in urls:
    assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', entry.findtext('s:lastmod', namespaces=ns))
assert f'Sitemap: {ORIGIN}/sitemap.xml' in (DIST / 'robots.txt').read_text(encoding='utf-8')
print('Agent readiness checks passed for built files.')
