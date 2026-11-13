# 1. Modelagem da relação entre cargo e matéria

- Status: aceito
- Data: 2026-11-13

## Contexto

Um cargo pode exigir várias matérias, e uma matéria pode fazer parte do edital
de vários cargos. As questões precisam respeitar essa combinação para evitar
questões fora do edital do cargo selecionado.

## Decisão

Modelar a relação como N:N por meio da tabela `cargo_materia`, com chave primária
composta por `(cargo_id, materia_id)`. A tabela `questao` possui uma chave
estrangeira composta para essa relação, garantindo que toda questão pertença a
uma combinação válida de cargo e matéria.

O Repository Pattern mantém essa regra de persistência isolada do service e do
controller.

## Alternativas consideradas

### Colunas múltiplas em `cargo`

Rejeitada porque limita a quantidade de matérias e viola a normalização.

### JSON de matérias em `cargo`

Rejeitada porque dificulta constraints, joins, índices e filtros relacionais.

### Relação N:N sem chave estrangeira composta em `questao`

Rejeitada porque permitiria cadastrar questões fora do edital do cargo.

## Consequências

- O banco impede combinações duplicadas em `cargo_materia`.
- Exclusões de cargo ou matéria podem remover suas relações por cascade.
- A criação de questões exige que cargo e matéria estejam previamente
  relacionados.
- Consultas de simulados podem filtrar cargo e matéria com integridade
  referencial garantida.
