<h1 align="center">🎬 CineLearn</h1>

<p align="center">
  <b>Sistema de Recomendação Educacional de Filmes e Séries</b><br>
  <i>Auxilia professores e pais na escolha de conteúdos adequados e educativos para crianças e adolescentes.</i>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Express.js-black?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/TMDB-API-blue?logo=themoviedatabase" alt="TMDB API" />
</p>

---

## 📘 Sobre o Projeto

O **CineLearn** é um sistema web desenvolvido para **recomendar filmes e séries com enfoque educacional**, ajudando **professores e pais** na seleção de conteúdos adequados a diferentes **faixas etárias** e **temas pedagógicos**.

O sistema usa dados da **API do TMDB** e uma base organizada no **MongoDB**, filtrando conteúdos a partir de **palavras-chave, gênero, idade e temas educativos**.  
A recomendação é feita sem uso de IA — e sim com **teoria dos grafos**, garantindo transparência e controle sobre os resultados.

---

## 🚀 Tecnologias Utilizadas

### 💻 **Frontend**
- ⚛️ React.js  
- 🧭 React Router  
- 💾 Context API  

### 🖥️ **Backend**
- 🟩 Node.js + Express  
- 🔐 Dotenv (variáveis de ambiente)  
- 📡 API REST modular  

### 🍃 **Banco de Dados**
- MongoDB Atlas  
- Mongoose (ODM)

### 🔗 **Integrações**
- 🎥 API TMDB (The Movie Database)  
- 🔢 Teoria dos Grafos aplicada à recomendação  
- 📊 Scripts automatizados:  
  - `tmdb_import.js` → Importação de dados  
  - `update_movie_ages.js` → Atualização de faixas etárias  
  - `cleanup_movies.js` → Limpeza de duplicados e indevidos  

---

## 🧩 Funcionalidades Principais

- ✅ Login e cadastro (Aluno ou Professor)  
- ✅ Busca e filtros dinâmicos (gênero, tipo, ano, tema)  
- ✅ Quiz educacional com base em palavras-chave  
- ✅ Recomendação personalizada via teoria dos grafos  
- ✅ Sistema de favoritos e avaliações  
- ✅ Controle de faixa etária e perfil  
- ✅ Limpeza automática de duplicados e indevidos  

---

## ⚙️ Como Executar o Projeto Localmente

### 🔧 Pré-requisitos
- Node.js v18+  
- Conta e chave de API TMDB  
- Banco MongoDB Atlas configurado  

### 📦 Instalação

# Clone o repositório
git clone https://github.com/rafa8641/CineLearn.git
cd CineLearn

# Instale as dependências do backend
cd backend
npm install

# Instale as dependências do frontend
cd ../frontend
npm install

### 🧩 Variáveis de Ambiente
Crie o arquivo `.env` dentro da pasta `backend`:

MONGODB_URI=sua_string_de_conexao_mongodb
TMDB_API_KEY=sua_chave_da_tmdb
PORT=5000

### ▶️ Executar o servidor
cd backend
npm run dev

### 💻 Executar o frontend
cd frontend
npm run dev
