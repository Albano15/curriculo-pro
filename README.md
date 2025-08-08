# CurriculoPro - Criador de Currículos Profissionais


O CurriculoPro é uma aplicação web completa que permite criar, personalizar e exportar currículos profissionais em formato PDF. Com uma interface intuitiva, você pode preencher seus dados, visualizar em tempo real e gerar um PDF elegante para impressão ou envio digital.

## Recursos Principais

- 📝 Formulário completo com todos os campos necessários
- 👁️ Pré-visualização em tempo real
- 📤 Upload de foto de perfil com recorte automático
- 💾 Salvar dados no servidor
- 📄 Gerar PDF com layout profissional
- 📱 Design responsivo

## Tecnologias Utilizadas

- **Frontend:**
  - React 19
  - Axios (para requisições HTTP)
  - jsPDF + html2canvas (geração de PDF)
  - CSS moderno (Flexbox, Grid, variáveis CSS)

- **Backend:**
  - Node.js
  - Express (framework web)
  - Multer (upload de imagens)
  - CORS (gerenciamento de origens)

## Como Executar o Projeto

### Pré-requisitos

- Node.js (v18 ou superior)
- npm (v9 ou superior)
- Docker para subir os containers de backend e frontend

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/seu-usuario/curriculo-pro.git
cd curriculo-pro


### Passo 2: Subir os containers e acessar a página local
docker-compose up --build

acesse: http://localhost:3000