import model_loader
import pipeline
from PIL import Image
from transformers import CLIPTokenizer
import torch
from safetensors.numpy import load_file
import sys
sys.path.append("esrgan/")
from inference import inference_esrgan, save

DEVICE = "cpu"

WIDTH = 512
HEIGHT = 768

SAVE_PATH = "output/"
DO_UPSCALE = False
UPSCALER_PATH = "esrgan/weights/R-ESRGAN_x4.pth"
ALLOW_CUDA = True

if torch.cuda.is_available() and ALLOW_CUDA:
    DEVICE = "cuda"


print(f"Using device: {DEVICE}")

tokenizer = CLIPTokenizer(vocab_file="data/vocab.json" , merges_file="data/merges.txt")
model_file = "data/RealismFusion.safetensors"
models = model_loader.preload_models_from_standard_weights(model_file, DEVICE)

## TEXT TO IMAGE
prompt = "1girl, blonde hair, short hair, bun, blue eyes, red blazer, white shirt, blue skirt"
uncond_prompt = "bad resolution, worst quality, extra digits, ugly"
do_cfg = True
cfg_scale = 7

## IMAGE TO IMAGE
input_image = None
image_path = ""
# input_image = Image.open(image_path)
strength = 0.8

sampler = "ddpm"
num_inference_steps = 10
seed = None

if __name__ == "__main__":

    output_image = pipeline.generate(
        prompt=prompt,
        uncond_prompt=uncond_prompt,
        input_image=input_image,
        strength=strength,
        do_cfg=do_cfg,
        cfg_scale=cfg_scale,
        sampler_name=sampler,
        n_inference_steps=num_inference_steps,
        seed=seed,
        models=models,
        HEIGHT=HEIGHT,
        WIDTH=WIDTH,
        device=DEVICE,
        idle_device="cpu",
        tokenizer=tokenizer
    )

    image_path = save(SAVE_PATH + "sd/", output_image)

    if DO_UPSCALE:
        SAVE_PATH += "upscaled/"
        inference_esrgan(save_path = SAVE_PATH, image_path = image_path, model_path = UPSCALER_PATH, device=DEVICE)
