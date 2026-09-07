"""Build the local SVG and scroll path from an Overpass `out geom` snapshot.
Usage: python3 scripts/create-neighborhood-map.py /path/to/overpass.json
Map data: © OpenStreetMap contributors, ODbL 1.0. See THIRD_PARTY_NOTICES.md.
The path is an artistic itinerary, not a turn-by-turn navigation service.
"""
import heapq
import html
import json
import math
from pathlib import Path
import sys

ways = json.loads(Path(sys.argv[1]).read_text())['elements']
WIDTH, HEIGHT = 2200, 1800

def project(p):
    return ((p['lon'] + 48.046) * 44000, (-15.819 - p['lat']) * 46000)

def d(geometry, close=False):
    return 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x,y in map(project, geometry)) + ('Z' if close else '')

parks, water, buildings, roads, paths = [], [], [], [], []
labels = {}
graph, coords = {}, {}
for way in ways:
    tags, geom = way.get('tags', {}), way.get('geometry', [])
    if len(geom) < 2: continue
    if tags.get('leisure') == 'park':
        parks.append(d(geom, True))
    elif tags.get('natural') == 'water': water.append(d(geom, True))
    elif tags.get('building'): buildings.append(d(geom, True))
    highway = tags.get('highway')
    if not highway: continue
    if highway in ['footway', 'cycleway', 'path', 'steps', 'pedestrian']: paths.append(d(geom))
    else:
        width = 10 if highway in ['motorway','trunk','primary','secondary'] else 7 if highway in ['tertiary','residential'] else 3
        roads.append((d(geom), width, highway))
        name = tags.get('name', '')
        if name and len(geom) > len(labels.get(name, [])): labels[name] = geom
    if highway in ['motorway','motorway_link','trunk','trunk_link'] or tags.get('access') == 'private': continue
    for node,p in zip(way['nodes'],geom): coords[node] = project(p)
    for a,b in zip(way['nodes'],way['nodes'][1:]):
        if a not in coords or b not in coords: continue
        cost = math.dist(coords[a],coords[b])
        graph.setdefault(a,[]).append((b,cost)); graph.setdefault(b,[]).append((a,cost))

parts=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}"><title>Águas Claras, Brasília — mapa de ruas do OpenStreetMap</title><rect width="{WIDTH}" height="{HEIGHT}" fill="#e9e9e0"/>']
parts.append('<g fill="#d2ddc6" stroke="#c4d2b4" stroke-width="1">'+''.join(f'<path d="{p}"/>' for p in parks)+'</g>')
parts.append('<g fill="#bdd6d5" stroke="#a9c9c8">'+''.join(f'<path d="{p}"/>' for p in water)+'</g>')
parts.append('<g fill="#d9d9ce" stroke="#c8c9bf" stroke-width=".6">'+''.join(f'<path d="{p}"/>' for p in buildings)+'</g>')
parts.append('<g fill="none" stroke="#bfc8b4" stroke-width="1.5" stroke-dasharray="3 3">'+''.join(f'<path d="{p}"/>' for p in paths)+'</g>')
parts.append('<g fill="none" stroke-linejoin="round" stroke-linecap="round">')
for p,width,kind in roads: parts.append(f'<path d="{p}" stroke="#d1d1c5" stroke-width="{width+2}"/>')
for p,width,kind in roads: parts.append(f'<path d="{p}" stroke="{ "#f8f5e4" if kind in ["primary","secondary","tertiary"] else "#fafaf4"}" stroke-width="{width}"/>')
parts.append('</g><g font-family="Arial,sans-serif" font-size="9" fill="#858c7e" text-anchor="middle">')
for name,geom in labels.items():
    if not (name.startswith('Rua ') or name.startswith('Avenida ')): continue
    if len(geom)<4 and not name.startswith('Avenida'): continue
    i=len(geom)//2; x,y=project(geom[i]); x1,y1=project(geom[max(0,i-1)]); x2,y2=project(geom[min(len(geom)-1,i+1)])
    angle=math.degrees(math.atan2(y2-y1,x2-x1))
    if angle>90: angle-=180
    if angle< -90: angle+=180
    parts.append(f'<text transform="translate({x:.1f} {y-3:.1f}) rotate({angle:.1f})">{html.escape(name)}</text>')
parts.append('</g>')
for text,lat,lon,size,color in [('PARQUE ECOLÓGICO',-15.8293,-48.0252,15,'#7d9672'),('ÁGUAS CLARAS',-15.830,-48.0252,12,'#7d9672'),('ÁGUAS CLARAS',-15.8399,-48.0203,24,'#a7ad9f'),('BRASÍLIA · DF',-15.841,-48.0203,10,'#a7ad9f')]:
    x,y=project({'lat':lat,'lon':lon})
    parts.append(f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{size}" letter-spacing="3" fill="{color}">{text}</text>')
parts.append('</svg>')
Path('public/art/aguas-claras-map.svg').write_text(''.join(parts))
print(f'Created Águas Claras map with {len(buildings)} buildings and {len(roads)} street sections.')
