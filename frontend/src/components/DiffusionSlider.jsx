import React, { useState, useEffect } from 'react';

const DiffusionSlider = ({ intermediates, totalSteps, width, height }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Когда приходят новые результаты генерации, сбрасываем слайдер на финальное фото
    useEffect(() => {
        if (intermediates && intermediates.length > 0) {
            setCurrentIndex(intermediates.length - 1);
        }
    }, [intermediates]);

    if (!intermediates || intermediates.length === 0) return null;

    // Рассчитываем шаг. Если у нас 10 изображений на 50 шагов, шаг = 5.
    const stepSize = totalSteps / intermediates.length;

    const getCurrentStepLabel = (index) => {
        const step = Math.round((index + 1) * stepSize);
        return step >= totalSteps ? "Final Result" : `Step ${step}`;
    };

    return (
        <div className="diffusion-slider-container">
            <h1 className="diffusion-slider-header">Visualize Diffusion Process</h1>
            <div className="image-frame">
                <img 
                    src={intermediates[currentIndex]} 
                    alt={`Generation step ${currentIndex}`} 
                    style={{ 
                        width: `${width}px`, 
                        height: `${height}px`,
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }} 
                />
                <div className="step-badge">{getCurrentStepLabel(currentIndex)}</div>
            </div>

            <div className="slider-controls">
                <input 
                    type="range" 
                    min="0" 
                    max={intermediates.length - 1} 
                    value={currentIndex} 
                    onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                    className="custom-range-slider"
                />
                <div className="slider-labels">
                    <span>Step {Math.round(stepSize)}</span>
                    <span className="current-label">{getCurrentStepLabel(currentIndex)}</span>
                    <span>Final</span>
                </div>
            </div>
        </div>
    );
};

export default DiffusionSlider;