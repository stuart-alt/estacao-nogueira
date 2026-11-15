// CONTEÚDO do app de vistoria — somente dados, sem lógica.
// Fonte: Memorial Descritivo (Quadros VI e VII), Promessa de Compra e Venda,
// Contrato CEF, Convenção do Condomínio e pedidos DKZA.
// NÃO incluir dados pessoais (nome, CPF, valores, contas, número da unidade).

export const PROJECT = {
  name: 'Estação Nogueira II',
  subtitle: 'Vistoria de entrega — apartamento com garden',
};

export const SOURCES = {
  construtora: { label: 'Construtora', short: 'Construtora' },
  dkza: { label: 'DKZA', short: 'DKZA' },
  comprador: { label: 'Por sua conta', short: 'Você' },
};

const MQ6 = 'Memorial Quadro VI';
const MQ7 = 'Memorial Quadro VII';
const DKZA = 'Pedidos DKZA — entrega junto com as chaves';
const SUBST = 'Substituído pela DKZA';

export const DELIVERY = [
  {
    id: 'eletrica', category: 'Elétrica', items: [
      { id: 'el-quadro', text: 'Quadro de disjuntores padrão DIN (Lorenzetti, Eletromar ou Siemens); tomadas e interruptores protegidos por disjuntores', source: 'construtora', ref: MQ6 },
      { id: 'el-fios', text: 'Fiação PVC 450/750 V (Megatron, Elofios ou Sig) conforme projeto de instalações', source: 'construtora', ref: MQ6 },
      { id: 'el-tomadas', text: 'Tomadas e interruptores Iluminim, Tramontina ou Alumbra — linha branca ou bege', source: 'construtora', ref: MQ6 },
      { id: 'el-eletrodutos', text: 'Eletrodutos em PVC flexível (Tigre, Amanco ou Santa Cruz)', source: 'construtora', ref: MQ6 },
      { id: 'el-220', text: 'Tomada abaixo da bancada da cozinha trocada de 110 V para 220 V (cooktop de indução)', source: 'dkza', ref: DKZA },
      { id: 'el-garden', text: 'Ponto de tomada no garden', source: 'dkza', ref: DKZA },
    ],
  },
  {
    id: 'iluminacao', category: 'Iluminação', items: [
      { id: 'il-pontos', text: 'Pontos de luz com fiação, conforme projeto', source: 'construtora', ref: MQ6 },
      { id: 'il-luminarias', text: 'Luminárias, plafons, spots e lâmpadas — não constam do memorial', source: 'comprador', ref: 'Memorial (não consta)' },
    ],
  },
  {
    id: 'hidraulica', category: 'Hidráulica', items: [
      { id: 'hi-tubos', text: 'Tubos e conexões em PVC (Tigre, Fortlev ou Amanco)', source: 'construtora', ref: MQ6 },
      { id: 'hi-registros', text: 'Registros Docol, Fabrimar ou Deca', source: 'construtora', ref: MQ6 },
      { id: 'hi-agua', text: 'Água com medição coletiva; hidrômetros individuais instalados depois, pelo condomínio', source: 'construtora', ref: 'Convenção — abastecimento de água' },
      { id: 'hi-varanda', text: '2 pontos de água e esgoto na varanda/garden', source: 'dkza', ref: DKZA },
      { id: 'hi-torneira', text: 'Torneira no muro do garden (sem elétrica)', source: 'dkza', ref: DKZA },
    ],
  },
  {
    id: 'gas', category: 'Gás e aquecimento', items: [
      { id: 'gas-central', text: 'Central de GLP com cilindros recarregáveis (Supergasbras, Minasgás ou Ultragaz)', source: 'construtora', ref: MQ6 },
      { id: 'gas-tubos', text: 'Tubulação de gás em aço ou multicamada, conforme normas ABNT', source: 'construtora', ref: MQ6 },
      { id: 'gas-kit', text: 'Kit de medição de gás do fogão', source: 'dkza', ref: DKZA },
      { id: 'gas-aquecedor', text: 'Pontos de aquecedor a gás nos chuveiros social e suíte (sem aparelho)', source: 'dkza', ref: DKZA },
      { id: 'gas-aparelhos', text: 'Aquecedores, chuveiros e fogão/cooktop (aparelhos)', source: 'comprador', ref: 'Memorial (não consta)' },
    ],
  },
  {
    id: 'esquadrias', category: 'Esquadrias, vidros e ferragens', items: [
      { id: 'es-externas', text: 'Janelas/portas externas em alumínio anodizado branco (Alumasa, Ibrap ou Unicasa)', source: 'construtora', ref: MQ6 },
      { id: 'es-internas', text: 'Portas internas de madeira com pintura (Sulportas, Slink ou Eucatex)', source: 'construtora', ref: MQ6 },
      { id: 'es-vidros', text: 'Vidro comum liso, conforme projeto e normas', source: 'construtora', ref: MQ6 },
      { id: 'es-fechaduras', text: 'Fechaduras Stam, Haga ou Aliança, cromadas, de alavanca; banheiro tipo tranqueta', source: 'construtora', ref: MQ6 },
    ],
  },
  {
    id: 'loucas-metais', category: 'Louças e metais', items: [
      { id: 'lm-bacia', text: 'Bacia sanitária com caixa acoplada em porcelana (Fiori, Icasa ou Logasa)', source: 'construtora', ref: MQ6 },
      { id: 'lm-cuba-banheiro', text: 'Cuba de embutir em porcelana nos banheiros', source: 'construtora', ref: MQ6 },
      { id: 'lm-tanque', text: 'Tanque de mármore sintético sem coluna (Ica, Ajorato ou Decoralita)', source: 'construtora', ref: MQ6 },
      { id: 'lm-cuba-cozinha', text: 'Cuba inox nº 1 na cozinha (Tramontina, Tecnocuba ou Franke)', source: 'construtora', ref: MQ6 },
      { id: 'lm-torneira', text: 'Torneiras cromadas (Japi, Esteves ou Imperatriz) e sifão de PVC', source: 'construtora', ref: MQ6 },
    ],
  },
  {
    id: 'pisos-paredes', category: 'Pisos, paredes e tetos', items: [
      { id: 'pp-sala', text: 'Sala: piso laminado e rodapé laminado; paredes e teto em gesso liso com pintura', source: 'construtora', ref: MQ7 },
      { id: 'pp-quartos', text: 'Quartos e circulação: piso e rodapé laminados; paredes e teto em gesso com pintura', source: 'construtora', ref: MQ7, note: 'Laminado Duraflor, Eucaflor ou Floorest' },
      { id: 'pp-banheiros', text: 'Banheiros: piso e paredes em cerâmica esmaltada; teto em gesso liso ou rebaixo, com pintura', source: 'construtora', ref: MQ7, note: 'Cerâmica Ceral, Incefra ou Eliane' },
      { id: 'pp-cozinha', text: 'Cozinha e área de serviço: piso e paredes em cerâmica esmaltada; teto em gesso com pintura', source: 'construtora', ref: MQ7 },
      { id: 'pp-varanda', text: 'Varanda: piso e rodapé cerâmicos; paredes com textura; teto em gesso com pintura', source: 'construtora', ref: MQ7 },
      { id: 'pp-parede-cozinha', text: 'Remoção da parede da cozinha (conceito aberto)', source: 'dkza', ref: DKZA, note: 'Exigir as-built/ART comprovando que não é estrutural' },
    ],
  },
  {
    id: 'pedras', category: 'Bancadas, soleiras e peitoris', items: [
      { id: 'pd-granito', text: 'Bancada da cozinha, soleiras e peitoris em granito (Ocre Itabira, Cinza Andorinha ou Corumbá)', source: 'construtora', ref: `${MQ6} / ${MQ7}`, note: SUBST },
      { id: 'pd-cozinha', text: 'Cozinha: bancada em quartzito Branco Estrelar com extensão até o tanque (até 3,20 m)', source: 'dkza', ref: DKZA },
      { id: 'pd-cozinha-soleira', text: 'Peitoril da janela e soleira da porta de entrada em quartzito Branco Estrelar', source: 'dkza', ref: DKZA },
      { id: 'pd-banheiro-suite', text: 'Banheiro suíte: bancada simples até 1,20 m com frontão de 15 cm e soleira em Branco Pitaya', source: 'dkza', ref: DKZA },
      { id: 'pd-banheiro-social', text: 'Banheiro social: bancada com extensão sobre o vaso até 1,45 m, frontão de 15 cm e soleira em Branco Pitaya', source: 'dkza', ref: DKZA },
    ],
  },
  {
    id: 'banheiros', category: 'Box dos banheiros', items: [
      { id: 'bx-vidro', text: '2 boxes de vidro temperado 8 mm incolor, porta de correr, ferragem preta', source: 'dkza', ref: DKZA },
      { id: 'bx-pedra', text: '2 divisórias de box em pedra (Branco Pitaya, 0,10 × até 1,00 m)', source: 'dkza', ref: DKZA },
    ],
  },
  {
    id: 'garden', category: 'Garden', items: [
      { id: 'gd-padrao', text: 'Grama natural e cerca viva; paredes com base reguladora e textura', source: 'construtora', ref: MQ7, note: SUBST },
      { id: 'gd-muros', text: '2 muros de divisa com os apartamentos vizinhos e muro de divisa com o estacionamento', source: 'dkza', ref: DKZA },
      { id: 'gd-piso', text: 'Contrapiso e instalação de porcelanato até 0,75 × 0,75 m (mão de obra)', source: 'dkza', ref: DKZA },
    ],
  },
  {
    id: 'documentos', category: 'Documentos na entrega', items: [
      { id: 'doc-chaves', text: 'Chaves da unidade', source: 'construtora', ref: 'Promessa cl. 11ª §5' },
      { id: 'doc-habitese', text: 'Certidão do Habite-se', source: 'construtora', ref: 'Promessa cl. 11ª §4–5 / CEF cl. 28.1' },
      { id: 'doc-manual', text: 'Manual do Proprietário', source: 'construtora', ref: 'Promessa cl. 11ª §4–5 / CEF cl. 37.1-m' },
      { id: 'doc-iptu', text: 'Carnê do IPTU, se a prefeitura já tiver emitido', source: 'construtora', ref: 'Promessa cl. 11ª §12' },
      { id: 'doc-dkza', text: 'Manual de Uso e Operação da DKZA, com prazos de garantia', source: 'dkza', ref: 'Contrato DKZA — Da Garantia' },
    ],
  },
  {
    id: 'comprador', category: 'Por sua conta', items: [
      { id: 'cp-moveis', text: 'Espelhos, armários e móveis planejados', source: 'comprador', ref: 'Memorial (não consta)' },
      { id: 'cp-ar', text: 'Ar-condicionado — a convenção proíbe aparelho que altere a fachada', source: 'comprador', ref: 'Convenção — fachada' },
      { id: 'cp-ligacoes', text: 'Ligações definitivas de luz, gás e telefone, e medidores individuais', source: 'comprador', ref: 'Promessa cl. 17ª par. único' },
      { id: 'cp-habitese', text: 'Averbação do Habite-se na matrícula', source: 'comprador', ref: 'Promessa cl. 11ª §9' },
      { id: 'cp-titularidade', text: 'Transferir titularidade (IPTU, condomínio, concessionárias) em até 90 dias após as chaves', source: 'comprador', ref: 'Promessa cl. 11ª §2' },
    ],
  },
];

export const REMINDERS = [
  { id: 'r-laudo', title: 'Tudo no laudo assinado', detail: 'Só as pendências que constarem do laudo de vistoria assinado serão corrigidas pela garantia. Anote tudo, mesmo o que parecer pequeno.', ref: 'Promessa cl. 11ª §4' },
  { id: 'r-90dias', title: '90 dias para transferir titularidades', detail: 'Após receber as chaves, transfira IPTU, condomínio e concessionárias e protocole o comprovante na incorporadora. Multa de R$ 500 por dia de atraso.', ref: 'Promessa cl. 11ª §2' },
  { id: 'r-habitese', title: 'Averbar o Habite-se', detail: 'A averbação do Habite-se na matrícula é feita por você, às suas custas, assim que receber a certidão.', ref: 'Promessa cl. 11ª §5a e §9' },
  { id: 'r-condominio', title: 'Taxa provisória de condomínio', detail: 'Até a 1ª assembleia, cobra-se 25% do salário mínimo por mês.', ref: 'Promessa cl. 11ª §10' },
  { id: 'r-parede', title: 'Parede removida da cozinha', detail: 'Peça à construtora e à DKZA documento (as-built ou ART) comprovando que a parede removida não é estrutural. O contrato CEF proíbe remover paredes em alvenaria estrutural.', ref: 'CEF cl. 23' },
  { id: 'r-nbr', title: 'Desempenho e vícios de construção', detail: 'A construtora responde pela segurança, solidez e pelo desempenho mínimo da NBR 15.575, e deve atender reclamações de vícios comprovados.', ref: 'CEF cl. 37.1-l e 37.2' },
  { id: 'r-prazo', title: 'Prazo da obra', detail: '36 meses após o contrato de financiamento, mais tolerância. Se o atraso passar de 6 meses, os encargos mensais da CAIXA passam a ser pagos pela construtora.', ref: 'CEF cl. 3.11 e 25 / Promessa Q-X' },
  { id: 'r-dkza-unidade', title: 'Corrigir termo da DKZA', detail: 'O termo de consentimento da DKZA cita o apartamento com número incompleto. Peça a correção do documento.', ref: 'Contrato DKZA — Termo de Consentimento' },
];

export const TOOLS = [
  { id: 'testador-tomada', name: 'Testador de tomada com indicação de tensão (ou multímetro)', use: 'Confirma tensão (127/220 V), polaridade e aterramento de cada tomada.', essential: true },
  { id: 'lampada-teste', name: 'Lâmpada de teste com soquete/bocal adaptador', use: 'Testa cada ponto de luz e interruptor, já que luminárias não vêm instaladas.', essential: true },
  { id: 'trena', name: 'Trena de 5 m', use: 'Confere medidas de cômodos, bancadas, vãos e alturas.', essential: true },
  { id: 'nivel-bolha', name: 'Nível de bolha (60 cm ou mais)', use: 'Verifica nivelamento de pisos, bancadas, soleiras e peitoris, e prumo de batentes.', essential: true },
  { id: 'martelo-borracha', name: 'Martelo de borracha (ou cabo de chave de fenda)', use: 'Bate leve em pisos e azulejos: som oco indica peça descolada.', essential: true },
  { id: 'balde', name: 'Balde ou garrafa de 2 L com água', use: 'Testa ralos, caimento de piso nas áreas molhadas, varanda e garden.', essential: true },
  { id: 'lanterna', name: 'Lanterna', use: 'Ilumina rasante em paredes e pisos para ver ondulações, manchas e falhas de pintura.', essential: true },
  { id: 'carregador-usb', name: 'Carregador de celular', use: 'Teste rápido extra de tomadas.', essential: true },
  { id: 'fita-crepe', name: 'Fita crepe e caneta', use: 'Marca no local cada defeito encontrado.', essential: true },
  { id: 'celular', name: 'Celular com câmera', use: 'Fotografa cada defeito para anexar ao laudo.', essential: true },
  { id: 'nivel-laser', name: 'Nível a laser ou prumo de pedreiro', use: 'Confere prumo de paredes e esquadros com mais precisão.', essential: false },
  { id: 'esquadro', name: 'Esquadro grande', use: 'Verifica cantos a 90° em paredes, bancadas e recortes.', essential: false },
  { id: 'regua-2m', name: 'Régua de alumínio de 2 m', use: 'Mede planicidade de paredes e pisos (frestas sob a régua).', essential: false },
  { id: 'detector-tensao', name: 'Detector de tensão sem contato', use: 'Identifica fios energizados sem abrir caixas.', essential: false },
  { id: 'papel-toalha', name: 'Papel toalha', use: 'Detecta gotejamentos e vazamentos sob pias, registros e sifões.', essential: false },
  { id: 'escada', name: 'Escada pequena', use: 'Alcança teto, pontos de luz e parte alta de janelas.', essential: false },
];

// ---------- Checklist de vistoria ----------

const it = (id, what, how, tools, source = 'construtora') => ({ id, what, how, source, tools });

const PISO_SECO = 'Piso laminado: pise em toda a área procurando estalos ou partes soltas; confira emendas abertas, riscos, manchas e o acabamento junto às paredes.';
const PISO_CERAMICO = 'Bata com o martelo de borracha em cada peça (som oco = peça solta). Confira trincas, lascas, rejunte falhado e nível.';
const PAREDE = 'Com a lanterna rente à parede, procure ondulações, fissuras, manchas, umidade e falhas de pintura. Confira prumo e cantos.';
const TETO = 'Procure fissuras, manchas de umidade, ondulações e falhas de pintura no gesso.';
const PORTA = 'Abra e feche várias vezes: não pode raspar nem bater sozinha. Teste fechadura e chave; confira folgas, batente, guarnições e pintura.';
const JANELA = 'Corra as folhas até o fim e trave. Confira borrachas, vidros sem riscos/trincas e fixação. Jogue água por fora (se possível) e veja se entra.';
const TOMADAS = 'Teste todas as tomadas com o testador (tensão e aterramento) e cada ponto de luz e interruptor com a lâmpada de teste.';

function comodo(prefix, extra = []) {
  return [
    it(`${prefix}-piso`, 'Piso e rodapé', PISO_SECO, ['lanterna', 'nivel-bolha']),
    it(`${prefix}-paredes`, 'Paredes', PAREDE, ['lanterna', 'nivel-bolha', 'regua-2m']),
    it(`${prefix}-teto`, 'Teto', TETO, ['lanterna', 'escada']),
    it(`${prefix}-porta`, 'Porta, fechadura e batente', PORTA, ['nivel-bolha']),
    it(`${prefix}-janela`, 'Janela, vidro e peitoril', JANELA, ['balde']),
    it(`${prefix}-eletrica`, 'Tomadas, interruptores e pontos de luz', TOMADAS, ['testador-tomada', 'lampada-teste']),
    ...extra,
  ];
}

function banheiro(prefix, bancadaDesc) {
  return [
    it(`${prefix}-piso`, 'Piso cerâmico e caimento para o ralo', `${PISO_CERAMICO} Jogue água: deve escorrer toda para o ralo, sem poças.`, ['martelo-borracha', 'balde', 'nivel-bolha']),
    it(`${prefix}-revestimento`, 'Revestimento cerâmico das paredes', 'Bata nas peças (som oco), confira alinhamento, recortes em torno de registros e tomadas, e rejunte.', ['martelo-borracha', 'lanterna']),
    it(`${prefix}-teto`, 'Teto (gesso)', TETO, ['lanterna', 'escada']),
    it(`${prefix}-porta`, 'Porta e fechadura tipo tranqueta', PORTA, ['nivel-bolha']),
    it(`${prefix}-soleira`, 'Soleira da porta (Branco Pitaya)', 'Confira nível, cor, lascas e acabamento com o piso; a soleira deve segurar a água do banheiro.', ['nivel-bolha', 'balde'], 'dkza'),
    it(`${prefix}-janela`, 'Janela/basculante e vidro', JANELA, []),
    it(`${prefix}-bacia`, 'Bacia com caixa acoplada', 'Dê descarga várias vezes: enche e para sem ficar correndo água. Confira fixação no piso e vedação.', ['papel-toalha']),
    it(`${prefix}-cuba`, 'Cuba, torneira e sifão', 'Abra a torneira por 1 minuto e passe papel toalha embaixo da cuba e no sifão para achar vazamento.', ['papel-toalha']),
    it(`${prefix}-registros`, 'Registros e chuveiro (ponto)', 'Abra e feche cada registro; confira vazão e se não pinga.', ['papel-toalha']),
    it(`${prefix}-bancada`, bancadaDesc, 'Confira nível, medidas, frontão de 15 cm, cor (Branco Pitaya), lascas, silicone de vedação e fixação.', ['nivel-bolha', 'trena'], 'dkza'),
    it(`${prefix}-box`, 'Box de vidro temperado (correr, ferragem preta)', 'Corra a porta até o fim: não pode travar nem sair do trilho. Confira riscos no vidro e vedação de silicone.', [], 'dkza'),
    it(`${prefix}-divisoria`, 'Divisória de box em pedra', 'Confira nível, fixação, rejunte e se a água do box não passa para fora.', ['nivel-bolha', 'balde'], 'dkza'),
    it(`${prefix}-aquecedor`, 'Ponto de aquecedor a gás do chuveiro', 'Confira que existem os pontos de gás, água quente/fria e elétrica para o aquecedor, sem vazamento.', ['papel-toalha'], 'dkza'),
    it(`${prefix}-eletrica`, 'Tomadas e pontos de luz', TOMADAS, ['testador-tomada', 'lampada-teste']),
  ];
}

export const CHECKLIST = [
  {
    id: 'documentos', room: 'Documentos a receber', items: [
      it('d-chaves', 'Chaves e controles (todas as cópias)', 'Conte as cópias, teste cada chave na porta de entrada e cada controle/tag de acesso que for entregue.', []),
      it('d-habitese', 'Certidão do Habite-se', 'Receba o documento e confira se cita o empreendimento e a unidade corretos.', []),
      it('d-manual', 'Manual do Proprietário (construtora)', 'Confira prazos de garantia por sistema e o plano de manutenção.', []),
      it('d-manual-dkza', 'Manual de Uso e Operação da DKZA', 'Deve listar os serviços executados e os prazos de garantia de cada um.', [], 'dkza'),
      it('d-iptu', 'Carnê do IPTU', 'Receba se já emitido pela prefeitura.', []),
      it('d-parede', 'As-built/ART da parede removida da cozinha', 'Documento técnico assinado mostrando que a parede removida não é estrutural.', [], 'dkza'),
    ],
  },
  {
    id: 'instalacoes', room: 'Instalações gerais', items: [
      it('i-quadro', 'Quadro de disjuntores', 'Cada disjuntor identificado com o circuito; desligue um a um e veja o que apaga. Se houver DR (diferencial) ou DPS, aperte o botão de teste do DR: ele deve desarmar. Tampa firme, sem fios expostos.', ['testador-tomada', 'lanterna']),
      it('i-campainha', 'Campainha e interfone (se houver)', 'Toque a campainha e teste o interfone com a portaria: som, chamada e abertura.', []),
      it('i-tomadas', 'Todas as tomadas', 'Teste tensão e aterramento em cada tomada da casa e anote as que falharem.', ['testador-tomada', 'carregador-usb']),
      it('i-220', 'Tomada 220 V da bancada (cooktop)', 'Confirme 220 V no testador e que o disjuntor é exclusivo para ela.', ['testador-tomada'], 'dkza'),
      it('i-luz', 'Pontos de luz e interruptores', 'Coloque a lâmpada de teste em cada ponto e acione o interruptor correspondente.', ['lampada-teste', 'escada']),
      it('i-agua', 'Pressão e vazão de água', 'Abra todas as torneiras e registros ao mesmo tempo e veja se a vazão se mantém.', []),
      it('i-registro-geral', 'Registro geral do apartamento', 'Localize, feche e confirme que corta a água de todos os pontos.', []),
      it('i-vazamentos', 'Vazamentos e umidade', 'Procure manchas de umidade em paredes vizinhas a banheiros e cozinha e no teto.', ['lanterna', 'papel-toalha']),
      it('i-gas', 'Ponto de gás do fogão', 'Confira a presença do ponto, registro e se não há cheiro de gás.', []),
      it('i-gas-kit', 'Kit de medição de gás', 'Confira medidor instalado e lacrado, com registro de corte.', [], 'dkza'),
      it('i-ralos', 'Ralos', 'Jogue água em cada ralo: deve escoar rápido, sem retorno de cheiro.', ['balde']),
    ],
  },
  { id: 'sala', room: 'Sala', items: comodo('sala', [it('sala-soleira', 'Soleira da porta de entrada', 'Confira nível, lascas, cor (quartzito Branco Estrelar) e acabamento com o piso.', ['nivel-bolha'], 'dkza')]) },
  { id: 'quarto', room: 'Quarto', items: comodo('quarto') },
  { id: 'suite', room: 'Suíte', items: comodo('suite') },
  {
    id: 'circulacao', room: 'Circulação', items: [
      it('circ-piso', 'Piso e rodapé', PISO_SECO, ['lanterna']),
      it('circ-paredes', 'Paredes e teto', `${PAREDE} ${TETO}`, ['lanterna', 'nivel-bolha']),
      it('circ-eletrica', 'Pontos de luz e interruptores', TOMADAS, ['lampada-teste', 'testador-tomada']),
    ],
  },
  { id: 'banheiro-social', room: 'Banheiro social', items: banheiro('bs', 'Bancada com extensão sobre o vaso (até 1,45 m)') },
  { id: 'banheiro-suite', room: 'Banheiro suíte', items: banheiro('bst', 'Bancada simples (até 1,20 m)') },
  {
    id: 'cozinha', room: 'Cozinha e área de serviço', items: [
      it('coz-piso', 'Piso cerâmico', PISO_CERAMICO, ['martelo-borracha', 'nivel-bolha']),
      it('coz-revestimento', 'Revestimento cerâmico das paredes', 'Bata nas peças (som oco), confira alinhamento, recortes e rejunte.', ['martelo-borracha']),
      it('coz-teto', 'Teto (gesso)', TETO, ['lanterna', 'escada']),
      it('coz-parede-removida', 'Área da parede removida (conceito aberto)', 'Confira acabamento de piso, teto e paredes onde a parede existia: sem emendas aparentes, trincas ou desnível.', ['lanterna', 'nivel-bolha'], 'dkza'),
      it('coz-bancada', 'Bancada em quartzito até o tanque (até 3,20 m)', 'Confira medida, nível, cor (Branco Estrelar), emendas, lascas e silicone junto à parede e à cuba.', ['trena', 'nivel-bolha'], 'dkza'),
      it('coz-peitoril', 'Peitoril da janela em quartzito', 'Confira nível, caimento para fora, lascas e vedação.', ['nivel-bolha'], 'dkza'),
      it('coz-cuba', 'Cuba inox, torneira e sifão', 'Abra a torneira por 1 minuto e passe papel toalha embaixo da cuba e no sifão.', ['papel-toalha']),
      it('coz-tanque', 'Tanque e ponto de máquina de lavar', 'Encha o tanque, solte a água e veja vazamentos. Confira ponto de água e esgoto da máquina.', ['papel-toalha', 'balde']),
      it('coz-janela', 'Janela e vidro', JANELA, []),
      it('coz-eletrica', 'Tomadas e pontos de luz', TOMADAS, ['testador-tomada', 'lampada-teste']),
    ],
  },
  {
    id: 'varanda', room: 'Varanda', items: [
      it('var-piso', 'Piso cerâmico e caimento', `${PISO_CERAMICO} Jogue água: deve escorrer para o ralo, sem poças.`, ['martelo-borracha', 'balde']),
      it('var-paredes', 'Paredes com textura e rodapé', PAREDE, ['lanterna']),
      it('var-teto', 'Teto (gesso)', TETO, ['lanterna']),
      it('var-porta', 'Porta de correr da varanda', JANELA, ['balde']),
      it('var-pontos', 'Pontos de água e esgoto', 'Abra a água e confira o escoamento do esgoto, sem vazamento.', ['balde', 'papel-toalha'], 'dkza'),
      it('var-eletrica', 'Tomadas e pontos de luz', TOMADAS, ['testador-tomada', 'lampada-teste']),
    ],
  },
  {
    id: 'garden', room: 'Garden', items: [
      it('gar-muros', 'Muros de divisa (vizinhos e estacionamento)', 'Confira prumo, acabamento, trincas e altura dos 3 muros.', ['nivel-bolha', 'trena', 'nivel-laser'], 'dkza'),
      it('gar-piso', 'Contrapiso e porcelanato', `${PISO_CERAMICO} Jogue bastante água: deve escoar sem empoçar e sem correr para dentro do apartamento.`, ['martelo-borracha', 'balde', 'nivel-bolha'], 'dkza'),
      it('gar-drenagem', 'Drenagem e ralos do garden', 'Confira ralos/drenos e escoamento após jogar água em vários pontos.', ['balde'], 'dkza'),
      it('gar-torneira', 'Torneira no muro', 'Abra e feche; sem vazamento na parede.', ['papel-toalha'], 'dkza'),
      it('gar-tomada', 'Tomada externa', 'Confira tensão e se é protegida contra chuva (tampa).', ['testador-tomada'], 'dkza'),
      it('gar-paredes', 'Paredes externas com textura', PAREDE, ['lanterna']),
    ],
  },
];

export const ALL_CHECK_ITEMS = CHECKLIST.flatMap(r => r.items.map(i => ({ ...i, roomId: r.id, room: r.room })));
