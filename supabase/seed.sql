-- =====================================================================
-- LABORATÓRIO HAWKINS — SEED INICIAL
-- Execute APÓS schema.sql. Pode ser executado novamente (upsert).
-- =====================================================================

insert into public.laboratories (id, name, subtitle, description) values
('hnl', 'Laboratório Hawkins', 'ARQUIVO 011 — INCIDENTE DIMENSIONAL', 'Hawkins National Laboratory — Department of Energy')
on conflict (id) do update set name = excluded.name;

insert into public.rooms (id, laboratory_id, name, description, story, order_index, difficulty, sector, status) values
('sala-01','hnl','Sala de Controle','O coração elétrico do laboratório.','A energia do setor principal foi desligada. Um terminal continua funcionando com energia de emergência.',1,'intermediario','SETOR A','ativo'),
('sala-02','hnl','Depósito Experimental','Caixas de transporte lacradas.','Uma caixa utilizada para transportar equipamentos apresenta sinais de contaminação.',2,'intermediario','SETOR B','ativo'),
('sala-03','hnl','Tanque de Isolamento','Privação sensorial.','SUBJECT CONNECTION: LOST.',3,'dificil','SETOR C','ativo'),
('sala-04','hnl','Câmara de Testes','Máquina experimental.','Uma máquina experimental possui partes geométricas.',4,'dificil','SETOR D','ativo'),
('sala-05','hnl','Sala de Observação','Sensor esférico.','Um observatório dimensional apontado para o subsolo.',5,'intermediario','SETOR E','ativo'),
('sala-06','hnl','Setor Subterrâneo','As paredes estão vivas.','Raízes atravessam o concreto.',6,'dificil','SETOR SUBTERRÂNEO','ativo'),
('portal','hnl','Portal Dimensional','A ruptura.','UNKNOWN DIMENSIONAL SIGNAL.',7,'dificil','PORTAL','ativo'),
('treinamento','hnl','Protocolo de Treinamento','Simulações de revisão.','Recupere tentativas.',99,'facil','TREINAMENTO','ativo')
on conflict (id) do update set name = excluded.name, order_index = excluded.order_index;

insert into public.evidences (id, room_id, code, title, subtitle, description, content, stamp, tag, rare) values
('ev-001','sala-01','EVIDÊNCIA 001','CARTÃO HNL-07','CLASSIFIED','Cartão de acesso magnético.','A capacidade do reator é a primeira chave.','CLASSIFIED','VOLUME',false),
('ev-002','sala-02','EVIDÊNCIA 002','MANIFESTO DE CARGA B-0447','RECOVERED FROM SECTOR B','Documento da caixa contaminada.','Toda a superfície da caixa foi tratada.','CONFIDENTIAL','SUPERFÍCIE',false),
('ev-003','sala-03','EVIDÊNCIA 003','FITA DE ÁUDIO #3','RECOVERED FROM ISOLATION TANK','Fita cassete corrompida.','...a cobaia diz ouvir alguém do outro lado...','RESTRICTED ACCESS',null,true),
('ev-004','sala-04','EVIDÊNCIA 004','RELATÓRIO DE TESTE','EXPERIMENT 011','Relatório técnico.','Recomendo o encerramento imediato do Experimento 011.','TOP SECRET','EXPERIMENTO',false),
('ev-005','sala-05','EVIDÊNCIA 005','COORDENADAS DIMENSIONAIS','OBSERVATION DECK LOG','Coordenadas do sinal.','ORIGEM DO SINAL: SUB-NÍVEL 3.','CLASSIFIED',null,false),
('ev-006','sala-06','EVIDÊNCIA 006','CRACHÁ DO CIENTISTA','IDENTIFICATION: 7B','Crachá chamuscado.','DR. MARCUS ELLISON — IDENTIFICAÇÃO: 7B.','RESTRICTED ACCESS','IDENTIFICAÇÃO',true),
('ev-007','portal','EVIDÊNCIA 007','ÚLTIMA TRANSMISSÃO','SOURCE: UNKNOWN','Sinal de rádio final.','Apenas conseguimos fechar o primeiro portal.','TOP SECRET',null,true)
on conflict (id) do update set title = excluded.title;

insert into public.challenges (id, room_id, title, story, question, content, type, difficulty, xp_reward, hint, correct_answer, tolerance, evidence_id, next_room_id, order_index, active) values
('c-01','sala-01','Capacidade do Reator','Tanque cilíndrico: r = 4 cm, h = 10 cm, π = 3.','Qual é o volume do tanque?','Volume do cilindro','numeric','intermediario',20,'Eleve o raio ao quadrado, multiplique por π e pela altura.','480',0,'ev-001','sala-02',1,true),
('c-02','sala-02','Calibração do Lacre','Caixa 8 × 8 × 7 cm.','Qual é a área total externa da caixa?','Área total do paralelepípedo','numeric','intermediario',20,'São 3 pares de faces iguais.','352',0,'ev-002','sala-03',2,true),
('c-03','sala-03','Volume de Solução Salina','Cilindro r = 3 m, h = 6 m + semiesfera r = 3 m, π = 3.','Qual é o volume total do recipiente?','Sólidos compostos','numeric','dificil',30,'Some o cilindro e metade de uma esfera.','216',0,'ev-003','sala-04',3,true),
('c-04','sala-04','Volume da Máquina Experimental','Prisma base 6×6, h = 5 + pirâmide mesma base, h = 4.','Qual é o volume total da máquina?','Prisma e pirâmide','numeric','dificil',30,'A pirâmide é 1/3 do prisma de mesma base e altura.','228',0,'ev-004','sala-05',4,true),
('c-05','sala-05','Volume do Sensor Esférico','Esfera r = 3 cm, π = 3.','Qual é o volume do sensor?','Volume da esfera','numeric','intermediario',20,'Eleve o raio ao cubo.','108',0,'ev-005','sala-06',5,true),
('c-06','sala-06','Energia de Contenção','E = reator − tanque + sensor.','Qual é a energia de estabilização?','Combinação de resultados','numeric','dificil',30,'Consulte suas evidências.','372',0,'ev-006','portal',6,true),
('f-011','portal','Protocolo 011','Volume. Superfície. Experimento. Identificação.','Qual é a sequência final?','Desafio final','code','dificil',100,'Use os carimbos das evidências.','4803522287B',0,'ev-007',null,7,true),
('t-01','treinamento','Simulação: Cubo de Contenção','Cubo de aresta 4 cm.','Volume do cubo?','Cubo','numeric','facil',5,'a³','64',0,null,null,90,true),
('t-02','treinamento','Simulação: Cone de Ventilação','Cone r = 3 m, h = 5 m, π = 3.','Volume do cone?','Cone','numeric','facil',5,'πr²h/3','45',0,null,null,91,true),
('t-03','treinamento','Simulação: Antena Piramidal','Pirâmide base 6 cm, h = 5 cm.','Volume da pirâmide?','Pirâmide','numeric','facil',5,'Ab·h/3','60',0,null,null,92,true)
on conflict (id) do update set correct_answer = excluded.correct_answer, title = excluded.title;

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
