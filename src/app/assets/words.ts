/** Vocabulário local: sem acentos no tabuleiro, sempre com cinco letras. */
export const normalizeWord = (word: string): string =>
  word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const vocabulary = `
abrir aceno achar acida acido acima adeus adiar adora adoro afeto agora aguaa ainda ajuda alegre
algum alias aluna aluno amada amado ameno amiga amigo ampla amplo andar anexo animo antes
anual apego apelo apito apoio aptos arara arcos areia aroma arroz asilo astro atriz aulas autor
aviao aviso baixa baixo balas balde banco banda banho barba barco barra basta bater batom
bebem beber beija beijo beira belas belo bisco bloco blusa boato bobos bocas bolas bolsa bolso
bomba bonus borda botas botar brasa bravo breve briga brilho brisa broca bruta bruto busca
caber cabos cacau cachos caixa calar calca calma calmo calor campo canal canoa canta canto
capaz capas capim carga carne carro carta casal casas casca casco causa ceder cegar censo
cento cerca cerco certa certo cesta cetim ceusa chama chave cheia cheio chefe cheiro chora
chuva ciclo cifra cinto cinco cinza ciume clara claro clima cloro clube cobra cobre cofre
coisa colar colon comer comum conta conto copos coral corda cores corpo coroa corre corte
costa couro cravo creme crepe criaa crime crise crivo cruzo culpa culto cunha curta curto
curva custo dados danca datas deita deixa delas deles delta densa denso dente desde desta
deste deusa dever devia diabo dicas digna digno disco disso ditos dizer dobra doces doida
doido donos dores dorme dose dupla duplo durar duzia elite email etapa exata exato exibe
exito extra falam falar falsa falso falta fama farol farsa farta farto fatal fator fauna
favor fazer febre fecha fecho feira feita feito feliz femea ferro festa ficha ficam ficar
filha filho filme final finca firme fixar flora fluxo focar fogao fogos folha fonte forca
forma forno forro forte forum fosse fotos frase freio frete friaa frio fruta frutos fugaz
fugir fundo furar furia fusao gaita galho galos ganha ganho garfo garra gases gatos gelar
gemas genio gente geral gerir globo glote goles golpe gorro gosto gozar graca grade grama
graos grata grato grave grilo gripe grito grupo gruta guiar havia heroi honra hotel humor
ideal idade igual ilhas impar impor irmas irmao itens janta jarra jeito jogar joias jovem
julho junho junta junto justa justo labio laces lacos lados lagoa lapis larga largo laser
latas latim lavar legal legua leite leito lemes lenha lenta lento leque lesao leste letra
levar leves libra licao lider ligar lilas limpa limpo linda lindo linha lista litro livro
lobos local lojas longa longe longo lousa louca louco louro lucra lucro lugar lunar lutar
luzes luzir macro magia magoa magro maior malas malha manga mansa manso manta mapas marca
mares maria massa matar mecha media medio meiga meigo meias melao menos mente mesas meses
mesma mesmo metal metas meter metro mexer minha milho mimos mirar missa mista misto mitos
modas moeda molho molas monte morar morna morno morro morte mosca motor mover muita muito
multa mundo mural murro musas museu musgo nadar narra nasal natal navio negar negra negro
neles nesta neste netos nevoa nicho ninja nivel nobre noite nomes norte nossa nosso notas
novas novos nuvem obras obvio oeste olhar olhos ondas ontem opaco opera ordem orgao ossos
ostra outra outro ouvir pacto padre pagar palha palma palco panda panos papai papel parar
parda pardo pares parte passa passo pasta patas patio pausa pecas pedir pedra pegas pegar
peito peixe pelos penal pensa penso pente perda perde perto pesca peste piano piada picos
pilha pingo pinta pista placa plano plena pleno pluma pneus pocao poder poeta poema polvo
pomar pomba ponte ponto ponta porca porco porta posar posta poste povos praia prato prazo
preco prega presa preso prima primo prova pudim pular pulso punho puxar quais quase queda
quero quina quota ramos rampa ranco rapaz rasga rasos ratos razao redes regar regra reino
relva remar renda rende rente resto reter retos rezar ricos rifas rigor risca risco risos
ritmo rival rocha rodar rodas rolar romas ronda rosas rosto rotas rouba roubo roupa rubro
ruido rural saber sabia sabio sabor sacos saias saida salas saldo salsa salto salva salvo
samba santa santo saude secar sedas segue seios selar selos selva senha senso senta sente
serao seria serio serra serve setor sinal sinos sitio sobre sobra socia socio sogra sogro
solar solos solta solto somar somos sonho sopra sorte sutil subir sucos sugar sujar sulco
sumir super surdo surge surto susto suave tabua tacas talco tampa tango tanta tanto tarde
taxa taxas tecer tecla teias telao telas temos tempo tenaz tenda tenha tenho tenor tenta
tento tenue termo terra teste texto tigre timão tinta tirar toldo tomar tombo tonta tonto
topar toque torce torno torre torta tosse total touca touro traje trama trapo trata trato
trava treco trena trevo trigo trilha trios troca troco trono trufa turma turno tutor uniao
unica unico unido usada usado usual utero vacas vagar vagas valem valer valor vamos vapor
varal varas vasta vasto vazia vazio veias velas velha velho vemos venda venha vento verao
verbo verde verso veste video vidro vigia vilas vinho viola viram virar virus visao visita
vista visto vital viver vivos vozes volta votar vulgo xampu xingo zebra zeros zinco zonas
`;
// Respostas em português, independentes da validação livre das tentativas.
export const SOLUTIONS = [...new Set(`afeto agora ajuda amiga amigo andar apego areia aroma arroz aviao
banco banho barco beijo blusa bolsa brisa cacau caixa calma calor campo canto carne carro
carta casal casca causa certa certo cesta chave cheio chuva cinco cinza clara claro clima
coisa colar comer conto coral corda cores corpo coroa couro cravo creme curta curva danca
dente deusa dever dizer dobra doces dupla duzia etapa exato farol fauna favor fazer feira
feliz ferro festa filha filho filme final firme flora fogao folha fonte forma forno forte
frase freio fruta fugir fundo furia garfo garra gatos gente globo gosto graca grama grata
grato grilo grito grupo honra hotel humor ideal idade igual irmao jarra jeito jogar joias
jovem junto justo labio lacos lagoa lapis largo lavar legal leite lenha lento leque letra
levar leves lilas limpo linda lindo linha lista livro local longe louca louco lugar lunar
luzes magia maior malha manga manta marca mares massa meiga melao menos mente mesas metal
metro mexer milho mimos moeda molho monte morar morno mosca motor mover muito mundo mural
museu musgo nadar natal navio nevoa nivel nobre noite norte nossa notas nuvem olhar olhos
ondas ontem ordem ouvir padre pagar palha palma palco panda papel parar parte passo pasta
patio pausa pecas pedir pedra peito peixe pensa pente perda perto pesca piano piada pilha
pingo pista placa plano pleno pluma poder poeta poema polvo pomar ponte ponto porta praia
prato prazo preco prima primo prova pudim pular pulso punho puxar quase queda quero ramos
rampa rapaz razao redes regar regra reino relva remar renda resto ritmo rival rocha rodar
rosas rosto roupa saber sabia sabio sabor saida saldo salsa salto samba santo saude secar
selos selva senha senso serra sinal sinos sitio sobre solar solto somar sonho sorte suave
subir sucos sumir super susto tabua tampa tango tarde tecer tecla teias tempo tenda termo
terra texto tigre tinta tirar tomar toque torre torta total touca touro traje trama trevo
trigo troca trono trufa turma turno uniao unica unico unido valor vapor varal vazio velas
velho venda vento verao verde verso veste video vidro vigia vinho viola virar visao vista
viver volta vozes zebra
abrir aceno achar acida acido acima adeus adiar adora adoro ainda algum alias aluna aluno
amada amado ameno ampla amplo anexo animo antes anual apelo apito apoio aptos arara arcos
asilo astro atriz aulas autor aviso baixa baixo balas balde banda barba barra basta bater
batom bebem beber beija beira belas bloco boato bobos bocas bolas bolso bomba bonus borda
botas botar brasa bravo breve briga broca bruta bruto busca caber cabos calar calca calmo
canal canoa canta capaz capas capim carga casas casco ceder cegar censo cento cerca cerco
cetim chama cheia chefe chora ciclo cifra cinto ciume cloro clube cobra cobre cofre comum
conta copos corre corte costa crepe crime crise crivo cruzo culpa culto cunha curto custo
dados datas deita deixa delas deles delta densa denso desde desta deste devia diabo dicas
digna digno disco disso ditos doida doido donos dores dorme duplo durar elite email exata
exibe exito extra falam falar falsa falso falta farsa farta farto fatal fator febre fecha
fecho feita feito femea ficha ficam ficar finca fixar fluxo focar fogos forca forro forum
fosse fotos frete fugaz furar fusao gaita galho galos ganha ganho gases gelar gemas genio
geral gerir glote goles golpe gorro gozar grade graos grave gripe gruta guiar havia heroi
ilhas impar impor irmas itens janta julho junho junta justa larga laser latas latim legua
leito lemes lenta lesao leste libra licao lider ligar limpa litro lobos lojas longa longo
lousa louro lucra lucro lutar luzir macro magoa magro malas mansa manso mapas matar mecha
media medio meigo meias mesma mesmo metas meter minha mirar missa mista misto mitos modas
molas morna morro morte muita multa murro musas narra nasal negar negra negro neles nesta
neste netos nicho ninja nomes nosso novas novos obras obvio oeste opaco opera orgao ossos
ostra outra outro pacto panos papai parda pardo pares passa patas pegas pegar pelos penal
penso perde peste picos pinta plena pneus pocao pomba ponta porca porco posar posta poste
povos prega presa preso quais quina quota ranco rasga rasos ratos rende rente reter retos
rezar ricos rifas rigor risca risco risos rodas rolar ronda rotas rouba roubo rubro ruido
rural sacos saias salas salva salvo santa sedas segue seios selar senta sente serao seria
serio serve setor sobra socia socio sogra sogro solos solta somos sopra sutil sugar sujar
sulco surdo surge surto tacas talco tanta tanto taxas telao telas temos tenaz tenha tenho
tenor tenta tento tenue teste timao toldo tombo tonta tonto topar torce torno tosse trapo
trata trato trava treco trena trios troco tutor usada usado usual utero vacas vagar vagas
valem valer vamos varas vasta vasto vazia veias velha vemos venha verbo vilas viram virus
visto vital vivos votar vulgo xampu xingo zeros zinco zonas
abade abalo abano abate  acata acesa aceso adaga adubo afago afiar afins agito 
aguda agudo aipos alado alamo alcar alcem   alhos aliar  aloja alpes altar
alvos amago amora  anais  anglo anjos anoes ansia anzol aorta arame arcar arder
ardil ardor arida arido armar arpao asnos assar atear  atomo atroz audaz avela aviar
axila azedo azuis bacia bagre baiao balsa bambu banir barao baroa beato berco berra bicho
bingo bioma bisao bispo blefe bocal boias bolha boxer braco brejo bruxa bruxo bufar buque
burra burro busto butim cacto  calda calva calvo canga caqui cardo carpa catar 
cavar  celta cerne cerva cervo ciano cisma cisne cisco civis clama clone cocar cocos
coesa coeso coice combo conde cones corar corja corno corvo coser couve covas credo crera
criar crina cubos cueca cuida   cupim cupom curar cutis dedal deduz deter detem
dique dogma dolar dotar drena dreno  dueto  eixos emana envia ereta ereto errar
ervas escoa espia estar estou etica etico evoca exala expor facho facas  falha falho
fatia  feias feios feixe feras ferir fetal fibra figos filas filao  fluir fobia
focal foice folga fossa frade frevo frios frota fumos funil futil gabar gamba ganso garoa
geada gemeo ginga giros  gosma  grana graxa greta gueto harpa haste hiena hifen
hinos horta hoste idolo iglus imune inata inato india indio infla insta iones iscas istmo
jarro jaula jazia jeans jorra juiza junco juras lacre laica laico lapso larva lasca lebre
leiga leigo  lenda lente lepra lesma limao limbo limos lince linho locao logra loira
loiro lotar lotes lulas manto marra   meigo melar menta mirra mocho mofar mogno
moida moido molar monge morsa motel motim  mudez mugir  munir nacos ninfa ninho
noiva noivo   nozes nulos oasis obeso obesa obtem odiar  ogiva oleos ombro
omite ontem optam optar orcas orfas orfao orlar ornou ousar ovais ovino oxida oxido
pajem palmo pavao pavio peoes peras perna perua petiz pifia pifio pinha pinca pires pirao
poder podio podar porao poros prece  pudor pugil puras puros  quati quite radar
raiar raiva ralar rapto  raras raros  reler renal repor resma ricao rimas rimar
rival rocar rocio roida roido rolha rombo  ruiva ruivo rugas ruina sagaz sagui sanar
sarda sarna  sepia serva servo sigla silex siris sismo solda soros  sunga sutis
tacha talha talos tamis tapar taipa tchau teima temer tenue terco terno tiara tibia tinto
toldo tolos torso tosta trair trave treta tribo tripa trota truta tunel turva turvo umida
umido untar urina urnas urros urubu valsa vazao veado vedar velar veloz veraz vesga vesgo
vigor vilao visar  viuva viuvo vossa vosso vulto xerox  zelar ziper zomba zurra
`.split(/\s+/).map(normalizeWord).filter(word => /^[a-z]{5}$/.test(word)))];

// Mantido para consultas locais; as tentativas não dependem deste vocabulário.
export const WORDS = [...new Set([
  ...vocabulary.split(/\s+/).map(normalizeWord)
    .filter(word => /^[a-z]{5}$/.test(word) && !['aguaa', 'ceusa', 'criaa', 'friaa', 'laces'].includes(word)),
  ...SOLUTIONS
])];

