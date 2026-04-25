import React, { useState } from 'react';
import './App.css';
import GenerationTab from './components/GenerationTab';
import UpscaleTab from './components/UpscaleTab';
import LatentVisualizer from './components/VaeViz';

const HomeTab = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const galleryData = [
    {
      url: "images/burger.jpg",
      prompt: "a big and tasty burger",
      negative: "bad resolution, worst quality, blurry, ugly",
      width: "512",
      height: "512",
      seed: "8547",
      steps: "20",
      model: "animerge_v50.safetensors"
    },
    {
      url: "images/girl.jpg",
      prompt: "1woman, black hair, short hair, bun, red eyes, black dress, portrait",
      negative: "bad resolution, worst quality, extra digits, ugly",
      seed: "42",
      width: "512",
      height: "768",
      steps: "20",
      model: "animerge_v50.safetensors"
    },
    {
      url: "images/car.jpg",
      prompt: "a luxury porshe supercar, best quality, masterpiece, no license plate",
      negative: "bad resolution, worst quality, blurry, ugly, license plate",
      seed: "7449",
      width: "768",
      height: "512",
      steps: "20",
      model: "animerge_v50.safetensors"
    },
    {
      url: "images/cat.jpg",
      prompt: "black cat, masterpiece, best quality",
      negative: "bad resolution, worst quality, extra digits, ugly",
      seed: "42",
      width: "512",
      height: "512",
      steps: "20",
      model: "animerge_v50.safetensors"
    },
    {
      url: "images/cactus.jpg",
      prompt: "a cactus in a desert",
      negative: "bad resolution, worst quality, blurry, ugly",
      seed: "3450",
      width: "512",
      height: "512",
      steps: "20",
      model: "animerge_v50.safetensors"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryData.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryData.length) % galleryData.length);

  return (
    <div className="tab-fade-in">
      <section className="hero-section">
        <h1>Diffusion Laboratory <span className="badge">Based on SD1</span></h1>
        <p className="subtitle">Specialized environment for image generation and reaserch of generation processes and using AI for image processing</p>
      </section>
      
      <div className="home-grid">
        <div className="home-card">
          <h3>Generation</h3>
          <p>
            This module provides Text-to-Image synthesis by leveraging a multi-network architecture: 
            CLIP encodes text prompts into a mathematical space that the UNet can understand, which then iteratively refines random noise into a coherent, high-fidelity image. 
          </p>
          <div className="home-image-frame">
            <img src="https://cdn3.pixelcut.app/7/21/ai_image_generator_header_592407ec5d.png" alt="Gen Example" />
          </div>
        </div>
        <div className="home-card">
          <h3>Upscale</h3>
          <p>
            This module utilizes ESRGAN (Enhanced Super-Resolution Generative Adversarial Networks) to upscale low-resolution images while preserving structural integrity. 
            Unlike standard interpolation, the model reconstructs missing textures and high-frequency details.
          </p>
          <div className="home-image-frame">
            <img src="https://static.futureshareai.com/glb_features/free_ai_image_upscaler_image_1.webp" alt="Upscale Example" />
          </div>
        </div>
      </div>

      <div className="features-list">
        {/* Первый элемент: Текст слева, Изображение справа */}
        <div className="feature-item">
          <div className="feature-info">
            {/* <div className="badge">AI Model</div> */}
            <h3>Latent Space Visualization</h3>
            <p>
              This visualization is an interactive latent space explorer designed to bridge the gap between abstract neural network data and human-interpretable images. 
              It allows researchers to navigate the "thought process" of a Variational Autoencoder (VAE) by mapping thousands of high-dimensional inputs into a color-coded 2D coordinate system.
              By observing how digits morph and blend at the boundaries of different clusters, you can evaluate how well the model has learned the underlying structure and features of the dataset.
            </p>
          </div>
          <div className="home-image-frame-vae">
            <img src="images/vae.png" alt="VAE viz"/>
            {/* Здесь можно вставить реальное изображение или оставить пустой div со стилями */}
          </div>
        </div>

        {/* Второй элемент: Изображение слева, Текст справа */}
        {/* <div className="feature-item reverse">
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
            empty text
          </div>
        </div> */}
      </div>

      <section className="slider-section">
        <div className='Title-Gallery'>
          <h2>Laboratory Gallery <span className="badge">AI Images</span></h2>
          <p>Visualize the creations of AI and the options. Inspire or replicate the results</p>
        </div>
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
                  <span>Height</span>
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
        <div className="nav-logo" onClick={() => setActiveTab('home')}>DIFFUSION LAB<span>SD1</span></div>
        <nav className="nav-links">
          <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</button>
          <button className={activeTab === 'generate' ? 'active' : ''} onClick={() => setActiveTab('generate')}>Generation</button>
          <button className={activeTab === 'upscale' ? 'active' : ''} onClick={() => setActiveTab('upscale')}>Upscale</button>
          <button className={activeTab === 'latent' ? 'active' : ''} onClick={() => setActiveTab('latent')}>Latents</button>
          {/* <button className={activeTab === 'heatmap' ? 'active' : ''} onClick={() => setActiveTab('heatmap')}>Heatmaps</button> */}
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