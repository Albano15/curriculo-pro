import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Configurar armazenamento para uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Dados do currículo
let curriculoData = {
  nome: "Rafael Silva",
  cargo: "Desenvolvedor Full Stack",
  endereco: "Rua Exemplo, 123 - São Paulo/SP",
  email: "rafael@email.com",
  telefone: "(11) 99999-9999",
  github: "https://github.com/rafael",
  linkedin: "https://linkedin.com/in/rafaelsilva",
  resumo: "Desenvolvedor com 5 anos de experiência em JavaScript, React, Node.js e bancos de dados relacionais. Especializado em criar aplicações web escaláveis e de alto desempenho.",
  experiencia: "Tech Solutions SA\nDesenvolvedor Full Stack | Jan 2020 - Presente\n- Desenvolvimento de aplicações web com React e Node.js\n- Implementação de APIs RESTful\n\nInovaTech Ltda\nDesenvolvedor Frontend | Mar 2018 - Dez 2019\n- Criação de interfaces responsivas\n- Otimização de performance",
  formacao: "Bacharelado em Ciência da Computação\nUniversidade de São Paulo | 2014 - 2018\n\nTécnico em Informática\nETEC Centro | 2012 - 2013",
  habilidades: "JavaScript, React, Node.js, Express, HTML5, CSS3, SQL, Git",
  foto: ""
};

// Endpoint para obter dados do currículo
app.get('/api/curriculo', (req, res) => {
  res.json(curriculoData);
});

// Endpoint para atualizar dados do currículo
app.post('/api/curriculo', (req, res) => {
  curriculoData = { ...curriculoData, ...req.body };
  res.json({ success: true, message: "Currículo atualizado!" });
});

// Endpoint para upload de foto
app.post('/api/upload', upload.single('foto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado.' });
  }
  
  const fotoUrl = `/uploads/${req.file.filename}`;
  res.json({ 
    success: true, 
    message: "Foto atualizada com sucesso!", 
    url: fotoUrl 
  });
});

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Tratar erros de upload
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' 
        ? 'O arquivo é muito grande (máximo 5MB)' 
        : 'Erro no upload do arquivo'
    });
  } else if (err) {
    res.status(400).json({ success: false, message: err.message });
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
  console.log(`Uploads diretório: ${path.join(__dirname, 'public', 'uploads')}`);
});