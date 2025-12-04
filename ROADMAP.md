## Roadmap - Gerenciador de Tarefas (Full Stack)

Este arquivo descreve as etapas para implementação do gerenciador de tarefas com **Angular (última versão)** no frontend, **Java 21 + Spring Boot 3** no backend, **PostgreSQL + JPA** para persistência e **JWT** para autenticação.

Numeração de tarefas: **T01, T02, T03, ...** (sequencial e global).

---

### Fase 1 – Preparação do Projeto

- ✅ **T01**: Configurar repositório Git e estrutura base do projeto (pastas `backend/` e `frontend/`).
- ✅ **T02**: Criar e documentar o `README.md` com visão geral, requisitos e instruções básicas.
- ✅ **T03**: Definir `.gitignore`, escolher ferramenta de build do backend (**Maven**) e preparar scripts/instruções iniciais.

---

### Fase 2 – Backend: Setup Básico (Java 21 + Spring Boot 3)

- ✅ **T04**: Criar projeto Spring Boot 3 (Java 21) na pasta `backend/`.
- ✅ **T05**: Configurar dependências principais: Spring Web, Spring Data JPA, PostgreSQL Driver, Spring Security, JWT (jjwt ou similar), validação (Bean Validation), Swagger/OpenAPI.
- ✅ **T06**: Configurar `application.yml` (profiles `dev` e `prod`) e conexão com banco PostgreSQL.
- ✅ **T07**: Criar migrações de banco (Flyway ou Liquibase) para as tabelas de usuários e tarefas.

---

### Fase 3 – Backend: Domínio de Usuários e Autenticação (JWT)

 - ✅ **T08**: Modelar entidade `User` (id, nome, email, senha, roles, datas de criação/atualização).
 - ✅ **T09**: Implementar repositório JPA e serviço de usuários (cadastro de usuário, busca por email/login).
- ✅ **T10**: Implementar criptografia de senha (BCryptPasswordEncoder).
- ✅ **T11**: Implementar autenticação com Spring Security + JWT:
  - Endpoint de login (`/api/v1/auth/login`) recebendo email e senha.
  - Geração de token JWT com claims básicas (id do usuário, email, roles, expiração).
  - Filtro para validar token em cada requisição autenticada.
- ✅ **T12**: Configurar regras de segurança:
  - Permitir acesso público a `/api/v1/auth/login` (e eventualmente `/api/v1/auth/register`, se existir).
  - Proteger endpoints de tarefas, exigindo token JWT.
- ✅ **T13**: Criar DTOs de entrada/saída para login e usuário, evitando expor senha.

---

### Fase 4 – Backend: Domínio de Tarefas (REST + JPA)

- ✅ **T14**: Modelar entidade `Task` com campos:
  - id
  - título
  - descrição
  - responsável
  - prioridade (enum: ALTA, MEDIA, BAIXA)
  - deadline (data)
  - situação/status (enum: EM_ANDAMENTO, CONCLUIDA)
  - usuário dono/criador (relacionamento com `User`, se aplicável)
  - datas de criação/atualização
 - ✅ **T15**: Criar repositório JPA para `Task`.
- ✅ **T16**: Implementar serviço de tarefas:
  - Criar tarefa
  - Atualizar tarefa
  - Remover tarefa
  - Concluir tarefa (alterar status para CONCLUIDA)
  - Listar tarefas com filtros (título, responsável, prioridade, situação, intervalo de datas).
- ✅ **T17**: Criar DTOs de requisição e resposta para tarefas, com validações (Bean Validation).
- ✅ **T18**: Implementar controller REST para tarefas:
  - `POST /tasks`
  - `PUT /tasks/{id}`
  - `DELETE /tasks/{id}`
  - `PATCH /tasks/{id}/concluir`
  - `GET /tasks` com parâmetros de filtro.
- ✅ **T19**: Garantir que listagens padrão considerem apenas tarefas **em andamento**, com opção de incluir concluídas via filtro (parâmetro `onlyNotConcluded=false`).

---

### Fase 5 – Backend: Qualidade, Documentação e Extras

- ✅ **T20**: Configurar Swagger/OpenAPI (Springdoc) para documentação automática dos endpoints.
- ✅ **T21**: Escrever testes unitários e de serviço (JUnit + Mockito) para:
  - Serviços de autenticação (login, geração/validação de JWT).
  - Serviços de tarefas (criação, atualização, conclusão, filtros).
- ✅ **T22**: Criar testes de integração básicos para endpoints REST principais.
- ✅ **T23**: Documentar no `README.md` como rodar o backend localmente (incluindo banco).

---

### Fase 6 – Frontend: Setup Angular

- ✅ **T24**: Criar projeto Angular (versão mais recente) na pasta `frontend/`.
- ✅ **T24a**: Criar base de **Design System** no frontend:
  - Definir pasta/módulo compartilhado (ex.: `shared/design-system/`).
  - Criar componentes reutilizáveis principais (inputs, selects, checkbox, botões, etc.), integrados com Reactive Forms.
- ✅ **T24b**: Criar módulo/camada de **API** no frontend:
  - Definir serviços para comunicação com o backend (ex.: `api/auth-api.service`, `api/tasks-api.service`).
  - Centralizar URLs, tipos e mapeamentos entre modelos de API e modelos de UI.
- ✅ **T25**: Configurar estrutura de módulos/páginas:
  - Módulo de autenticação (login).
  - Módulo de tarefas (lista, formulário).
  - Módulo de layout/shared (componentes comuns, interceptors, guards).
- ✅ **T26**: Configurar roteamento básico (rota de login, rota de tarefas protegida).
- ✅ **T27**: Configurar estilos globais e layout principal (header, conteúdo, feedback de mensagens).

---

### Fase 7 – Frontend: Autenticação e Consumo de API

- ✅ **T28**: Implementar tela de login:
  - Formulário reativo com validação.
  - Chamada ao endpoint `/auth/login`.
  - Armazenar token JWT (preferencialmente em `sessionStorage` ou `localStorage` com cuidado).
  - Incluir **link para tela de cadastro de usuário**.
- ✅ **T29**: Implementar `AuthService` e `AuthGuard` para proteger rotas autenticadas.
- ✅ **T30**: Implementar `HTTP Interceptor` para anexar o token JWT no header `Authorization` das requisições.
- ✅ **T31**: Tratar expiração do token e redirecionamento para login.
- ✅ **T31a**: Implementar tela de **cadastro de usuário**:
  - Formulário com campos básicos (nome, e-mail, senha, confirmação de senha).
  - Integração com endpoint de criação de usuário no backend.
  - Navegação a partir do link existente na tela de login.

---

### Fase 8 – Frontend: Módulo de Tarefas

- ✅ **T32**: Implementar tela de listagem de tarefas:
  - Tabela com colunas: título, responsável, prioridade, deadline, situação, ações.
  - Filtros por título, responsável, prioridade, situação e período de datas.
  - Paginação e ordenação (se aplicável).
- ✅ **T33**: Implementar ações na listagem:
  - Criar nova tarefa (link para formulário).
  - Editar tarefa existente.
  - Remover tarefa.
  - Concluir tarefa (mudar status para concluída e retirá-la da lista padrão de andamento).
- ✅ **T34**: Implementar formulário de criação/edição de tarefa:
  - Campos com validação (obrigatoriedade, formatos de data, etc.).
  - Seleção de prioridade (alta, média, baixa) e situação (em andamento/concluída, se necessário).
- ✅ **T35**: Tratar feedbacks ao usuário (toasts/alerts) para sucesso/erro nas operações.

---

### Fase 9 – Frontend: UX, Qualidade e Ajustes

- ✅ **T36**: Melhorar experiência visual (layout responsivo, design limpo, uso de biblioteca UI se desejado – por exemplo, Angular Material).
- ✅ **T37**: Implementar validações adicionais de UX (desabilitar botões, loaders/spinners em operações assíncronas).
- ✅ **T38**: Criar alguns testes unitários básicos (Karma/Jasmine) para componentes principais e serviços.
- ✅ **T39**: Documentar no `README.md` como rodar o frontend localmente.

---

### Fase 10 – Infraestrutura, Deploy e Extras

- **T40**: Criar configuração de build para produção (backend e frontend).
- **T41**: Configurar perfil de produção e variáveis de ambiente (URLs da API, banco, JWT secret).
- **T42**: Preparar aplicação para deploy em ambiente cloud (Heroku, Render, Railway ou outro).
- **T43**: Documentar processo de deploy no `README.md`.
- **T44**: (Opcional) Adicionar logs estruturados, monitoramento básico e tratamento global de erros.

---

### Notas

- Sempre que uma tarefa (Txx) for concluída, atualizar este `ROADMAP.md` marcando o status (por exemplo, ✅) e manter o histórico organizado.
- Manter o `README.md` alinhado com o andamento do projeto, principalmente em relação a execução local, testes e deploy.


