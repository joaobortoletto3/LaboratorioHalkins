-- =====================================================================
-- LABORATÓRIO HAWKINS — SEED INICIAL
-- Execute APÓS schema.sql. Pode ser executado novamente (upsert).
-- =====================================================================

insert into public.laboratories (id, name, subtitle, description) values
('hnl', 'Laboratório Hawkins', 'ARQUIVO 011 — INCIDENTE DIMENSIONAL', 'Hawkins National Laboratory — Department of Energy')
on conflict (id) do update set name = excluded.name;

insert into public.rooms (id, laboratory_id, name, description, story, order_index, difficulty, sector, status) values
('sala-01','hnl','Sala de Controle','O coração elétrico do laboratório. Um único terminal ainda responde.','A energia do setor principal foi desligada. Um terminal continua funcionando utilizando energia de emergência. O reservatório cilíndrico mantém os agentes vivos, mas a missão ainda vai durar dez dias. O terminal exige um plano de racionamento antes de liberar o reator.',1,'intermediario','SETOR A','ativo'),
('sala-02','hnl','Depósito Experimental','Caixas de transporte lacradas. Uma delas pulsa com uma substância escura.','Uma caixa utilizada para transportar equipamentos apresenta sinais de contaminação. Dentro dela estão cinco projetos de um tanque aberto de descontaminação. Todos guardam a mesma quantidade de solução, mas a equipe tem pouco revestimento de proteção. Compare os projetos e informe a menor área necessária para proteger o fundo e as quatro paredes internas.',2,'intermediario','SETOR B','ativo'),
('sala-03','hnl','Tanque de Isolamento','Água salgada, escuridão total e um recipiente que guarda mais do que líquido.','A sala está gelada. Uma luz azul fraca reflete no recipiente de isolamento. O monitor ainda mostra: SUBJECT CONNECTION: LOST. A equipe precisa fabricar um reservatório cilíndrico a partir de uma chapa retangular. A mesma chapa pode ser enrolada de duas maneiras; o desperdício de capacidade pode custar a conexão com a cobaia.',3,'dificil','SETOR C','ativo'),
('sala-04','hnl','Câmara de Testes','Uma máquina geométrica ainda vibra. Ninguém sabe o que ela amplifica.','No centro da câmara existe um núcleo de contenção fabricado a partir de um cone maciço. O topo foi cortado paralelamente à base e uma passagem cilíndrica atravessa a peça pelo eixo central. O sensor da balança exige a massa que sobrou após os dois cortes. A densidade do material está no relatório técnico.',4,'dificil','SETOR D','ativo'),
('sala-05','hnl','Sala de Observação','Um observatório dimensional apontado para baixo. Para o subsolo.','Através do vidro, sensores esféricos flutuam presos por cabos. A nova rede usa sensores com o dobro do diâmetro anterior. A fábrica precisa saber quantas cargas de material serão necessárias para produzir o novo lote.',5,'dificil','SETOR E','ativo'),
('sala-06','hnl','Setor Subterrâneo','As paredes estão vivas. Raízes escuras atravessam o concreto.','O ar fica pesado. Partículas flutuam como cinzas. Raízes atravessam as paredes. O mecanismo do portal está sem rolamentos. Uma peça cilíndrica maciça do reator pode ser fundida para fabricar as pequenas esferas de reposição. “Nada pode se perder na fundição. O volume do metal antes e depois precisa ser o mesmo.” Determine quantos rolamentos podem ser produzidos e recupere o crachá preso nas raízes.',6,'dificil','SETOR SUBTERRÂNEO','ativo'),
('portal','hnl','Portal Dimensional','A ruptura. A passagem que nunca deveria ter sido aberta.','Uma rachadura vermelha se abre na parede de concreto. Entre as raízes, um último documento do cientista desaparecido.',7,'dificil','PORTAL','ativo'),
('treinamento','hnl','Protocolo de Treinamento','Simulações de revisão.','Recupere tentativas.',99,'facil','TREINAMENTO','ativo')
on conflict (id) do update set name=excluded.name, story=excluded.story, description=excluded.description, difficulty=excluded.difficulty, order_index=excluded.order_index;

insert into public.evidences (id, room_id, code, title, subtitle, description, content, stamp, tag, rare) values
('ev-001','sala-01','EVIDÊNCIA 001','CARTÃO HNL-07','CLASSIFIED','Cartão de acesso magnético encontrado preso ao terminal da Sala de Controle.','Cartão de nível 07 pertencente ao Dr. M. Ellison. No verso: “Registre a economia diária por agente. Essa reserva é a primeira chave.”','CLASSIFIED','RESERVA',false),
('ev-002','sala-02','EVIDÊNCIA 002','MANIFESTO DE CARGA B-0447','RECOVERED FROM SECTOR B','Documento lacrado dentro da caixa contaminada do Depósito Experimental.','“Registre a menor área de revestimento interno. Proteja o fundo e as paredes; a abertura superior deve permanecer livre.”','CONFIDENTIAL','REVESTIMENTO',false),
('ev-003','sala-03','EVIDÊNCIA 003','FITA DE ÁUDIO #3','RECOVERED FROM ISOLATION TANK','Fita cassete com a etiqueta derretida. A gravação está parcialmente corrompida.','[CHIADO] “...a cobaia diz ouvir alguém do outro lado... ela descreveu um corredor igual ao nosso, mas escuro... coberto de raízes...” [FIM DA GRAVAÇÃO]','RESTRICTED ACCESS',null,true),
('ev-004','sala-04','EVIDÊNCIA 004','RELATÓRIO DE TESTE','EXPERIMENT 011','Relatório técnico ejetado pela máquina da Câmara de Testes.','“Registre a massa restante do núcleo, em gramas. Às 03:11 a leitura dimensional ultrapassou o limite. Recomendo encerrar o Experimento 011.”','TOP SECRET','EXPERIMENTO',false),
('ev-005','sala-05','EVIDÊNCIA 005','COORDENADAS DIMENSIONAIS','OBSERVATION DECK LOG','Impressão contínua do sensor esférico, com coordenadas apontando para o subsolo.','LAT 39.9°N  //  PROF. −40m  //  ORIGEM DO SINAL: SUB-NÍVEL 3. “Não é um eco. Algo responde.”','CLASSIFIED',null,false),
('ev-006','sala-06','EVIDÊNCIA 006','CRACHÁ DO CIENTISTA','IDENTIFICATION: 7B','Crachá chamuscado preso nas raízes do Setor Subterrâneo.','DR. MARCUS ELLISON — PESQUISADOR CHEFE — IDENTIFICAÇÃO: 7B. “Se ele está aqui, eu estou do outro lado.”','RESTRICTED ACCESS','IDENTIFICAÇÃO',true),
('ev-007','portal','EVIDÊNCIA 007','ÚLTIMA TRANSMISSÃO','SOURCE: UNKNOWN','Sinal de rádio captado no instante em que o portal se fechou.','“Se você encontrou isso, o experimento não acabou. Apenas conseguimos fechar o primeiro portal.” — M.E.','TOP SECRET',null,true)
on conflict (id) do update set title=excluded.title, content=excluded.content, tag=excluded.tag;

insert into public.challenges (id, room_id, title, story, question, content, type, difficulty, xp_reward, hint, correct_answer, tolerance, evidence_id, next_room_id, order_index, active) values
('c-01','sala-01','Racionamento do Reator','A reserva deve sustentar 75 agentes durante os próximos 10 dias.','Restam 1,5 m de água em um reservatório cilíndrico de raio 5 m. Cada um dos 75 agentes consome normalmente 200 litros por dia. Sem novo abastecimento e sem perdas, qual é a economia mínima, em litros por agente por dia, para a reserva durar 10 dias? Use π = 3.','Volume, conversão de unidades e consumo diário. Informe apenas a economia por agente.','numeric','intermediario',20,'Calcule πr²h e converta de m³ para litros (1 m³ = 1.000 L). Divida pelos agentes e pelos dias para obter o consumo permitido. Subtraia esse consumo dos 200 L habituais.','50',0,'ev-001','sala-02',1,true),
('c-02','sala-02','Revestimento de Descontaminação','Os cinco tanques são abertos e comportam 90.000 litros cada. Somente o fundo e as paredes internas receberão proteção.','Compare os cinco projetos abaixo. Qual é a menor área de revestimento, em m², necessária para o fundo e as quatro paredes de um tanque? Desconsidere espessuras e perdas. As medidas estão na ordem profundidade × largura × comprimento.','Compare os projetos pela área interna. A abertura superior não recebe revestimento.','numeric','intermediario',20,'Para cada projeto, use A = largura·comprimento + 2·profundidade·(largura + comprimento). O volume ser igual não significa que a área também seja igual.','101',0,'ev-002','sala-03',2,true),
('c-03','sala-03','Dois Moldes, Uma Chapa','Uma chapa retangular forma somente a parede lateral do reservatório. As bases circulares são fabricadas separadamente.','Uma chapa de 12 cm por 24 cm pode ser enrolada de duas maneiras: altura 24 cm e circunferência 12 cm, ou altura 12 cm e circunferência 24 cm. Sem sobreposição nem perdas, qual é a maior capacidade, em cm³, entre os dois cilindros fechados? Use π = 3.','O lado que envolve a base é uma circunferência, não um diâmetro.','numeric','dificil',30,'Em cada orientação, obtenha o raio com C = 2πr e calcule V = πr²h. Compare os volumes antes de escolher.','576',0,'ev-003','sala-04',3,true),
('c-04','sala-04','Massa do Núcleo Perfurado','O corte do topo é paralelo à base. O furo cilíndrico atravessa todo o tronco e tem o mesmo eixo do cone original.','Um cone maciço tem altura 36 cm e base de diâmetro 18 cm. Retira-se seu topo, um cone menor de diâmetro 6 cm, e perfura-se o tronco restante com um cilindro de diâmetro 6 cm. O material tem densidade 0,6 g/cm³. Qual é a massa restante, em gramas? Use π = 3 e determine a altura do corte por semelhança.','Semelhança de cones, subtração de volumes e relação entre massa e densidade.','numeric','dificil',30,'A razão entre as alturas dos cones é igual à razão entre seus raios. Subtraia do cone original o cone menor e o cilindro cujo comprimento é a altura do tronco. Multiplique o volume que sobrar pela densidade.','1296',0,'ev-004','sala-05',4,true),
('c-05','sala-05','Ampliação da Rede de Sensores','Cada carga de material produz 50 sensores esféricos maciços de diâmetro 2 cm.','A nova rede precisa de 150 sensores maciços de diâmetro 4 cm, feitos do mesmo material. Sem perdas de fabricação, quantas cargas completas de material são necessárias?','Alterar o diâmetro muda o volume e o rendimento de cada carga.','numeric','dificil',30,'O volume varia com o cubo do raio. Compare os dois diâmetros, eleve a razão ao cubo e considere também que o número de sensores mudou.','24',0,'ev-005','sala-06',5,true),
('c-06','sala-06','Rolamentos de Contenção','Uma peça cilíndrica maciça será completamente fundida em pequenas esferas do mesmo material.','Uma peça de raio 4 cm e altura 50 cm será transformada em esferas maciças de diâmetro 1 cm. Admitindo conservação do volume e nenhuma perda de material, quantos rolamentos esféricos podem ser fabricados?','A quantidade produzida depende da relação entre os volumes dos dois sólidos.','numeric','dificil',30,'Divida V cilindro = πr²h por V esfera = (4/3)πr³. O raio da esfera é metade do diâmetro. O fator π se cancela.','4800',0,'ev-006','portal',6,true),
('f-011','portal','Protocolo 011','Reserva. Revestimento. Experimento. Identificação.','Qual é a sequência final que fecha o portal?','Cada palavra corresponde a um registro marcado nas suas evidências.','code','dificil',100,'Procure os carimbos nas evidências e concatene seus registros na ordem do documento, sem unidades nem zeros decimais extras. Separe os registros com hífens, se preferir.','5010112967B',0,'ev-007',null,7,true),
('t-01','treinamento','Simulação: Cubo de Contenção','Um cubo de chumbo usado para guardar amostras.','Qual é o volume de um cubo de aresta 4 cm?','V = a³','numeric','facil',5,'Multiplique a aresta por ela mesma três vezes.','64',0,null,null,90,true),
('t-02','treinamento','Simulação: Cone de Ventilação','Um duto cônico do sistema de ventilação.','Qual é o volume de um cone com raio 3 m e altura 5 m (π = 3)?','V = (π · r² · h) / 3','numeric','facil',5,'O cone ocupa um terço do cilindro de mesma base e altura.','45',0,null,null,91,true),
('t-03','treinamento','Simulação: Antena Piramidal','Uma antena com formato de pirâmide de base quadrada.','Qual é o volume de uma pirâmide de base quadrada com aresta 6 cm e altura 5 cm?','V = (Ab · h) / 3','numeric','facil',5,'Calcule a área da base quadrada primeiro.','60',0,null,null,92,true)
on conflict (id) do update set title=excluded.title, story=excluded.story, question=excluded.question, content=excluded.content, type=excluded.type, difficulty=excluded.difficulty, xp_reward=excluded.xp_reward, hint=excluded.hint, correct_answer=excluded.correct_answer, tolerance=excluded.tolerance, evidence_id=excluded.evidence_id, next_room_id=excluded.next_room_id;

insert into public.achievements (id, title, description, icon) values
('primeiro-contato','PRIMEIRO CONTATO','Complete o primeiro desafio.','radio'),
('agente-hawkins','AGENTE HAWKINS','Complete três setores.','shield'),
('sem-medo','SEM MEDO','Complete um desafio difícil.','zap'),
('precisao-absoluta','PRECISÃO ABSOLUTA','Conclua setor sem erros.','target'),
('do-outro-lado','DO OUTRO LADO','Acesse o setor dimensional.','eye'),
('portal-fechado','PORTAL FECHADO','Conclua o caso.','lock'),
('em-chamas','EM CHAMAS','Mantenha 7 dias de ofensiva.','flame')
on conflict (id) do nothing;

insert into public.library_entries (id, name, formula, explanation, example) values
('cubo','CUBO','V = a³ | A = 6a²','6 faces quadradas congruentes.','a = 2 → V = 8'),
('paralelepipedo','PARALELEPÍPEDO','V = abc | A = 2(ab+ac+bc)','6 faces retangulares.','5×2×3 → V = 30'),
('prisma','PRISMA','V = Ab·h','Duas bases poligonais paralelas.','Ab = 10, h = 4 → V = 40'),
('cilindro','CILINDRO','V = πr²h','Bases circulares paralelas.','r = 2, h = 5, π = 3 → 60'),
('cone','CONE','V = πr²h/3','Base circular e vértice.','r = 2, h = 6, π = 3 → 24'),
('piramide','PIRÂMIDE','V = Ab·h/3','Base poligonal e vértice.','base 3, h = 4 → 12'),
('esfera','ESFERA','V = 4/3·πr³','Pontos equidistantes do centro.','r = 2, π = 3 → 32')
on conflict (id) do nothing;

insert into public.settings (key, value) values
('class_name','Turma Hawkins 011'),
('initial_lives','5'),
('pi_value','3'),
('show_hints','true'),
('effects_intensity','normal')
on conflict (key) do nothing;

-- Para promover um usuário a PROFESSOR (após ele se cadastrar):
-- update public.profiles set role = 'professor' where email = 'professor@suaescola.com';
