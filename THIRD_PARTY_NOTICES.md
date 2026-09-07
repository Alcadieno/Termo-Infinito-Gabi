# Referências e créditos

## Efeitos visuais

- **Mediterranean Drift V3 (WebGL)**, Luis Lessrain: https://codepen.io/luis-lessrain/pen/emgBwPj . Base fornecida pelo usuário em 7 de setembro de 2026. O campo de pressão de `computeCell` (rotação tangencial, entrada radial e atenuação gaussiana) foi adaptado para GLSL em `src/app/journey/painting-flow.ts`. Em vez de partículas de vento, esse campo desloca a textura local da pintura em duas fases alternadas, mantendo os detalhes sem acumular distorção. Os centros seguem os redemoinhos da obra; máscaras preservam a vila, as bordas e o cipreste. Limites de 30 FPS e DPR 1 seguem a referência. A animação anterior de estrelas Dreamwave não é mais utilizada.
- **Scroll Map, Split-Screen & Expandable**, creativeocean: https://codepen.io/creativeocean/pen/myOVZYO . Referência para a linha desenhada progressivamente, o marcador que percorre um SVG e a câmera que acompanha esse marcador. Aqui o movimento foi reimplementado com `getPointAtLength`, `requestAnimationFrame` e scroll nativo, integrado à subida ao céu.

## Mapas e percurso

Dados consultados em 7 de setembro de 2026. Os mapas são SVGs locais e nenhuma consulta geográfica é feita durante a partida.

- Ruas, edifícios e parques: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). Geometria obtida pela [Overpass API](https://overpass-api.de/).
- Contornos estaduais: [IBGE, API de malhas territoriais](https://servicodados.ibge.gov.br/api/docs/malhas?versao=3), país BR com divisões UF, qualidade mínima.
- Traçado rodoviário: [OSRM](https://project-osrm.org/), com dados OpenStreetMap. Snapshot de 1.678,453 km entre os pontos abaixo. A experiência é narrativa; não oferece navegação em tempo real.
- Origem: **Rua Maruim, Centro, Aracaju/SE, CEP 49010-160** (trecho até 1033/1034), confirmado no [ViaCEP](https://viacep.com.br/ws/49010160/json/). Ponto do traçado: latitude -10.914992, longitude -37.052627.
- Destino: **Rua 5 Norte, Águas Claras, Brasília/DF, CEP 71907-720**, confirmado no [ViaCEP](https://viacep.com.br/ws/71907720/json/) e no OpenStreetMap (way 135229853). Ponto do traçado: latitude -15.834636, longitude -48.012034.
- Como não foram informados números de imóveis, os pontos representam os trechos das ruas associados aos CEPs.

A atribuição dos dados está visível no mapa. `scripts/create-intercity-map.py` gera o mapa de Aracaju, a visão nacional e a rota a partir dos snapshots. `scripts/create-neighborhood-map.py` gera o SVG local de Águas Claras.

## Pintura e fontes

- **A Noite Estrelada**, Vincent van Gogh, 1889. Reprodução de domínio público, [Wikimedia Commons / Google Art Project](https://commons.wikimedia.org/wiki/File:Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg). Arquivo local `public/art/starry-night.jpg`, usado como fundo principal, com enquadramento para telas estreitas. A textura da pintura é animada em WebGL. A reprodução estática permanece por baixo e reaparece se o contexto, a textura ou os shaders falharem; movimento reduzido mantém a obra parada.
- **Cormorant Garamond** e **DM Sans**, distribuídas pelo Google Fonts sob SIL Open Font License. Fontes servidas localmente em `public/fonts/`.
