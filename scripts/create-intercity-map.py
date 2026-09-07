"""Generate offline journey assets from OSM/IBGE/OSRM snapshots.
Usage: python3 scripts/create-intercity-map.py ARACAJU_OSM BRAZIL_IBGE OSRM_ROUTE
Street/route coordinates: OpenStreetMap contributors (ODbL). State borders: IBGE.
"""
import json, math, html, sys
from pathlib import Path
streets=json.loads(Path(sys.argv[1]).read_text())['elements']
states=json.loads(Path(sys.argv[2]).read_text())['features']
route_data=json.loads(Path(sys.argv[3]).read_text())
project=lambda lon,lat: ((lon+55)*100,(-4-lat)*100)
local=lambda p: ((p['lon']+37.071)*60000,(-10.899-p['lat'])*60000)
def path(points): return 'M'+'L'.join(f'{x:.3f} {y:.3f}' for x,y in points)
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1860 1920"><title>Centro de Aracaju, Rua Maruim — OpenStreetMap</title><rect width="1860" height="1920" fill="#e9e9e0"/>']
# Rio Sergipe: local OSM water polygons include the river's actual bank.
for category,fill,stroke in [('park','#d1ddc6','#c2d0b4'),('water','#bad4d2','#a5c4c4'),('building','#d9d9ce','#c8c9bf')]:
 parts.append(f'<g fill="{fill}" stroke="{stroke}" stroke-width=".8">')
 for e in streets:
  t=e.get('tags',{});g=e.get('geometry',[])
  use=t.get('leisure')=='park' if category=='park' else t.get('natural')=='water' if category=='water' else bool(t.get('building'))
  if use and g: parts.append(f'<path d="{path(map(local,g))}Z"/>')
 parts.append('</g>')
roads=[];labels={}
for e in streets:
 t=e.get('tags',{});g=e.get('geometry',[]);highway=t.get('highway')
 if not highway or not g: continue
 width=12 if highway in ['primary','secondary'] else 9 if highway in ['tertiary','residential'] else 3
 roads.append((path(map(local,g)),width))
 name=t.get('name','')
 if name and len(g)>len(labels.get(name,[])):labels[name]=g
parts.append('<g fill="none" stroke-linecap="round" stroke-linejoin="round">')
for p,w in roads:parts.append(f'<path d="{p}" stroke="#cecec2" stroke-width="{w+2}"/>')
for p,w in roads:parts.append(f'<path d="{p}" stroke="#fbfbf2" stroke-width="{w}"/>')
parts.append('</g><g font-family="Arial,sans-serif" font-size="10" fill="#859080" text-anchor="middle">')
for name,g in labels.items():
 if len(g)<3 or not name.startswith(('Rua','Avenida','Praça')):continue
 i=len(g)//2;x,y=local(g[i]);a=local(g[max(0,i-1)]);b=local(g[min(len(g)-1,i+1)]);angle=math.degrees(math.atan2(b[1]-a[1],b[0]-a[0]))
 if angle>90:angle-=180
 if angle< -90:angle+=180
 parts.append(f'<text transform="translate({x:.1f} {y-4:.1f}) rotate({angle:.1f})">{html.escape(name)}</text>')
parts.append('</g><text x="1050" y="680" font-family="Arial,sans-serif" font-size="25" letter-spacing="7" fill="#9ca68f" text-anchor="middle">CENTRO</text><text x="1050" y="709" font-family="Arial,sans-serif" font-size="10" letter-spacing="4" fill="#9ca68f" text-anchor="middle">ARACAJU · SERGIPE</text></svg>')
Path('public/art/aracaju-map.svg').write_text(''.join(parts))
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2600 2500"><title>Estados brasileiros — malha territorial IBGE</title><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#b6c6c0" stroke-width=".5" opacity=".4"/></pattern></defs><rect width="2600" height="2500" fill="#d5e2e0"/>']
colors=['#e5e8d9','#e9e9dc','#dee5d3','#e8e7d8']
for i,state in enumerate(states):
 geom=state['geometry'];polys=[geom['coordinates']] if geom['type']=='Polygon' else geom['coordinates']
 for poly in polys:
  d=''.join(path(project(*p) for p in ring)+'Z' for ring in poly)
  parts.append(f'<path d="{d}" fill="{colors[i%4]}" stroke="#b9c5a9" stroke-width="1"/>')
parts.append('<rect width="2600" height="2500" fill="url(#grid)"/>')
for name,lon,lat in [('BAHIA',-42,-12.2),('SERGIPE',-37.6,-10.5),('GOIÁS',-49.2,-15.2),('MINAS GERAIS',-45,-18),('TOCANTINS',-48.3,-10),('PERNAMBUCO',-38.6,-8.1),('ALAGOAS',-36.4,-9.5),('PIAUÍ',-43,-7.8)]:
 x,y=project(lon,lat);parts.append(f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" letter-spacing="4" fill="#9ba98b">{name}</text>')
for name,lon,lat in [('Salvador',-38.501,-12.977),('Feira de Santana',-38.96,-12.25),('Barreiras',-44.99,-12.14),('Luís Eduardo Magalhães',-45.8,-12.09),('Goiânia',-49.26,-16.68),('Maceió',-35.73,-9.65),('Paulo Afonso',-38.22,-9.40)]:
 x,y=project(lon,lat);parts.append(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#9aa48a"/><text x="{x+8}" y="{y+4}" font-family="Arial,sans-serif" font-size="12" fill="#8d9b7d">{name}</text>')
parts.append('<text x="1950" y="1200" transform="rotate(-60 1950 1200)" font-family="Georgia,serif" font-size="20" font-style="italic" letter-spacing="4" fill="#a5bdbc">Oceano Atlântico</text></svg>')
Path('public/art/brasil-map.svg').write_text(''.join(parts))
points=[project(*p) for p in route_data['routes'][0]['geometry']['coordinates']]
def simplify(points,tolerance):
 if len(points)<3:return points
 a,b=points[0],points[-1];dx,dy=b[0]-a[0],b[1]-a[1];den=dx*dx+dy*dy
 def dist(p):
  t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
 index=max(range(1,len(points)-1),key=lambda i:dist(points[i]))
 if dist(points[index])<=tolerance:return [a,b]
 return simplify(points[:index+1],tolerance)[:-1]+simplify(points[index:],tolerance)
# Keep local departure/arrival geometry; simplify only the intercity middle.
clean=points[:120]+simplify(points[120:-120],.035)+points[-120:]
Path('src/app/journey/map-route.ts').write_text('// OSRM route over OpenStreetMap data; credits and exact endpoints in THIRD_PARTY_NOTICES.md.\n'+f'export const MAP_ROUTE = {json.dumps(path(clean))};\n'+f'export const ROUTE_START = {{ x: {points[0][0]:.4f}, y: {points[0][1]:.4f} }};\n'+f'export const ROUTE_END = {{ x: {points[-1][0]:.4f}, y: {points[-1][1]:.4f} }};\n')
print(f'Aracaju map: {len(roads)} streets. Intercity route: {len(points)} → {len(clean)} points, {route_data["routes"][0]["distance"]/1000:.1f} km.')
