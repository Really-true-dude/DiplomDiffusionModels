import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import torch
import base64
from io import BytesIO
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
UPSCALE_DIR = "output/upscaled/"
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

class UpscaleRequest(BaseModel):
    image_path: str
    upscaler_path: str = "esrgan/weights/R-ESRGAN_x4.pth"


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

# @app.post("/generate/")
# async def generate_endpoint(request: GenerateRequest):
#     try:
#         models = get_models(request.model_path)

#         output_image = generate(
#             prompt=request.prompt,
#             uncond_prompt=request.uncond_prompt,
#             input_image=None,
#             models=models,
#             n_inference_steps=request.steps,
#             WIDTH=request.width,
#             HEIGHT=request.height,
#             seed=request.seed,
#             device="cuda" if torch.cuda.is_available() else "cpu",
#             tokenizer = tokenizer
#         )

#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         unique_id = uuid.uuid4().hex[:6]
#         file_name = f"{unique_id}_{timestamp}.png"
#         file_path = os.path.join(OUTPUT_DIR, file_name)

#         print(f"Saving image in path: {file_path}..", end = '\t')
#         pil_img = Image.fromarray(output_image)
#         pil_img.save(file_path)
#         print(f"Image saved.")

#         buffered = BytesIO()
#         pil_img.save(buffered, format="PNG")
#         img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

#         latents_list = None
        
#         return {
#             "image": img_base64,       
#             "file_path": file_path,   
#             "file_name": file_name,
#             "latents": latents_list  
#         }

#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/")
async def generate_image(request: GenerateRequest):
     try:
        models = get_models(request.model_path)
        # Он вернет список: [img_step5, img_step10, ..., final_img]
        all_images_np = generate(
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

        # 2. Функция для конвертации numpy -> Base64
        def to_base64(img_np):
            pil_img = Image.fromarray(img_np)
            buff = BytesIO()
            pil_img.save(buff, format="PNG")
            return base64.b64encode(buff.getvalue()).decode("utf-8")

        # 3. Кодируем все промежуточные изображения
        # Кроме последнего, так как последнее мы обработаем отдельно
        intermediates_b64 = [to_base64(img) for img in all_images_np[:-1]]

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:6]
        file_name = f"{unique_id}_{timestamp}.png"
        file_path = os.path.join(OUTPUT_DIR, file_name)

        # 4. Сохраняем ТОЛЬКО финальное изображение на диск
        final_np = all_images_np[-1]
        final_pil = Image.fromarray(final_np)
        final_pil.save(file_path)

        intermediates_b64.append(to_base64(final_np))

        # 5. Возвращаем ответ
        return {
            "image": to_base64(final_np),          # Финальное в Base64 для мгновенного показа
            "intermediates": intermediates_b64,     # Массив промежуточных в Base64
            "file_path": file_path,                 # Путь только к одному файлу
            "seed": request.seed
        }
     
     except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upscale")
async def upscale_endpoint(request: UpscaleRequest):
    try:
        # Проверяем, существует ли исходный файл
        if not os.path.exists(request.image_path):
            raise HTTPException(status_code=404, detail="Original image not found")

        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Вызываем твою функцию апскейла
        # Она сама сохранит файл внутри через твою функцию save()
        # Нам нужно только понять, под каким именем он сохранился
        
        # Чтобы точно вернуть правильный файл, можно немного модифицировать 
        # твою функцию save, чтобы она возвращала путь, но пока полагаемся на логику папки
        inference_esrgan(
            save_path=UPSCALE_DIR, 
            image_path=request.image_path, 
            model_path=request.upscaler_path, 
            device=device
        )

        # Берем последний сохраненный файл из папки upscaled
        files = os.listdir(UPSCALE_DIR)
        files.sort() # Сортируем, чтобы взять самый свежий (по твоей нумерации 0001, 0002...)
        last_file = files[-1]
        full_path = os.path.join(UPSCALE_DIR, last_file)

        return FileResponse(
            path=full_path, 
            media_type="image/jpeg", 
            filename=last_file
        )

    except Exception as e:
        print(f"Upscale error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)