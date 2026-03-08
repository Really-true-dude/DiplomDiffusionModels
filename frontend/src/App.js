import React, { useState } from 'react';
import './App.css';
import GenerationTab from './components/GenerationTab';
import UpscaleTab from './components/UpscaleTab';

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
        {(activeTab === 'latent' || activeTab === 'heatmap') && (
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









// import React, { useState } from 'react';
// import './App.css';
// import GenerationTab from './components/GenerationTab';
// import UpscaleTab from './components/UpscaleTab';

// // Компонент главной страницы
// const HomeTab = () => (
//   <div className="tab-fade-in">
//     <h1>Stable Diffusion Laboratory</h1>
//     <p className="subtitle">Инструментарий для глубокой работы с генеративными моделями</p>
    
//     <div className="home-grid">
//       <div className="home-card">
//         <h3>Генерация</h3>
//         <p>Создание изображений из текста с использованием CLIP и UNet. Полный контроль над сидом и шагами сэмплера.</p>
//         <img src="https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&w=400" alt="Gen Example" />
//       </div>
//       <div className="home-card">
//         <h3>Upscale</h3>
//         <p>Увеличение разрешения через ESRGAN. Восстановление деталей и четкости на краях объектов.</p>
//         <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=400" alt="Upscale Example" />
//       </div>
//     </div>
//   </div>
// );

// function App() {
//   const [activeTab, setActiveTab] = useState('home');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'home': return <HomeTab />;
//       case 'generate': return <GenerationTab />;
//       case 'upscale': return <UpscaleTab />;
//       case 'latent': return <div className="placeholder-tab"><h2>Latent Visualization</h2><p>Coming Soon...</p></div>;
//       case 'heatmap': return <div className="placeholder-tab"><h2>Heatmap Visualization</h2><p>Coming Soon...</p></div>;
//       default: return <HomeTab />;
//     }
//   };

//   return (
//     <div className="app-container">
//       <nav className="navbar">
//         <div className="nav-logo">SD Lab v1.5</div>
//         <div className="nav-links">
//           <button className={activeTab === 'home' ? 'active' : ''} onClick={() => setActiveTab('home')}>Home</button>
//           <button className={activeTab === 'generate' ? 'active' : ''} onClick={() => setActiveTab('generate')}>Generation</button>
//           <button className={activeTab === 'upscale' ? 'active' : ''} onClick={() => setActiveTab('upscale')}>Upscale</button>
//           <button className={activeTab === 'latent' ? 'active' : ''} onClick={() => setActiveTab('latent')}>Latents</button>
//           <button className={activeTab === 'heatmap' ? 'active' : ''} onClick={() => setActiveTab('heatmap')}>Heatmap</button>
//         </div>
//       </nav>

//       <main className="content-area">
//         {renderContent()}
//       </main>
//     </div>
//   );
// }

// export default App;





















// import React, { useState, useEffect } from "react";
// import "./App.css";

// function App() {
//   const [models, setModels] = useState([]);
//   const [modelPath, setModelPath] = useState("");
//   const [loadingModels, setLoadingModels] = useState(true);
//   const [tab, setTab] = useState("generate");

//   // Основные параметры генерации
//   const [positivePrompt, setPositivePrompt] = useState("");
//   const [negativePrompt, setNegativePrompt] = useState("");
//   const [width, setWidth] = useState(512);
//   const [height, setHeight] = useState(512);
//   const [steps, setSteps] = useState(20);
//   const [seed, setSeed] = useState(""); 
//   // const [modelPath, setModelPath] = useState("data/v1-5-pruned.ckpt");

//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [lastImagePath, setLastImagePath] = useState("");

//   // Функция для загрузки списка моделей с бэкенда
//   const fetchModels = async () => {
//     try {
//       const response = await fetch("http://localhost:8000/models");
//       const data = await response.json();
      
//       setModels(data);
      
//       // Если модели найдены, выбираем первую по умолчанию
//       if (data.length > 0) {
//         setModelPath(data[0].value);
//       }
//     } catch (err) {
//       console.error("Failed to fetch models:", err);
//     } finally {
//       setLoadingModels(false);
//     }
//   };

//   // Запускаем загрузку один раз при монтировании компонента
//   useEffect(() => {
//     fetchModels();
//   }, []);

//   const seedValue = seed.trim() === "" ? null : parseInt(seed);

//   // Состояние для латентов
//   const [latentImage, setLatentImage] = useState(null);
//   const [step, setStep] = useState(0);
//   const [channel, setChannel] = useState(0);

//   const generateImage = async () => {
//     setLoading(true);
    
//     // 1. Важно: Очищаем старый Blob URL только если он был создан через createObjectURL
//     // Если картинка приходит как Base64, revokeObjectURL не нужен, но мы оставим 
//     // проверку на случай, если ты захочешь вернуться к Blob.
//     if (image && image.startsWith('blob:')) {
//         URL.revokeObjectURL(image);
//     }
//     setImage(null);

//     // Обработка сида (пустая строка -> null)
//     const seedParam = seed === "" ? null : parseInt(seed);

//     try {
//         const response = await fetch("http://localhost:8000/generate/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 prompt: positivePrompt,
//                 uncond_prompt: negativePrompt,
//                 width: parseInt(width),
//                 height: parseInt(height),
//                 steps: parseInt(steps),
//                 model_path: modelPath,
//                 seed: seedParam
//             }),
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(errorText || "Generation failed");
//         }

//         // 2. Читаем ответ как JSON
//         const data = await response.json();

//         // 3. Устанавливаем картинку из Base64
//         // Формат: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
//         setImage(`data:image/png;base64,${data.image}`);

//         // 4. Сохраняем путь к файлу на сервере для последующего Upscale
//         setLastImagePath(data.file_path);

//         // 5. Сохраняем латенты (если они тебе нужны в стейте)
//         if (data.latents) {
//             setLatentImage(data.latents);
//         }

//     } catch (err) {
//         console.error("Generation error:", err);
//         alert("Ошибка при генерации: " + err.message);
//     } finally {
//         setLoading(false);
//     }
// };

//   return (
//     <div className="app">
//       <h1>Stable Diffusion AI Studio</h1>

//       <div className="tabs">
//         <button className={tab === "generate" ? "active" : ""} onClick={() => setTab("generate")}>
//           Generate
//         </button>
//         <button className={tab === "latents" ? "active" : ""} onClick={() => setTab("latents")}>
//           Latent Explorer
//         </button>
//       </div>

//       {tab === "generate" && (
//         <div className="generate-tab">
//           <div className="controls">
//             <label>Positive Prompt</label>
//             <textarea
//               value={positivePrompt}
//               onChange={(e) => setPositivePrompt(e.target.value)}
//               placeholder="A cat wearing a space suit..."
//             />

//             <label>Negative Prompt</label>
//             <textarea
//               value={negativePrompt}
//               onChange={(e) => setNegativePrompt(e.target.value)}
//               placeholder="low quality, blurry, deformed..."
//             />

//             <div className="settings-grid">
//               <label>Model Weights</label>
//               <div className="model-selector-wrapper">
//                 <select 
//                   value={modelPath} 
//                   onChange={(e) => setModelPath(e.target.value)}
//                   disabled={loadingModels}
//                 >
//                   {loadingModels ? (
//                     <option>Loading models...</option>
//                   ) : (
//                     models.map((m) => (
//                       <option key={m.value} value={m.value}>
//                         {m.label}
//                       </option>
//                     ))
//                   )}
//                 </select>
                
//                 <button onClick={fetchModels} className="refresh-btn">🔄</button>
//               </div>

//               <div>
//                 <label>Steps: {steps}</label>
//                 <input type="range" min="1" max="100" value={steps} onChange={(e) => setSteps(e.target.value)} />
//               </div>

//               <div>
//                 <label>Width: {width}</label>
//                 <select value={width} onChange={(e) => setWidth(e.target.value)}>
//                   {[256, 384, 448, 512, 640, 768].map(v => <option key={v} value={v}>{v}</option>)}
//                 </select>
//               </div>

//               <div>
//                 <label>Height: {height}</label>
//                 <select value={height} onChange={(e) => setHeight(e.target.value)}>
//                   {[256, 384, 448, 512, 640, 768].map(v => <option key={v} value={v}>{v}</option>)}
//                 </select>
//               </div>

//               <div>
//                 <label>Seed (empty for random)</label>
//                 <input
//                   type="number"
//                   value={seed}
//                   onChange={(e) => setSeed(e.target.value)}
//                   placeholder="Random..."
//                   style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
//                 />
//               </div>
//             </div>

//             <button className="generate-btn" onClick={generateImage} disabled={loading}>
//               {loading ? "Processing..." : "Generate Image"}
//             </button>
//           </div>

//           <div className="image-container">
//             {loading && <div className="loader-spinner"></div>}
//             {!loading && !image && <div className="placeholder">Ready to generate</div>}
//             {image && <img src={image} alt="result" className="main-result" />}
//           </div>
//         </div>
//       )}

//       {/* Latent Explorer Tab ... аналогично с добавлением width/height если нужно */}
//     </div>
//   );
// }

// export default App;