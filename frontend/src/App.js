import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [models, setModels] = useState([]);
  const [modelPath, setModelPath] = useState("");
  const [loadingModels, setLoadingModels] = useState(true);
  const [tab, setTab] = useState("generate");

  // Основные параметры генерации
  const [positivePrompt, setPositivePrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [seed, setSeed] = useState(""); 
  // const [modelPath, setModelPath] = useState("data/v1-5-pruned.ckpt");

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Функция для загрузки списка моделей с бэкенда
  const fetchModels = async () => {
    try {
      const response = await fetch("http://localhost:8000/models");
      const data = await response.json();
      
      setModels(data);
      
      // Если модели найдены, выбираем первую по умолчанию
      if (data.length > 0) {
        setModelPath(data[0].value);
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  // Запускаем загрузку один раз при монтировании компонента
  useEffect(() => {
    fetchModels();
  }, []);

  const seedValue = seed.trim() === "" ? null : parseInt(seed);

  // Состояние для латентов
  const [latentImage, setLatentImage] = useState(null);
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState(0);

  // Список предустановленных моделей (пути должны соответствовать вашей файловой системе)
  // const models = [
  //   { label: "Stable Diffusion 1.5", value: "data/v1-5-pruned.ckpt" },
  //   { label: "DreamShaper", value: "data/dreamshaper_8.safetensors" },
  //   { label: "Anything V4", value: "data/anything-v4.0.safetensors" }
  // ];

  const generateImage = async () => {
    setLoading(true);
    if (image) URL.revokeObjectURL(image); // Очистка памяти от предыдущей картинки
    setImage(null);

    try {
      const response = await fetch("http://localhost:8000/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: positivePrompt,
          uncond_prompt: negativePrompt,
          width: parseInt(width),
          height: parseInt(height),
          steps: parseInt(steps),
          model_path: modelPath,
          seed: seedValue
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      // Получаем бинарные данные (blob) и создаем локальную ссылку
      const imageBlob = await response.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setImage(imageObjectURL);
    } catch (err) {
      console.error("Generation error:", err);
      alert("Ошибка при генерации: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Остальные функции (loadLatent, openModelFolder) остаются похожими, 
  // но должны соответствовать вашим эндпоинтам на 8000 порту

  return (
    <div className="app">
      <h1>Stable Diffusion AI Studio</h1>

      <div className="tabs">
        <button className={tab === "generate" ? "active" : ""} onClick={() => setTab("generate")}>
          Generate
        </button>
        <button className={tab === "latents" ? "active" : ""} onClick={() => setTab("latents")}>
          Latent Explorer
        </button>
      </div>

      {tab === "generate" && (
        <div className="generate-tab">
          <div className="controls">
            <label>Positive Prompt</label>
            <textarea
              value={positivePrompt}
              onChange={(e) => setPositivePrompt(e.target.value)}
              placeholder="A cat wearing a space suit..."
            />

            <label>Negative Prompt</label>
            <textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="low quality, blurry, deformed..."
            />

            <div className="settings-grid">
              <label>Model Weights</label>
              <div className="model-selector-wrapper">
                <select 
                  value={modelPath} 
                  onChange={(e) => setModelPath(e.target.value)}
                  disabled={loadingModels}
                >
                  {loadingModels ? (
                    <option>Loading models...</option>
                  ) : (
                    models.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))
                  )}
                </select>
                
                <button onClick={fetchModels} className="refresh-btn">🔄</button>
              </div>

              <div>
                <label>Steps: {steps}</label>
                <input type="range" min="1" max="100" value={steps} onChange={(e) => setSteps(e.target.value)} />
              </div>

              <div>
                <label>Width: {width}</label>
                <select value={width} onChange={(e) => setWidth(e.target.value)}>
                  {[256, 384, 448, 512, 640, 768].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label>Height: {height}</label>
                <select value={height} onChange={(e) => setHeight(e.target.value)}>
                  {[256, 384, 448, 512, 640, 768].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <label>Seed (empty for random)</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Random..."
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <button className="generate-btn" onClick={generateImage} disabled={loading}>
              {loading ? "Processing..." : "Generate Image"}
            </button>
          </div>

          <div className="image-container">
            {loading && <div className="loader-spinner"></div>}
            {!loading && !image && <div className="placeholder">Ready to generate</div>}
            {image && <img src={image} alt="result" className="main-result" />}
          </div>
        </div>
      )}

      {/* Latent Explorer Tab ... аналогично с добавлением width/height если нужно */}
    </div>
  );
}

export default App;