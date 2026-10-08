# Modo história com problemas do ENEM

As seis salas usam adaptações de provas oficiais do Inep. Os contextos foram
reescritos para o laboratório e as respostas são numéricas. A referência à prova
fica visível em cada desafio. O protocolo final continua sendo um quebra-cabeça
da história, construído a partir das evidências.

| Sala | Origem | Raciocínio |
| --- | --- | --- |
| Controle | [ENEM 2023, Laranja NVDA, 166](https://download.inep.gov.br/enem/provas_e_gabaritos/2023_Dia_2_P1_MT_Caderno_11_Laranja_NVDA.pdf) | Volume, m³ para litros e consumo por pessoa por dia |
| Depósito | [ENEM 2022, Amarelo, 167](https://download.inep.gov.br/enem/provas_e_gabaritos/2022_PV_impresso_D2_CD5.pdf) | Comparar cinco tanques pela área do fundo e das paredes |
| Isolamento | [ENEM 2024, Azul, 175](https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_impresso_D2_CD7.pdf) | Obter raios a partir das circunferências e comparar capacidades |
| Testes | [ENEM 2023, Amarelo, 164](https://download.inep.gov.br/enem/provas_e_gabaritos/2023_PV_impresso_D2_CD5.pdf) | Semelhança, subtração de volumes e densidade |
| Observação | [ENEM 2022, Rosa, 180](https://download.inep.gov.br/enem/provas_e_gabaritos/2022_PV_impresso_D2_CD8.pdf) | Relacionar escala linear, volume e quantidade de material |
| Subterrâneo | [ENEM 2022, Cinza ampliado, 145](https://download.inep.gov.br/enem/provas_e_gabaritos/2022_PV_impresso_D2_CD6_ampliada.pdf) | Conservação de volume e conversão de diâmetro para raio |

A chapa da sala de isolamento foi alterada para 12 × 24 cm, com π = 3, para
produzir uma resposta exata. A questão de revestimento pede a área mínima,
enquanto a original pede identificar o projeto. Os demais problemas mantêm os
dados essenciais das questões citadas.

As fórmulas e os passos de resolução ficam em **Ver pista**. O treinamento
continua com exercícios básicos para recuperar vidas.

## Banco existente

Execute `supabase/enem-story.sql` no SQL Editor do projeto. O script é uma
transação e altera somente as questões originais, as narrativas e as marcações
das evidências. Não apaga alunos, XP, tentativas ou progresso, nem altera as
questões complementares cadastradas pelo professor.

Para um banco novo, `supabase/seed.sql` já contém os novos enunciados e gabaritos.
Depois de editar os dados da história, `node scripts/sync-enem-story.cjs`
sincroniza o seed e o script de atualização.

Os registros numéricos aceitos são exibidos sem unidades nem zeros finais
desnecessários. O protocolo final no Supabase usa os valores já validados para
cada aluno, permitindo concluir dossiês iniciados antes desta atualização.

## Conferência

Execute `npm test` e `npm run typecheck`. Os testes recalculam as respostas a
partir dos dados públicos, verificam os gabaritos, o SQL de atualização, as
unidades, as evidências e o desbloqueio das salas até o fechamento do portal.
