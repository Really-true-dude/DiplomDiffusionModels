import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import torch
import io
import gc
import uuid
import os
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
# from fastapi.responses import StreamingResponse
from PIL import Image
from pydantic import BaseModel
from typing import Optional
from transformers import CLIPTokenizer
from torchvision.utils import save_image
from datetime import datetime

# Импортируем вашу функцию и загрузчик из существующих файлов
from pipeline import generate
from model_loader import preload_models_from_standard_weights 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ], # адрес фронтенда
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальная переменная для хранения моделей в памяти (чтобы не загружать их каждый раз)
OUTPUT_DIR = "output/sd/"
MODEL_DIR = "data/" # путь к моделям
MODELS_CACHE = {}
CURRENT_MODEL_PATH = None

# tokenizer
try:
    print("Loading Tokenizer..", end = '\t')
    tokenizer = CLIPTokenizer(vocab_file="data/vocab.json", merges_file="data/merges.txt")
    print("Tokenizer loaded.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load tokenizer: {e}")

class GenerateRequest(BaseModel):
    prompt: str
    uncond_prompt: str = "" # Negative prompt
    width: int = 512
    height: int = 512
    steps: int = 50
    model_path: str
    seed: Optional[int] = None 

def get_models(model_path: str):
    """Загружает модели, если они еще не загружены или путь изменился."""
    global MODELS_CACHE, CURRENT_MODEL_PATH

    if MODELS_CACHE != {} and CURRENT_MODEL_PATH != model_path:
        print(f"Cleaning up old model weights from {CURRENT_MODEL_PATH}...")
        
        MODELS_CACHE = {}         
        gc.collect()
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.ipc_collect() # Дополнительная очистка межпроцессорного кэша
            print("VRAM cleared.")

    if MODELS_CACHE == {} or CURRENT_MODEL_PATH != model_path:
        print(f"Loading models from {model_path}...")
        # Предполагаем, что функция возвращает словарь с ключами "clip", "diffusion", etc.
        device = "cuda" if torch.cuda.is_available() else "cpu"
        MODELS_CACHE = preload_models_from_standard_weights(model_path, device=device)
        CURRENT_MODEL_PATH = model_path
    return MODELS_CACHE

@app.get("/models")
async def list_models():
    try:
        valid_extensions = ('.ckpt', '.safetensors')        
        files = [
            {
                "label": f, 
                "value": os.path.join(MODEL_DIR, f).replace("\\", "/")
            }
            for f in os.listdir(MODEL_DIR)
            if f.endswith(valid_extensions)
        ]
        return files
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate/")
async def generate_endpoint(request: GenerateRequest):
    try:
        # 1. Получаем/загружаем модели
        models = get_models(request.model_path)
        
        # 2. Запускаем генерацию
        # Передаем параметры из вашего существующего pipeline.py
        output_image = generate(
            prompt=request.prompt,
            uncond_prompt=request.uncond_prompt,
            input_image=None,
            models=models,
            n_inference_steps=request.steps,
            WIDTH=request.width,
            HEIGHT=request.height,
            seed=request.seed,
            device="cuda" if torch.cuda.is_available() else "cpu",
            tokenizer = tokenizer
        )

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:6]
        file_name = f"{unique_id}_{timestamp}.png"
        file_path = os.path.join(OUTPUT_DIR, file_name)

        print(f"Saving image in path: {file_path}..", end = '\t')
        Image.fromarray(output_image).save(file_path)
        print(f"Image saved.")

        return FileResponse(
            path=file_path, 
            media_type="image/png", 
            filename=file_name
        )

        # # 3. Конвертируем numpy array в PIL Image
        # # В pipeline.py возвращается images[0], который уже в uint8
        # img = Image.fromarray(output_array)

        # 4. Сохраняем в буфер для отправки по HTTP
        # buffer = io.BytesIO()
        # img.save(buffer, format="PNG")
        # buffer.seek(0)

        # return StreamingResponse(buffer, media_type="image/png")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)