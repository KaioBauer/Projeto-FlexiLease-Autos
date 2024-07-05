# API de Reserva de Carros

Esta API permite gerenciar usuários, carros e reservas de carros. Abaixo estão as instruções para configurar, rodar e utilizar a API.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB com Mongoose
- TypeScript
- Jest para testes
- Swagger para documentação

## Pré-requisitos

- Node.js v14 ou superior
- MongoDB

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/sua-api.git
   cd sua-api
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto e configure suas variáveis de ambiente. Exemplo:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/flexilease
   JWT_SECRET=sua-chave-secreta
   ```

## Rodando a Aplicação

1. Inicie o servidor:

   ```bash
   npm start
   ```

2. Acesse a documentação da API no Swagger:

   ```
   http://localhost:3000/api-docs
   ```

## Endpoints da API

### Autenticação

- **POST /api/v1/authenticate**
  - Autentica um usuário e retorna um token JWT.
  - **Request Body:**
    ```json
    {
      "email": "usuario@example.com",
      "password": "senha123"
    }
    ```

### Usuários

- **POST /api/v1/user**

  - Cria um novo usuário.
  - **Request Body:**
    ```json
    {
      "name": "Jane Doe",
      "cpf": "123.456.789-10",
      "birth": "01/01/2000",
      "email": "jane@example.com",
      "password": "password123",
      "cep": "01001000",
      "qualified": "sim"
    }
    ```

- **GET /api/v1/user**

  - Lista todos os usuários.

- **GET /api/v1/user/:id**

  - Recupera um usuário por ID.

- **PUT /api/v1/user/:id**

  - Atualiza um usuário por ID.
  - **Request Body:** Qualquer campo pode ser atualizado, seguindo o mesmo formato do `POST /api/v1/user`.

- **DELETE /api/v1/user/:id**
  - Deleta um usuário por ID.

### Carros

- **POST /api/v1/car**

  - Cria um novo carro.
  - **Request Body:**
    ```json
    {
      "modelName": "Modelo X",
      "color": "Azul",
      "year": 2022,
      "value_per_day": 150.0,
      "accessories": [{ "description": "Ar-condicionado" }],
      "number_of_passengers": 5
    }
    ```

- **GET /api/v1/car**

  - Lista todos os carros com paginação e filtros.

- **GET /api/v1/car/:id**

  - Recupera um carro por ID.

- **PUT /api/v1/car/:id**

  - Atualiza um carro por ID.
  - **Request Body:** Qualquer campo pode ser atualizado, seguindo o mesmo formato do `POST /api/v1/car`.

- **DELETE /api/v1/car/:id**
  - Deleta um carro por ID.

### Reservas

- **POST /api/v1/reserve**

  - Cria uma nova reserva.
  - **Request Body:**
    ```json
    {
      "id_user": "id_do_usuario",
      "id_car": "id_do_carro",
      "start_date": "01/01/2023",
      "end_date": "10/01/2023"
    }
    ```

- **GET /api/v1/reserve**

  - Lista todas as reservas com paginação e filtros.

- **GET /api/v1/reserve/:id**

  - Recupera uma reserva por ID.

- **PUT /api/v1/reserve/:id**

  - Atualiza uma reserva por ID.
  - **Request Body:** Qualquer campo pode ser atualizado, seguindo o mesmo formato do `POST /api/v1/reserve`.

- **DELETE /api/v1/reserve/:id**
  - Deleta uma reserva por ID.

## Testes

Para rodar os testes, execute:

```bash
npm test
```

## Documentação da API

A API está documentada utilizando Swagger. Para acessar a documentação e testar os endpoints diretamente pelo navegador, acesse:

```
http://localhost:3000/api-docs
```

---

### Dicas Adicionais

- Certifique-se de configurar corretamente o MongoDB e as variáveis de ambiente.
- Utilize a documentação do Swagger para testar os endpoints.
- Para contribuições, faça um fork do repositório, crie um branch para sua feature ou correção de bug, faça o commit e abra um pull request.
