import React, { useState, useEffect, useRef } from 'react';

const API_BASE = "http://localhost:8000";

const LatentVisualizer = () => {
  const [coords, setCoords] = useState({ z1: 0, z2: 0 });
  const [latentPoints, setLatentPoints] = useState([]);
  const canvasRef = useRef(null);
  const DIGIT_COLORS = [
  '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
  '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe'
  ];
  const Legend = () => (
    <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '8px', 
        background: 'white', 
        padding: '10px', 
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '12px'
    }}>
        {DIGIT_COLORS.map((color, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
            <span>Digit {i}</span>
        </div>
        ))}
    </div>
  );

  // Load the background scatter plot (the "map")
  useEffect(() => {
    // results of encoder.predict(x_test)
    fetch(`${API_BASE}/latent-map`)
      .then(res => res.json())
      .then(data => setLatentPoints(data.points)); // Expected: [{x: 1.2, y: -0.5, label: 7}, ...]
  }, []);

  // Fetch and Draw the image whenever coordinates change
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`${API_BASE}/vae_viz?z1=${coords.z1}&z2=${coords.z2}`);
        const data = await res.json();
        
        // Only draw if image data actually exists
        if (data && data.image) {
          drawToCanvas(data.image);
        }
      } catch (err) {
        console.error("Backend offline or error:", err);
      }
    };

    fetchImage();
  }, [coords]);

  // Helper to draw the 28x28 array to the HTML5 Canvas
  const drawToCanvas = (pixelData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(28, 28);

    // pixelData is a 2D array [28][28] from FastAPI
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 28; x++) {
        const val = pixelData[y][x] * 255;
        const index = (y * 28 + x) * 4;
        imageData.data[index] = val;     // Red
        imageData.data[index + 1] = val; // Green
        imageData.data[index + 2] = val; // Blue
        imageData.data[index + 3] = 255; // Alpha
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  // Handle clicking on the scatter plot
  const handleSvgClick = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Map SVG pixels back to latent space coordinates (e.g., -4 to 4)
    const x = ((e.clientX - rect.left) / rect.width) * 8 - 4;
    const y = 4 - ((e.clientY - rect.top) / rect.height) * 8;
    setCoords({ z1: x, z2: y });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', fontFamily: 'sans-serif', padding: '40px 20px'}}>
        <div style={{textAlign: "center", marginBottom: "30px"}}>
          <h2>Autoencoder Latent Space <span className="badge">VAE</span></h2>
          <p>Watch in real-time as the VAE decoder morphs abstract 2D coordinates into recognizable images.</p>
        </div>
        
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center', background: '#f5f5f5', padding: '30px', borderRadius: '15px' }}>
        
        {/* LATENT SPACE INTERFACE */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Click the map to explore</p>
          <svg 
            width="300" height="300" 
            style={{ background: 'white', border: '1px solid #ccc', cursor: 'crosshair' }}
            onClick={handleSvgClick}
          >
            {/* Background Points (The "Map") */}
            {latentPoints.map((p, i) => (
            <circle 
                key={i} 
                cx={(p.x + 4) * 37.5} 
                cy={300 - (p.y + 4) * 37.5} 
                r="2" 
                // Use the color based on the digit label (0-9)
                fill={DIGIT_COLORS[p.label] || '#ccc'}  
                opacity="0.6"
            />
            ))}
            {/* Crosshair for current selection */}
            <line x1="0" y1={300 - (coords.z2 + 4) * 37.5} x2="300" y2={300 - (coords.z2 + 4) * 37.5} stroke="red" strokeWidth="1" opacity="0.5" />
            <line x1={(coords.z1 + 4) * 37.5} y1="0" x2={(coords.z1 + 4) * 37.5} y2="300" stroke="red" strokeWidth="1" opacity="0.5" />
          </svg>
          <div style={{ marginTop: '10px', color: '#444' }}>
            x: <strong>{coords.z1.toFixed(2)}</strong> | y: <strong>{coords.z2.toFixed(2)}</strong>
          </div>
        </div>

        {/* DECODER OUTPUT */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666' }}>Decoded Digit</p>
          <canvas 
            ref={canvasRef} 
            width="28" height="28" 
            style={{ 
              width: '200px', height: '200px', 
              imageRendering: 'pixelated', // Keeps it from getting blurry
              border: '4px solid #333',
              background: 'black'
            }} 
          />
        </div>

      </div>
    </div>
  );
};

export default LatentVisualizer;