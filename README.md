# 🏥 SUS-Helper

## 👨‍🎓 Projeto Acadêmico

O SUS-Helper é um projeto acadêmico desenvolvido com o objetivo de facilitar o acesso às informações e serviços do Sistema Único de Saúde (SUS), oferecendo uma interface simples, intuitiva e acessível para os cidadãos.

---

## 👨‍💻 Integrantes

| Nome                 |
| -------------------- |
| Thiago Paes Moreira  |
| Eduardo Santos Lúcio |
| Akon Nogueira        |
| Gabriel              |

---

## 📖 Sobre o Projeto

O SUS-Helper é uma aplicação web criada para auxiliar os usuários na busca de informações relacionadas à saúde pública.

A plataforma permite localizar unidades de saúde próximas, visualizar informações sobre postos e hospitais, além de facilitar o acesso a serviços essenciais do SUS.

### Principais funcionalidades

📍 Localização de postos de saúde próximos

🏥 Consulta de hospitais e unidades de atendimento

🗺️ Exibição de rotas para unidades de saúde

👤 Cadastro e autenticação de usuários

📱 Interface simples e intuitiva

🔍 Busca rápida por serviços de saúde

---

# 📸 Telas do Projeto

## 🔐 Tela de Login

Permite que o usuário acesse sua conta de forma segura.

### Funcionalidades

* Login com e-mail e senha
* Validação de credenciais
* Recuperação de acesso
* Integração com Supabase Authentication

### Preview da Tela

![Login](./src/assets/login.png)

---

## 📝 Tela de Cadastro

Permite que novos usuários criem uma conta na plataforma.

### Funcionalidades

* Cadastro de usuário
* Validação de dados
* Armazenamento seguro das informações

### Preview da Tela

![Cadastro](./src/assets/cadastro.png)

---

## 🏠 Tela Inicial

A tela principal apresenta os recursos disponíveis no sistema.

### Funcionalidades

* Navegação simplificada
* Acesso rápido aos serviços
* Informações relevantes do SUS

### Preview da Tela

![Menu](./src/assets/menu.png)

---

## 🗺️ Tela de Mapa

Permite localizar unidades de saúde próximas ao usuário.

### Funcionalidades

* Geolocalização em tempo real
* Exibição de postos e hospitais
* Rotas até a unidade selecionada
* Integração com OpenStreetMap

### Preview da Tela

![Mapa](./src/assets/mapa.png)

---

# 🛠️ Tecnologias Utilizadas

## Frontend

* React 18
* Vite
* JavaScript
* CSS Modules
* React Leaflet

## Backend e Banco de Dados

* Supabase Authentication
* Supabase PostgreSQL

## APIs e Serviços

* Geolocation API
* OpenStreetMap
* React Leaflet
* OSRM Routing Service

---

# 🏗️ Arquitetura do Sistema

O sistema segue uma arquitetura baseada em Frontend Web integrado ao Supabase.

### Frontend

Responsável pela interface do usuário e pela interação com os serviços da aplicação.

Tecnologias utilizadas:

* React
* Vite
* CSS Modules

### Backend

Responsável pela autenticação e armazenamento das informações.

Serviços utilizados:

* Supabase Authentication
* Supabase Database (PostgreSQL)

### Serviços Externos

Responsáveis pela localização e roteamento.

* Geolocation API
* OpenStreetMap
* React Leaflet
* OSRM Routing Service

### Fluxo de Funcionamento

```text
Frontend React
      ↓
Supabase Authentication
      ↓
Supabase PostgreSQL
      ↓
Serviços de Geolocalização e Mapas
```

---

# 📋 Requisitos Funcionais

| Código | Descrição                                   |
| ------ | ------------------------------------------- |
| RF01   | Permitir cadastro de usuários               |
| RF02   | Permitir login de usuários                  |
| RF03   | Exibir unidades de saúde próximas           |
| RF04   | Exibir localização em mapa                  |
| RF05   | Traçar rotas até unidades de saúde          |
| RF06   | Consultar informações das unidades de saúde |
| RF07   | Armazenar dados dos usuários                |
| RF08   | Permitir busca por postos e hospitais       |

---

# ⚙️ Requisitos Não Funcionais

| Código | Descrição                                           |
| ------ | --------------------------------------------------- |
| RNF01  | Utilizar banco de dados PostgreSQL                  |
| RNF02  | Utilizar autenticação segura via Supabase           |
| RNF03  | Interface responsiva para dispositivos móveis       |
| RNF04  | Tempo de resposta inferior a 3 segundos             |
| RNF05  | Compatibilidade com navegadores modernos            |
| RNF06  | Utilizar comunicação segura HTTPS                   |
| RNF07  | Disponibilidade mínima de 99%                       |
| RNF08  | Interface simples e intuitiva para qualquer usuário |

---

# ▶️ Como Executar o Projeto

## Clone o repositório

```bash
git clone https://github.com/seu-usuario/SUS-Helper.git
```

## Acesse a pasta do projeto

```bash
cd SUS-Helper
```

## Instale as dependências

```bash
npm install
```

## Execute o projeto

```bash
npm run dev
```

---

# 🚀 Guia de Colaboração com Git e GitHub

## Criar uma Branch

```bash
git switch -c nome-da-feature
```

## Enviar alterações

```bash
git add .
git commit -m "feat: descrição da funcionalidade"
git push -u origin nome-da-feature
```

## Atualizar projeto

```bash
git pull
```

---

# 🔎 Comandos Úteis

| Comando                      | Descrição                       |
| ---------------------------- | ------------------------------- |
| git branch                   | Ver branch atual                |
| git branch -a                | Ver todas as branches           |
| git switch nome-da-branch    | Trocar de branch                |
| git switch -c nome-da-branch | Criar branch                    |
| git pull                     | Atualizar projeto               |
| git push                     | Enviar alterações               |
| git fetch                    | Atualizar referências remotas   |
| git merge                    | Mesclar alterações              |
| git status                   | Verificar estado do repositório |

---

# 🎯 Objetivo do Projeto

O SUS-Helper foi desenvolvido como projeto acadêmico com o objetivo de aplicar conhecimentos de desenvolvimento web utilizando React, Vite e Supabase, além de oferecer uma solução que facilite o acesso da população aos serviços do Sistema Único de Saúde.

A proposta é tornar a busca por unidades de atendimento, hospitais e postos de saúde mais rápida, simples e eficiente, contribuindo para uma melhor experiência dos usuários na utilização dos serviços públicos de saúde.
