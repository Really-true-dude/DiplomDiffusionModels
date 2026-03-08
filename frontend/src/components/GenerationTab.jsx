import React, { useState, useEffect } from 'react';
import './GenerationTab.css';

const GenerationTab = () => {
    const [models, setModels] = useState([]);
    const [modelPath, setModelPath] = useState("");
    const [loadingModels, setLoadingModels] = useState(true);

    const [positivePrompt, setPositivePrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const [seed, setSeed] = useState("");
    const [width, setWidth] = useState(512);
    const [height, setHeight] = useState(512);
    const [steps, setSteps] = useState(20);
    // const [modelPath, setModelPath] = useState("models/v1-5-pruned-emaonly.safetensors");

    const [image, setImage] = useState(null);
    const [lastImagePath, setLastImagePath] = useState("");
    const [latents, setLatents] = useState(null);
    const [loading, setLoading] = useState(false);

    // Загрузка моделей при монтировании компонента
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch("http://localhost:8000/models");
                const data = await response.json();
                setModels(data);
                
                // Устанавливаем первую модель по умолчанию, если путь еще не выбран
                if (data.length > 0) {
                    setModelPath(data[0].value);
                }
            } catch (err) {
                console.error("Failed to fetch models:", err);
            } finally {
                setLoadingModels(false);
            }
        };

        fetchModels();
    }, []);

    const generateImage = async () => {
        setLoading(true);
        if (image && image.startsWith('blob:')) {
            URL.revokeObjectURL(image);
        }
        setImage(null);

        const seedValue = seed.trim() === "" ? null : parseInt(seed);

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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Generation failed");
            }

            const data = await response.json();
            setImage(`data:image/png;base64,${data.image}`);
            setLastImagePath(data.file_path);
            setLatents(data.latents);
        } catch (err) {
            console.error("Generation error:", err);
            alert("Ошибка при генерации: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="gen-container tab-fade-in">
            <div className="generation-layout">
                <aside className="controls-panel">
                    <div className="panel-section">
                        <h3>Prompts</h3>
                        <div className="input-wrapper">
                            <label>Positive Prompt</label>
                            <textarea 
                                value={positivePrompt} 
                                onChange={(e) => setPositivePrompt(e.target.value)} 
                                placeholder="Describe what you want to create..."
                            />
                        </div>
                        <div className="input-wrapper">
                            <label>Negative Prompt</label>
                            <textarea 
                                value={negativePrompt} 
                                onChange={(e) => setNegativePrompt(e.target.value)} 
                                placeholder="Describe what to avoid..."
                            />
                        </div>
                    </div>

                    <div className="panel-section">
                        <h3><span className="icon">⚙️</span> Configuration</h3>
                        <div className="settings-grid">
                            <div className="setting-item full-width">
                                <label>Model Checkpoint</label>
                                <select 
                                    className="model-select"
                                    value={modelPath} 
                                    onChange={(e) => setModelPath(e.target.value)}
                                    disabled={loadingModels}
                                >
                                    {loadingModels ? (
                                        <option>Loading models...</option>
                                    ) : (
                                        models.map((m, index) => (
                                            <option key={index} value={m.value}>
                                                {m.name || m.value.split('/').pop()}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Seed</label>
                                <input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Random" />
                            </div>
                            <div className="setting-item">
                                <label>Steps</label>
                                <select className="model-select" value={steps} onChange={(e) => setSteps(e.target.value)}>
                                {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                {/* <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} /> */}
                            </div>
                            <div className="setting-item">
                                <label>Width</label>
                                <select className="model-select" value={width} onChange={(e) => setWidth(e.target.value)}>
                                {[512, 768].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="setting-item">
                                <label>Height</label>
                                <select className="model-select" value={height} onChange={(e) => setHeight(e.target.value)}>
                                {[512, 768].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button 
                        className={`generate-main-btn ${loading ? 'loading' : ''}`} 
                        onClick={generateImage} 
                        disabled={loading}
                    >
                        {loading ? <span className="spinner"></span> : "Generate Masterpiece"}
                    </button>
                </aside>

                {/* Правая колонка: Результат */}
                <section className="preview-panel">
                    {image ? (
                        <div className="result-card">
                            <div className="image-frame">
                                <img 
                                    src={image} 
                                    alt="Generated result" 
                                    style={{ 
                                        width: `${width}px`, 
                                        height: `${height}px`,
                                        maxWidth: '100%',
                                        maxHeight: '100%'
                                    }} 
                                />
                            </div>
                            <div className="result-metadata">
                                <div className="path-info">
                                    <span className="label">Server Path:</span>
                                    <code className="path-text">{lastImagePath.split('\\').pop()}</code>
                                </div>
                                <a className="download-action-btn" href={image} download={`gen_${seed || 'rand'}.png`}>
                                    Download PNG
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="placeholder-icon">{loading ? "⚡" : "🖼️"}</div>
                            <p>{loading ? "Neural networks are dreaming..." : "Your creation will appear here"}</p>
                            {loading && (
                                <div className="progress-bar-wrap">
                                    <div className="progress-bar-fill"></div>
                                </div>
                            )}
                        </div>
                    )}
                </section>
                {/* <section className="preview-panel">
                    {image ? (
                        <div className="result-card">
                            <div className="image-frame">
                                <img src={image} alt="Generated result" />
                            </div>
                            <div className="result-metadata">
                                <div className="path-info">
                                    <span className="label">Server Path:</span>
                                    <code className="path-text">{lastImagePath}</code>
                                </div>
                                <a className="download-action-btn" href={image} download={`gen_${seed || 'rand'}.png`}>
                                    Download PNG
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="placeholder-icon">{loading ? "⚡" : "🖼️"}</div>
                            <p>{loading ? "Neural networks are dreaming..." : "Your creation will appear here"}</p>
                            {loading && <div className="progress-bar-wrap"><div className="progress-bar-fill"></div></div>}
                        </div>
                    )}
                </section> */}
            </div>
        </div>
    );
};

export default GenerationTab;







// import React, { useState } from 'react';

// const GenerationTab = () => {
//     // Основные настройки генерации
//     const [positivePrompt, setPositivePrompt] = useState("");
//     const [negativePrompt, setNegativePrompt] = useState("");
//     const [seed, setSeed] = useState("");
//     const [width, setWidth] = useState(512);
//     const [height, setHeight] = useState(512);
//     const [steps, setSteps] = useState(20);
//     const [modelPath, setModelPath] = useState("models/v1-5-pruned-emaonly.safetensors");

//     // Состояние результата
//     const [image, setImage] = useState(null); // Здесь будет Base64 строка
//     const [lastImagePath, setLastImagePath] = useState(""); // Путь на сервере для апскейла
//     const [latents, setLatents] = useState(null);
//     const [loading, setLoading] = useState(false);

//     const generateImage = async () => {
//         setLoading(true);
//         // Очистка старого URL, если вдруг использовался Blob
//         if (image && image.startsWith('blob:')) {
//             URL.revokeObjectURL(image);
//         }
//         setImage(null);

//         // Обработка сида: пустая строка -> null
//         const seedValue = seed.trim() === "" ? null : parseInt(seed);

//         try {
//             const response = await fetch("http://localhost:8000/generate/", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     prompt: positivePrompt,
//                     uncond_prompt: negativePrompt,
//                     width: parseInt(width),
//                     height: parseInt(height),
//                     steps: parseInt(steps),
//                     model_path: modelPath,
//                     seed: seedValue
//                 }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || "Generation failed");
//             }

//             const data = await response.json();

//             // 1. Устанавливаем картинку из Base64
//             setImage(`data:image/png;base64,${data.image}`);

//             // 2. Сохраняем путь для будущего Upscale во второй вкладке
//             setLastImagePath(data.file_path);

//             // 3. Сохраняем латенты
//             setLatents(data.latents);

//             console.log("Saved at:", data.file_path);

//         } catch (err) {
//             console.error("Generation error:", err);
//             alert("Ошибка при генерации: " + err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="generation-tab">
//             <div className="controls">
//                 <div className="prompt-section">
//                     <label>Positive Prompt</label>
//                     <textarea 
//                         value={positivePrompt} 
//                         onChange={(e) => setPositivePrompt(e.target.value)} 
//                         placeholder="What do you want to see?"
//                     />
                    
//                     <label>Negative Prompt</label>
//                     <textarea 
//                         value={negativePrompt} 
//                         onChange={(e) => setNegativePrompt(e.target.value)} 
//                         placeholder="What to exclude?"
//                     />
//                 </div>

//                 <div className="settings-grid">
//                     <div className="setting-item">
//                         <label>Model Path</label>
//                         <input type="text" value={modelPath} onChange={(e) => setModelPath(e.target.value)} />
//                     </div>
//                     <div className="setting-item">
//                         <label>Seed</label>
//                         <input type="number" value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Random" />
//                     </div>
//                     <div className="setting-item">
//                         <label>Steps</label>
//                         <input type="number" value={steps} onChange={(e) => setSteps(e.target.value)} />
//                     </div>
//                     <div className="setting-item">
//                         <label>Width</label>
//                         <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
//                     </div>
//                     <div className="setting-item">
//                         <label>Height</label>
//                         <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
//                     </div>
//                 </div>

//                 <button 
//                     className="generate-btn" 
//                     onClick={generateImage} 
//                     disabled={loading}
//                 >
//                     {loading ? "Generating..." : "Generate Image"}
//                 </button>
//             </div>

//             <div className="preview-section">
//                 {image ? (
//                     <div className="result-container">
//                         <img src={image} alt="Generated" />
//                         <div className="info">
//                             <p><strong>Path:</strong> {lastImagePath}</p>
//                             <a href={image} download={`gen_${seed || 'rand'}.png`}>Download</a>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="placeholder">
//                         {loading ? "Magic is happening..." : "Ready to generate"}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default GenerationTab;