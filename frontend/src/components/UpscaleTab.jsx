import React, { useState } from 'react';
import './UpscaleTab.css';

const UpscaleTab = () => {
  const [imagePreview, setImagePreview] = useState(null); 
  const [rawFile, setRawFile] = useState(null);           
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRawFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleUpscale = async () => {
    if (!rawFile) { 
      alert("Сначала выберите файл!");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    
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
        <h2>Image Upscaler <span className="badge">x4</span></h2>
        <p>Increasing resolution without loss of quality using Real-ESRGAN</p>
      </div>

      <div className="upscale-workspace">
        {/* Секция загрузки/оригинала */}
        <div className={`drop-zone ${imagePreview ? 'has-image' : ''}`}>
          <label className="upload-btn">
            <input type="file" onChange={handleUpload} hidden />
          {!imagePreview ? (
              <span>📁 Choose Local Image</span>
          ) : (
            <div className='drop-zone-img-frame'>
              <img src={imagePreview} alt="Original" className="preview-img" />
            </div>
          )}
          </label>
        </div>
        {/* <div className={`drop-zone ${imagePreview ? 'has-image' : ''}`}>
          {!imagePreview ? (
            <label className="upload-btn">
              <input type="file" onChange={handleUpload} hidden />
              <span>📁 Choose Local Image</span>
            </label>
          ) : (
            <img src={imagePreview} alt="Original" className="preview-img" />
          )}
        </div> */}

        {/* Центральная кнопка */}
        <div className="action-center">
          <button 
            className={`run-btn ${isProcessing ? 'loading' : ''}`}
            onClick={handleUpscale}
            disabled={!imagePreview || isProcessing}
          >
            {isProcessing ? "Upscaling..." : "UPSCALE"}
          </button>
          {result ? (
            <div className="download-link">
              <a href={result} download="upscaled.png" className='download-action-btn'>Download PNG</a>
            </div>
          ) : ""}
        </div>

        {/* Секция результата */}
        <div className="result-zone">
          {result ? (
            <div className="result-wrapper">
              <div className='result-zone-img-frame'>
               <img src={result} alt="Upscaled" />
              </div>
            </div>
          ) : (
            <div className="empty-result">Result will appear here</div>
          )}
        </div>
      </div>
      {/* {result ? (
        <div className="download-link">
          <p>Your image was succesfuly upscaled</p>
          <a href={result} download="upscaled.png" className='download-action-btn'>Download Result</a>
        </div>
        ) : ""} */}
    </div>
  );
};

export default UpscaleTab;