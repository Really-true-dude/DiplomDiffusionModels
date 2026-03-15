import React, { useState } from 'react';
import './UpscaleTab.css';

const UpscaleTab = () => {
  const [imagePreview, setImagePreview] = useState(null); // Для тега <img> (превью)
  const [rawFile, setRawFile] = useState(null);           // Сам объект файла (для бэкенда)
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawFile(file); // КЛАДЕМ СЮДА ОБЪЕКТ ФАЙЛА
      setImagePreview(URL.createObjectURL(file)); // КЛАДЕМ СЮДА ССЫЛКУ ДЛЯ ПРЕДПРОСМОТРА
    }
  };

  const handleUpscale = async () => {
    if (!rawFile) { // Проверяем наличие именно файла
      alert("Сначала выберите файл!");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    
    // Отправляем именно rawFile (объект File), а не строковую ссылку imagePreview
    formData.append('file', rawFile); 

    try {
      const response = await fetch("http://localhost:8000/upscale", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка сервера:", errorData);
        return;
      }

      const data = await response.json();
      setResult(`data:image/png;base64,${data.image}`);
    } catch (err) {
      console.error("Ошибка при запросе:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="upscale-container fade-in">
      <div className="upscale-header">
        <h2>Image Upscaler <span className="badge">AI x4</span></h2>
        <p>Увеличение разрешения без потери качества с помощью Real-ESRGAN</p>
      </div>

      <div className="upscale-workspace">
        {/* Секция загрузки/оригинала */}
        <div className={`drop-zone ${imagePreview ? 'has-image' : ''}`}>
          {!imagePreview ? (
            <label className="upload-btn">
              <input type="file" onChange={handleUpload} hidden />
              <span>📁 Выберите изображение</span>
            </label>
          ) : (
            <img src={imagePreview} alt="Original" className="preview-img" />
          )}
        </div>

        {/* Центральная кнопка */}
        <div className="action-center">
          <button 
            className={`run-btn ${isProcessing ? 'loading' : ''}`}
            onClick={handleUpscale}
            disabled={!imagePreview || isProcessing}
          >
            {isProcessing ? "Увеличиваем..." : "ВЫПОЛНИТЬ АПСКЕЙЛ"}
          </button>
        </div>

        {/* Секция результата */}
        <div className="result-zone">
          {result ? (
            <div className="result-wrapper">
               <img src={result} alt="Upscaled" />
               <a href={result} download="upscaled.png" className="download-link">Скачать результат</a>
            </div>
          ) : (
            <div className="empty-result">Результат появится здесь</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpscaleTab;