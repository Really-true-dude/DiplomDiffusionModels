import React, { useState } from 'react';
import './App.css';
import GenerationTab from './components/GenerationTab';
import UpscaleTab from './components/UpscaleTab';
import LatentVisualizer from './components/VaeViz';

const HomeTab = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const galleryData = [
    {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800",
      prompt: "Abstract digital art, flowing neon lines, deep purple and cyan, high contrast, 8k",
      negative: "text, low quality, blurry, distorted",
      width: "512",
      height: "728",
      seed: "4092",
      steps: "30",
      model: "v1-5-pruned.safetensors"
    },
    {
      url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800",
      prompt: "Ethereal mountain landscape, morning mist, cinematic lighting, sharp focus",
      negative: "people, buildings, noisy, grainy",
      seed: "1102",
      width: "512",
      height: "728",
      steps: "50",
      model: "SDXL_Base_1.0"
    }
    // Добавьте остальные объекты сюда...
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryData.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryData.length) % galleryData.length);

  return (
    <div className="tab-fade-in">
      <section className="hero-section">
        <h1>Stable Diffusion Laboratory</h1>
        <p className="subtitle">Профессиональная среда для генерации и глубокого анализа ИИ-изображений</p>
      </section>
      
      <div className="home-grid">
        <div className="home-card">
          <h3>Генерация</h3>
          <p>Создание изображений из текста с использованием CLIP и UNet. Полный контроль над сидом и шагами сэмплера.</p>
          <img src="https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&w=400" alt="Gen Example" />
        </div>
        <div className="home-card">
          <h3>Upscale</h3>
          <p>Увеличение разрешения через ESRGAN. Восстановление деталей и четкости на краях объектов.</p>
          <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=400" alt="Upscale Example" />
        </div>
      </div>

      <div className="features-list">
        {/* Первый элемент: Текст слева, Изображение справа */}
        <div className="feature-item">
          <div className="feature-info">
            <div className="badge">AI Model</div>
            <h3>Latent Space Visualization</h3>
            <p>
              Исследуйте "скрытое пространство" модели. Визуализация 4-х каналов латентов 
              позволяет увидеть, как нейросеть формирует структуру и цвета до того, 
              как VAE-декодер превратит их в финальные пиксели.
            </p>
          </div>
          <div className="feature-visual latent-preview">
            {/* Здесь можно вставить реальное изображение или оставить пустой div со стилями */}
          </div>
        </div>

        {/* Второй элемент: Изображение слева, Текст справа */}
        <div className="feature-item reverse">
          <div className="feature-info">
            <div className="badge">Analysis</div>
            <h3>Attention Heatmaps</h3>
            <p>
              Узнайте, на что смотрит модель. Тепловые карты Cross-Attention 
              визуализируют веса внимания нейросети, показывая прямое влияние 
              каждого токена из вашего промпта на конкретные области кадра.
            </p>
          </div>
          <div className="feature-visual heatmap-preview">
            {/* Плейсхолдер для изображения тепловой карты */}
          </div>
        </div>
      </div>

      <section className="slider-section">
        <h2>Лабораторная галерея</h2>
        <div className="slider-container">
          <button className="slider-nav prev" onClick={prevSlide}>&#10094;</button>
          
          <div className="slide-content">
            {/* Панель изображения */}
            <div className="slide-image-panel">
              <img src={galleryData[currentSlide].url} alt="Generated" />
            </div>

            {/* Панель параметров */}
            <div className="slide-info-panel">
              <div className="info-group">
                <label>Positive Prompt</label>
                <p>{galleryData[currentSlide].prompt}</p>
              </div>
              <div className="info-group">
                <label>Negative Prompt</label>
                <p className="neg-text">{galleryData[currentSlide].negative}</p>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span>Width</span>
                  <strong>{galleryData[currentSlide].width}</strong>
                </div>
                <div className="info-item">
                  <span>Heigth</span>
                  <strong>{galleryData[currentSlide].height}</strong>
                </div>
                <div className="info-item">
                  <span>Seed</span>
                  <strong>{galleryData[currentSlide].seed}</strong>
                </div>
                <div className="info-item">
                  <span>Steps</span>
                  <strong>{galleryData[currentSlide].steps}</strong>
                </div>
                <div className="info-item full">
                  <span>Model</span>
                  <strong>{galleryData[currentSlide].model}</strong>
                </div>
              </div>
            </div>
          </div>

          <button className="slider-nav next" onClick={nextSlide}>&#10095;</button>
        </div>
        
        {/* Индикаторы (точки) */}
        <div className="slider-dots">
          {galleryData.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></span>
          ))}
        </div>
      </section>
    </div>
  );
}
  
  
function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="nav-logo">SD_LAB<span>v1.5</span></div>
        <nav className="nav-links">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</button>
          <button className={activeTab === 'generate' ? 'active' : ''} onClick={() => setActiveTab('generate')}>Generation</button>
          <button className={activeTab === 'upscale' ? 'active' : ''} onClick={() => setActiveTab('upscale')}>Upscale</button>
          <button className={activeTab === 'latent' ? 'active' : ''} onClick={() => setActiveTab('latent')}>Latents</button>
          <button className={activeTab === 'heatmap' ? 'active' : ''} onClick={() => setActiveTab('heatmap')}>Heatmaps</button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'generate' && <GenerationTab />}
        {activeTab === 'upscale' && <UpscaleTab />}
        {activeTab === 'latent' && <LatentVisualizer/>}
        {activeTab === 'heatmap' && (
          <div className="placeholder-screen">
            <h2>Данная функция находится в разработке</h2>
            <p>Скоро здесь появится визуализация тензоров в реальном времени.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;