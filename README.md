# Atlas de nós · Termo infinito para Gabi

Uma viagem pelo scroll: , em Aracaju → , em Brasília → nuvens → céu inspirado em A Noite Estrelada → Termo infinito.

O mapa começa nas ruas de Aracaju, afasta a câmera para acompanhar o percurso rodoviário e se aproxima de Águas Claras antes da subida. Os mapas e as fontes estão no projeto. O céu anima as próprias pinceladas de Van Gogh com um campo de redemoinhos em WebGL adaptado do Mediterranean Drift V3; não há dependências de mapas ou CDNs no navegador.

## Executar

```bash
npm install
npm start
```

Abra `http://localhost:4200`. Use o scroll, deslize a tela no celular ou use **Ir ao jogo** para entrar diretamente. Se o ambiente não detectar alterações de arquivos, execute `npm start -- --poll 1000`.

```bash
npm run build
npm test -- --watch=false
```

## Jogo

- Cinco letras e seis tentativas, sem limite de partidas. Qualquer combinação de cinco letras é aceita, mesmo fora do dicionário; acentos e cedilha são normalizados.
- 1.241 respostas em português em `SOLUTIONS`, sem repetições e com cinco letras.
- Modo carinho: uma dica revela a primeira letra sem consumir tentativa.
- Cada vitória acende uma estrela; as primeiras 28 liberam 28 bilhetes únicos, um por vitória.
- Partidas, dicas e estatísticas continuam salvas na chave existente `gabi-word-garden-v1`, preservando o progresso anterior.
- Teclado físico e virtual. As teclas só entram na partida quando o tabuleiro está visível, e ficam suspensas com diálogos abertos.
- Movimento reduzido respeitado; botão de pausa; scroll nativo; pintura local como fundo principal, com movimento localizado no céu em WebGL e retorno à reprodução estática em caso de falha. Animações param quando a aba fica oculta.

## Arquivos principais

- `src/app/journey/`: câmera, mapas, etapas da viagem e animação da pintura.
- `src/app/app.component.ts` e `src/app/app.html`: jogo, navegação e bilhetes.
- `src/app/game.service.ts`: regras e persistência das tentativas livres.
- `public/art/`: mapas SVG locais e pintura.
- `THIRD_PARTY_NOTICES.md`: CodePens, mapas, endereços e créditos.

Os scripts Python usam somente a biblioteca padrão e recebem os snapshots JSON locais das fontes descritas nos créditos. O navegador não depende desses scripts nem precisa de uma chave de API.
