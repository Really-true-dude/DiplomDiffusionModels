import React, { useState } from "react";

function LatentExplorer() {

  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState(0);
  const [latentImage, setLatentImage] = useState(null);

  const loadLatent = async () => {

    const res = await fetch("http://localhost:5000/latent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        step: step,
        channel: channel
      })
    });

    const data = await res.json();
    setLatentImage(`data:image/png;base64,${data.image}`);

  };

  return (
    <div className="latent-container">

      <h2>Latent Explorer</h2>

      <label>Diffusion Step</label>
      <input
        type="range"
        min="0"
        max="50"
        value={step}
        onChange={(e) => setStep(e.target.value)}
      />

      <label>Latent Channel</label>
      <input
        type="range"
        min="0"
        max="3"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
      />

      <button onClick={loadLatent}>
        Visualize
      </button>

      <div className="latent-image">

        {latentImage ? (
          <img src={latentImage} alt="latent"/>
        ) : (
          <p>No latent selected</p>
        )}

      </div>

    </div>
  );
}

export default LatentExplorer;
