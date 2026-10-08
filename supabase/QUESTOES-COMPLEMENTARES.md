# Questões Complementares

Os novos desafios ativos cadastrados em **Professor → Desafios** aparecem em
**Aluno → Questões Complementares**. As questões originais do laboratório e do
treinamento continuam em suas áreas.

Cada questão concede o XP configurado pelo professor e recupera 1 coração no
primeiro acerto, até o limite de 5. O aluno pode responder com zero corações;
erros não removem corações. Respostas repetidas não concedem novas recompensas.

## Atualizar um banco existente

Execute `supabase/complementary-questions.sql` no SQL Editor do seu projeto Supabase.
O script usa as tabelas existentes e pode ser executado novamente. A função de
recompensas só pode ser chamada pela chave administrativa do servidor.

Para um banco novo, a função já está incluída em `supabase/schema.sql`.
Execute `schema.sql` e depois `seed.sql`, conforme o README.

O aplicativo precisa das variáveis de ambiente descritas em `.env.example`,
inclusive `SUPABASE_SERVICE_ROLE_KEY` no servidor. Sem Supabase, o modo demo
mostra os desafios criados neste navegador; a validação dos novos desafios e
a persistência das recompensas requerem o banco configurado.
