## Desafio ESIG – Gerenciador de Tarefas (Full Stack)

Aplicação web para gerenciamento de tarefas, com **frontend em Angular (última versão)** e **backend em Java 21 + Spring Boot 3**, utilizando **PostgreSQL + JPA** para persistência e **JWT** para autenticação dos endpoints.

O objetivo é permitir:

- **Criar** tarefas
- **Atualizar** tarefas
- **Remover** tarefas
- **Listar e filtrar** tarefas
- **Concluir** tarefas (deixando de aparecer na lista de “em andamento”)

Além disso, o sistema permitirá **criar usuários** (cadastro) e **realizar login**. Na tela de login do frontend haverá um **link para a tela de cadastro de usuário**.

Cada tarefa possui: **título**, **descrição**, **responsável**, **prioridade** (alta, média, baixa), **deadline (data)** e **situação** (Em andamento ou Concluída).

Para organização das entregas, o detalhamento das etapas está descrito em `ROADMAP.md`. [[memory:8842666]]

---

### Tecnologias principais

- **Frontend**
  - Angular (versão mais recente)
  - TypeScript
  - HTML/CSS (eventualmente com Angular Material ou outra biblioteca de UI)
- **Backend**
  - Java 21
  - Spring Boot 3 (Spring Web, Spring Data JPA, Spring Security)
  - JWT para autenticação e autorização
  - Bean Validation para validações de entrada
  - Swagger / Springdoc OpenAPI para documentação REST
- **Banco de dados**
  - PostgreSQL

---

### Arquitetura geral

- **Frontend Angular**
  - Módulo de **autenticação**: tela de login (com link para cadastro), tela de cadastro de usuário, guarda de rotas, interceptor para JWT.
  - Módulo de **tarefas**: listagem, filtros, formulário de criação/edição (em modal), ações (concluir/remover/atribuir responsável).
  - Design System próprio baseado em **Angular Material** (inputs, selects, checkbox, datepicker, textarea, dropdown).
  - Datepicker configurado para **pt-BR** com exibição de datas no formato **dd/MM/yyyy**.
  - Comunicação com backend via **REST API**.

- **Backend Spring Boot**
  - Módulo de **usuários/autenticação**:
    - Entidade `User`, armazenamento de senha com hash (BCrypt).
    - Endpoint de login para geração de **token JWT**.
  - Módulo de **tarefas**:
    - Entidade `Task` com campos exigidos e status (EM_ANDAMENTO, CONCLUIDA).
    - Cada tarefa pode ou não ter um **usuário responsável** associado:
      - Quando atribuída, o responsável é um `User` do sistema (FK `user_id`), e o nome do responsável é gravado junto para exibição.
      - Também é possível ter tarefas **não atribuídas** (sem usuário responsável).
    - Endpoints REST para CRUD, conclusão e filtros.
  - Integração com **PostgreSQL** via Spring Data JPA.

---

### Requisitos para rodar o projeto

- **Geral**
  - Git
  - Docker (opcional, se preferir subir PostgreSQL em container)
- **Backend**
  - Java 21 (JDK 21)
  - Maven (ferramenta de build do backend)
  - PostgreSQL acessível (local ou em container)
- **Frontend**
  - Node.js (versão LTS recomendada)
  - NPM ou Yarn
  - Angular CLI (compatível com a versão mais recente do Angular)

---

### Estrutura de pastas (inicial)

- `backend/` – código fonte do backend (Java 21 + Spring Boot 3)
- `frontend/` – código fonte do frontend (Angular)
- `ROADMAP.md` – roadmap detalhado do projeto
- `README.md` – este arquivo de documentação geral

---

### Como executar o backend localmente

- **1. Preparar o banco PostgreSQL**
  - Criar o banco (usando `psql` ou uma UI de sua preferência):
    - Nome sugerido: `desafio_esig` (mesmo valor configurado em `application-dev.yml`).
  - Usuário e senha padrão esperados (podem ser ajustados em `application-dev.yml`):
    - `username: postgres`
    - `password: postgres`
  - Exemplo de criação via `psql`:
    ```sql
    CREATE DATABASE desafio_esig;
    ```

- **2. Verificar configuração do perfil `dev`**
  - Arquivo principal: `backend/src/main/resources/application.yml`
    - Define `server.port` e `server.servlet.context-path: /api/v1`.
  - Arquivo `backend/src/main/resources/application-dev.yml`:
    - Contém a URL do banco e as propriedades do JPA para desenvolvimento.
  - Ao rodar com `SPRING_PROFILES_ACTIVE=dev`, essas configurações serão usadas automaticamente.

- **3. Rodar o backend com Maven**
  - A partir da pasta `backend/`:
    ```bash
    mvn spring-boot:run
    ```
  - Por padrão o Spring detectará o profile `dev` configurado na aplicação (ou você pode forçar com `SPRING_PROFILES_ACTIVE=dev`).
  - A API ficará disponível em: `http://localhost:8080/api/v1`.

- **4. Rodar testes do backend**
  - Ainda na pasta `backend/`:
    ```bash
    mvn test
    ```

---

### Como executar o frontend localmente

- **1. Pré-requisitos**
  - Node.js (versão LTS recomendada).
  - NPM (instalado junto com o Node).
  - Não é obrigatório ter o Angular CLI instalado globalmente – o projeto já traz a CLI via dependência.

- **2. Instalar dependências**
  - A partir da pasta `frontend/`:
    ```bash
    npm install
    ```

- **3. Rodar a aplicação em modo desenvolvimento**
  - Na pasta `frontend/`:
    ```bash
    npm start
    ```
  - A aplicação ficará disponível em `http://localhost:4200`.
  - Certifique-se de que o backend esteja rodando em `http://localhost:8080/api/v1` para que as chamadas de API funcionem corretamente.

- **4. Rodar testes do frontend**
  - Na pasta `frontend/`:
    ```bash
    npm test -- --watch=false
    ```
  - Esse comando usa a integração do Angular com **Vitest** para executar os testes unitários.

---

### Autenticação e segurança

- O login será feito por **usuário e senha**, com endpoint dedicado (ex.: `/api/v1/auth/login`).
- Em caso de credenciais válidas, o backend retornará um **token JWT**, que deverá ser enviado em todas as requisições subsequentes aos endpoints protegidos, no header `Authorization: Bearer <token>`.
- O frontend será responsável por:
  - Armazenar o token (por exemplo, em `sessionStorage` ou `localStorage`).
  - Anexar o token automaticamente nas requisições via **HTTP Interceptor**.
  - Proteger as rotas internas via **guards**.

Regras de acesso às tarefas:

- Usuários com `ROLE_USER`:
  - Podem criar tarefas (atribuindo ou não um responsável).
  - Só podem **alterar/remover/concluir** tarefas das quais são responsáveis.
  - Na listagem, enxergam tanto as tarefas em que são responsáveis quanto tarefas **ainda não atribuídas**.
- Usuários com `ROLE_ADMIN`:
  - Podem visualizar e gerenciar **todas** as tarefas.
  - Podem atribuir ou remover o responsável de qualquer tarefa.
  - Podem vincular um responsável a partir de um modal dedicado na listagem.

Regras adicionais de comportamento da listagem de tarefas:

- A listagem principal exibe por padrão apenas tarefas **em andamento** (pode ser alterado via filtro).
- As tarefas são ordenadas primeiro pelo **prazo mais próximo** (`deadline` ascendente) e, em caso de empate de data, pela **maior prioridade** (ALTA > MÉDIA > BAIXA).
- A ação de **Concluir** só é exibida quando o usuário tem permissão para alterar a tarefa.
- Usuários `ROLE_USER` podem se vincular como responsáveis a tarefas não atribuídas diretamente pela tela de listagem.

---

### Testes e qualidade

- **Backend**
  - Testes unitários e de serviço com JUnit + Mockito.
  - Testes de integração básicos para endpoints REST mais críticos.
- **Frontend**
  - Testes unitários para componentes e serviços principais usando a integração do Angular com **Vitest** (`npm test`).

---

### Documentação da API

- A API REST será documentada usando **Swagger / OpenAPI**.
- Com o backend rodando em ambiente local, a interface do Swagger pode ser acessada em:
  - `http://localhost:8080/api/v1/swagger-ui/index.html`
- A autenticação JWT está configurada no Swagger usando o **security scheme** `bearerAuth`:
  - Clique em **Authorize** e informe `Bearer SEU_TOKEN_JWT` para testar os endpoints protegidos.

---

### Deploy

- O projeto poderá ser publicado em ambiente cloud (Heroku, Render, Railway ou outro).
- **Backend (Spring Boot)**:
  - Usar o profile `prod` em produção (`SPRING_PROFILES_ACTIVE=prod`).
  - Configurar as seguintes variáveis de ambiente no provedor (Render/Railway/Heroku, etc.):
    - `DB_URL` – URL JDBC completa do PostgreSQL (ex.: `jdbc:postgresql://host:5432/desafio_esig`).
    - `DB_USERNAME` – usuário do banco.
    - `DB_PASSWORD` – senha do banco.
    - `JWT_SECRET` – chave secreta forte para assinatura dos tokens JWT.
  - O `application-prod.yml` já está preparado para ler essas variáveis.

- **Frontend (Angular)** – exemplo de publicação na **Vercel**:
  - Crie um novo projeto na Vercel apontando para este repositório.
  - Configure o diretório raiz como `frontend/`.
  - Use o comando de build padrão: `npm run build`.
  - Configure o diretório de saída como `dist/frontend-app/browser`.
  - Defina a variável de ambiente `NG_APP_API_BASE_URL` com a URL pública do backend (ex.: `https://seu-backend.com/api/v1`).
  - Após o deploy, o frontend consumirá o backend usando o valor de `NG_APP_API_BASE_URL`.

---

### Roadmap

- O planejamento detalhado das tarefas (T01, T02, T03, ...) está no arquivo `ROADMAP.md`.
- Sempre que novas funcionalidades forem implementadas, este `README.md` será atualizado para refletir:
  - Como rodar o projeto.
  - Como autenticar.
  - Principais endpoints e telas disponíveis. [[memory:8842666]]


