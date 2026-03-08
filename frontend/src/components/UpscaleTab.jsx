import React, { useState } from 'react';

const UpscaleTab = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [upscaledImage, setUpscaledImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUpscaledImage(null); // Сброс предыдущего результата
    }
  };

  const handleUpscale = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Отправляем файл на эндпоинт апскейла
      const response = await fetch("http://localhost:8000/upscale-file/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upscale failed");

      const blob = await response.blob();
      setUpscaledImage(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Error during upscale");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upscale-container">
      <h2>Image Upscale (ESRGAN)</h2>
      
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {previewUrl && (
          <div className="preview">
            <p>Original Preview:</p>
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '300px' }} />
          </div>
        )}
      </div>

      <button onClick={handleUpscale} disabled={!selectedFile || loading}>
        {loading ? "Upscaling..." : "Start Upscale"}
      </button>

      <hr />

      {upscaledImage && (
        <div className="result-section">
          <h3>Upscaled Result:</h3>
          <img src={upscaledImage} alt="Upscaled" style={{ width: '100%' }} />
          <a href={upscaledImage} download="upscaled.png">Download Result</a>
        </div>
      )}
    </div>
  );
};

export default UpscaleTab;