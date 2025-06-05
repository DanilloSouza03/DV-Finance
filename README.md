# DV Finance

Este projeto é uma aplicação web para gerenciar clientes e seus ativos financeiros. Ele consiste em um backend construído com Fastify e Prisma para a API e persistência de dados no MySQL, e um frontend desenvolvido com Next.js, React Query, Tailwind CSS e Shadcn UI para a interface do usuário.

![Gif da DV Finance](https://github.com/DanilloSouza03/DV-Finance/blob/main/docs/gif/home.gif)

## Tecnologias Utilizadas

*   **Backend:**
    *   Fastify
    *   Prisma
    *   TypeScript
    *   Zod
    *   @fastify/cors
*   **Frontend:**
    *   Next.js
    *   React Query
    *   Tailwind CSS
    *   Shadcn UI
    *   TypeScript
    *   Zod
    *   React Hook Form
    *   Axios
  

### Schema do Banco de Dados (Prisma)

O schema define as tabelas `Client` e `Asset` e seus relacionamentos:

```prisma
// backend/prisma/schema.prisma

model Client {
  id     String  @id @default(uuid())
  name   String
  email  String  @unique
  active Boolean @default(true)
  assets Asset[] 
}

model Asset {
  id        String  @id @default(uuid())
  name      String
  value     Float
  clientId  String
  client    Client  @relation(fields: [clientId], references: [id])
}
```

### Rotas da API

As rotas da API são definidas em `backend/src/routes/clients.ts` e `backend/src/routes/assets.ts`.

**Rotas de Clientes (`/clients`)**

*   `POST /`: Cria um novo cliente.
*   `GET /list`: Lista todos os clientes.
*   `PUT /edit/:id`: Atualiza um cliente existente pelo ID.
*   `DELETE /delete/:id`: Apaga um cliente pelo ID

**Rotas de Ativos (`/assets`)**

*   `POST /`: Cria um novo ativo associado a um cliente.
*   `GET /`: Lista todos os ativos.
*   `GET /cliente/:id`: Lista os ativos de um cliente específico pelo ID.
*   `DELETE /delete/:id`: Apaga um ativo pelo ID.
*   `GET /catalog`: Retorna uma lista mockada de ativos disponíveis no catálogo com valores fixos.


## Como Rodar o Projeto

Este projeto utiliza Docker Compose para o banco de dados, backend e frontend.

1.  **Pré-requisitos:**
    *   Docker e Docker Compose instalados.
    *   Git instalado.

2.  **Copiar o repositório:**
    *   Clone o repositório para sua máquina local:
        ```bash
        git clone https://github.com/DanilloSouza03/DV-Finance.git
        cd dv-finance 
        ```

3.  **Configurar variáveis de ambiente:**
    *   Copie o arquivo `.env.example` para `.env` na raiz do projeto:
        ```bash
        cp .env.example .env
        ```
    *   Edite o arquivo `.env` na raiz do projeto e preencha as variáveis de ambiente necessárias para a conexão com o banco de dados MySQL. O arquivo `docker-compose.yml` utiliza as seguintes variáveis:
        ```env
        DATABASE_HOST=seu_database_host
        DATABASE_USER=seu_database_user
        DATABASE_PASSWORD=seu_database_password
        DATABASE_NAME=seu_database_name
        ```
    *   O backend também precisa da URL completa do banco de dados. Copie o arquivo `.env.example` para `.env` dentro da pasta `backend/`:
        ```bash
        cp backend/.env.example backend/.env
        ```
    *   Edite o arquivo `backend/.env` e preencha a variável `DATABASE_URL`. Use os valores definidos no `.env` raiz.
        ```env
        DATABASE_URL="mysql://<USER>:<PASSWORD>@<HOST>:3306/<DATABASE_NAME>"
        ```

4.  **Construir e iniciar os contêineres:**
    *   Abra o terminal na raiz do projeto (dentro da pasta clonada).
    *   Execute o comando:
        ```bash
        docker-compose up --build
        ```
    *   Este comando construirá as imagens Docker para o backend e frontend e iniciará todos os serviços definidos no `docker-compose.yml` (banco de dados, backend e frontend). O backend executará as migrações do Prisma automaticamente antes de iniciar.

    4.1. **Possível erro na primeira execução:** Na primeira vez que você rodar `docker-compose up --build`, o contêiner do backend pode falhar ao tentar executar as migrações do Prisma porque o banco de dados MySQL pode ainda não estar totalmente pronto. Se isso acontecer, o contêiner do backend irá parar. Para resolver, basta reiniciar o contêiner do backend (ou rodar `docker-compose up` novamente sem o `--build` se as imagens já foram construídas). As migrações devem rodar corretamente na segunda tentativa.

5.  **Acessar a aplicação:**
    *   O frontend estará acessível em `http://localhost:3001`.

6.  **Testar as rotas da API com Postman:**
    *   Importe os arquivos `docs/postman/DV-Finance.postman_collection.json` e `doc/postman/DV-Finance.postman_environment.json` no Postman.
    *   Selecione o ambiente "DV-Finance" importado. Ele já deve conter a variável `baseURL` configurada para `http://localhost:3000`.
    *   Você pode usar as requisições na coleção "DV-Finance" para testar as rotas de clientes e ativos do backend.

7.  **Parar os contêineres:**
    *   Para parar os serviços, pressione `Ctrl+C` no terminal onde o `docker-compose up` está rodando.
    *   Para remover os contêineres, redes e volumes (exceto volumes nomeados como `db_data` neste caso, que persistem os dados do banco), execute:
        ```bash
        docker-compose down
        ```
