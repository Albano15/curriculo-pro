import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './App.css';

function App() {
  const [dados, setDados] = useState({
    nome: '',
    cargo: '',
    endereco: '',
    email: '',
    telefone: '',
    github: '',
    linkedin: '',
    resumo: '',
    experiencia: '',
    formacao: '',
    habilidades: '',
    foto: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/curriculo`);
        setDados(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido';
        }
        break;
      case 'telefone':
        if (!/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(value)) {
          error = 'Telefone inválido (ex: (11) 99999-9999)';
        }
        break;
      case 'github':
      case 'linkedin':
        if (value && !/^https?:\/\//i.test(value)) {
          error = 'URL deve começar com http:// ou https://';
        }
        break;
      case 'nome':
        if (!value.trim()) {
          error = 'Nome é obrigatório';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validação em tempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    setDados(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Criar URL temporária para preview
      const fileURL = URL.createObjectURL(selectedFile);
      setDados(prev => ({ ...prev, foto: fileURL }));
    }
  };

  const uploadPhoto = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data.url;
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      return null;
    }
  };

  const saveData = async () => {
    // Validar campos obrigatórios
    const newErrors = {};
    Object.keys(dados).forEach(key => {
      if (key === 'nome' && !dados[key].trim()) {
        newErrors[key] = 'Campo obrigatório';
      }
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    
    try {
      let photoUrl = dados.foto;
      
      // Se uma nova foto foi selecionada, fazer upload
      if (file) {
        photoUrl = await uploadPhoto();
      }
      
      // Atualizar dados com URL da foto (se necessário)
      const dadosAtualizados = {
        ...dados,
        foto: photoUrl || dados.foto
      };
      
      await axios.post(`${process.env.REACT_APP_API_URL}/api/curriculo`, dadosAtualizados);
      
      setSuccessMessage('Dados salvos com sucesso!');
      setFile(null); // Resetar arquivo selecionado
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    } finally {
      setSaving(false);
    }
  };

  const gerarPDF = () => {
    const input = document.getElementById('curriculo-template');
    
    html2canvas(input, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${dados.nome || 'curriculo'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Curriculo<span className="highlight">Pro</span></h1>
          <p>Crie seu currículo profissional em minutos</p>
        </div>
      </header>

      <div className="content-wrapper">
        <div className="form-section">
          <div className="section-header">
            <h2>Dados Pessoais</h2>
            <button 
              onClick={saveData} 
              className="save-button"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Dados'}
            </button>
          </div>
          
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input 
                type="text" 
                name="nome" 
                value={dados.nome} 
                onChange={handleChange} 
                placeholder="Ex: João Silva"
                className={errors.nome ? 'error' : ''}
              />
              {errors.nome && <span className="error-message">{errors.nome}</span>}
            </div>
            
            <div className="form-group">
              <label>Cargo Desejado *</label>
              <input 
                type="text" 
                name="cargo" 
                value={dados.cargo} 
                onChange={handleChange} 
                placeholder="Ex: Desenvolvedor Full Stack"
              />
            </div>
            
            <div className="form-group">
              <label>Endereço</label>
              <input 
                type="text" 
                name="endereco" 
                value={dados.endereco} 
                onChange={handleChange} 
                placeholder="Ex: São Paulo, SP"
              />
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email" 
                value={dados.email} 
                onChange={handleChange} 
                placeholder="seu@email.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label>Telefone *</label>
              <input 
                type="text" 
                name="telefone" 
                value={dados.telefone} 
                onChange={handleChange} 
                placeholder="(11) 99999-9999"
                className={errors.telefone ? 'error' : ''}
              />
              {errors.telefone && <span className="error-message">{errors.telefone}</span>}
            </div>
            
            <div className="form-group">
              <label>GitHub</label>
              <input 
                type="text" 
                name="github" 
                value={dados.github} 
                onChange={handleChange} 
                placeholder="https://github.com/seu-usuario"
                className={errors.github ? 'error' : ''}
              />
              {errors.github && <span className="error-message">{errors.github}</span>}
            </div>
            
            <div className="form-group">
              <label>LinkedIn</label>
              <input 
                type="text" 
                name="linkedin" 
                value={dados.linkedin} 
                onChange={handleChange} 
                placeholder="https://linkedin.com/in/seu-perfil"
                className={errors.linkedin ? 'error' : ''}
              />
              {errors.linkedin && <span className="error-message">{errors.linkedin}</span>}
            </div>
            
            <div className="form-group">
              <label>Foto de Perfil</label>
              <div className="file-upload">
                <label className="upload-btn">
                  {file ? 'Foto Selecionada' : 'Escolher Foto'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {dados.foto && (
                  <div className="photo-preview">
                    <img 
                      src={dados.foto} 
                      alt="Preview" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Resumo Profissional</label>
              <textarea 
                name="resumo" 
                value={dados.resumo} 
                onChange={handleChange} 
                placeholder="Descreva sua experiência e objetivos"
                rows="4"
              />
            </div>
            
            <div className="form-group full-width">
              <label>Experiência Profissional</label>
              <textarea 
                name="experiencia" 
                value={dados.experiencia} 
                onChange={handleChange} 
                placeholder="Ex: Empresa, cargo, período e responsabilidades"
                rows="6"
              />
              <div className="hint">Separe cada experiência com uma linha em branco</div>
            </div>
            
            <div className="form-group full-width">
              <label>Formação Acadêmica</label>
              <textarea 
                name="formacao" 
                value={dados.formacao} 
                onChange={handleChange} 
                placeholder="Ex: Curso, instituição e período"
                rows="4"
              />
              <div className="hint">Separe cada formação com uma linha em branco</div>
            </div>
            
            <div className="form-group full-width">
              <label>Habilidades Técnicas</label>
              <textarea 
                name="habilidades" 
                value={dados.habilidades} 
                onChange={handleChange} 
                placeholder="Liste suas principais habilidades separadas por vírgulas"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="preview-section">
          <div className="section-header">
            <h2>Pré-visualização</h2>
            <button onClick={gerarPDF} className="print-button">
              <i className="icon">🖨️</i> Gerar PDF
            </button>
          </div>
          
          <div className="preview-container">
            <div id="curriculo-template" className="curriculo-template">
              <header className="curriculo-header">
                <div className="header-content">
                  <div className="personal-info">
                    <h1>{dados.nome || "Seu Nome Completo"}</h1>
                    <h2>{dados.cargo || "Cargo Desejado"}</h2>
                  </div>
                  
                  {dados.foto && (
                    <div className="foto-container">
                      <img 
                        src={dados.foto} 
                        alt="Foto do candidato" 
                        className="foto-perfil"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
                
                <div className="contact-info">
                  {dados.endereco && <div className="contact-item">📍 {dados.endereco}</div>}
                  {dados.email && <div className="contact-item">✉️ {dados.email}</div>}
                  {dados.telefone && <div className="contact-item">📱 {dados.telefone}</div>}
                  {dados.github && <div className="contact-item">🐱 {dados.github.replace('https://', '')}</div>}
                  {dados.linkedin && <div className="contact-item">👔 {dados.linkedin.replace('https://', '')}</div>}
                </div>
              </header>
              
              <div className="curriculo-body">
                {dados.resumo && (
                  <section className="curriculo-section">
                    <h3>Resumo Profissional</h3>
                    <div className="section-content">
                      <p>{dados.resumo}</p>
                    </div>
                  </section>
                )}
                
                {dados.experiencia && (
                  <section className="curriculo-section">
                    <h3>Experiência Profissional</h3>
                    <div className="section-content">
                      {dados.experiencia.split('\n\n').map((exp, index) => (
                        <div key={index} className="experience-item">
                          {exp.split('\n').map((line, i) => (
                            <p key={i} className={i === 0 ? 'job-title' : ''}>{line}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {dados.formacao && (
                  <section className="curriculo-section">
                    <h3>Formação Acadêmica</h3>
                    <div className="section-content">
                      {dados.formacao.split('\n\n').map((edu, index) => (
                        <div key={index} className="education-item">
                          {edu.split('\n').map((line, i) => (
                            <p key={i} className={i === 0 ? 'degree' : ''}>{line}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {dados.habilidades && (
                  <section className="curriculo-section">
                    <h3>Habilidades Técnicas</h3>
                    <div className="skills-container">
                      {dados.habilidades.split(',').map((skill, index) => (
                        <div key={index} className="skill-tag">{skill.trim()}</div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="app-footer">
        <p>CurriculoPro &copy; {new Date().getFullYear()} - Crie seu currículo profissional</p>
      </footer>
    </div>
  );
}

export default App;