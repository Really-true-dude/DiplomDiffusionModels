import torch
import numpy as np
from tqdm import tqdm
from ddpm import DDPMSampler


def generate(prompt: str, 
             uncond_prompt: str,
             input_image=None, 
             strength=0.8, 
             do_cfg=True, 
             cfg_scale=7.5, 
             sampler_name="ddpm", 
             n_inference_steps=50, 
             models={},
             HEIGHT = 512,
             WIDTH = 512, 
             seed=None,
             device = None,
             idle_device = None,
             tokenizer=None
             ):
    
    LATENTS_WIDTH = WIDTH // 8
    LATENTS_HEIGHT = HEIGHT // 8

    with torch.no_grad():
        if not (0 < strength <= 1):
            raise ValueError("Strength must be between 0 and 1")
        
        if idle_device:
            to_idle = lambda x: x.to(idle_device)
        else:
            to_idle = lambda x : x

        generator = torch.Generator(device=device)
        if seed is None:
            generator.seed()
        else:
            generator.manual_seed(seed)

        clip = models["clip"]
        clip.to(device)

        if do_cfg:
            # Convert the prompt into tokens using the tokenizer
            cond_tokens = tokenizer([prompt], padding="max_length", max_length=77).input_ids
            # cond_tokens = tokenizer.batch_encode_plus([prompt], padding="max_length", max_length=77).input_ids
            # (Batch_size, Seq_len)
            cond_tokens = torch.tensor(cond_tokens, dtype=torch.long, device=device)
            # (Batch_size, Seq_len) -> (Batch_size, Seq_len, Dim)
            cond_context = clip(cond_tokens)

            uncond_tokens = tokenizer([uncond_prompt], padding="max_length", max_length=77).input_ids
            # uncond_tokens = tokenizer.batch_encode_plus([uncond_prompt], padding="max_length", max_length=77).input_ids
            uncond_tokens = torch.tensor(uncond_tokens, dtype=torch.long, device = device)
            # (Batch_size, Seq_Len) -> (Batch_size, Seq_len, Dim)
            uncond_context = clip(uncond_tokens)

            # (2, Seq_len, Dim) = (2, 77, 768)
            context = torch.cat([cond_context, uncond_context])
        else:
            # Convert it into a list of tokens
            tokens = tokenizer.batch_encode_plus([prompt], padding = "max_length", max_length=77).input_ids
            tokens = torch.tensor(tokens, dtype=torch.long, device=device)
            # (1, 77, 768)
            context = clip(tokens)
        to_idle(clip)

        if sampler_name == "ddpm":
            sampler = DDPMSampler(generator)
            sampler.set_inference_steps(n_inference_steps)
        else:
            raise ValueError(f"Unknown sampler {sampler_name}")
        
        latents_shape = (1, 4, LATENTS_HEIGHT, LATENTS_WIDTH)

        if input_image:
            encoder = models["encoder"]
            encoder.to(device)

            input_image_tensor = input_image.resize((WIDTH, HEIGHT))
            input_image_tensor = np.array(input_image_tensor)
            # (Height, Width, Channels = 3)
            input_image_tensor = torch.tensor(input_image_tensor, dtype=torch.float32)
            input_image_tensor = rescale(input_image_tensor, (0, 255), (-1, 1))

            # (Height, Width, Channels) -> (Batch, Height, Width, Channels)
            input_image_tensor = input_image_tensor.unsqueeze(dim=0)
            # make channels first -> (Batch, Channels, Height, Width)
            input_image_tensor = input_image_tensor.permute(0, 3, 1, 2)

            encoder_noise = torch.randn(latents_shape, generator=generator, device=device)
            # run image through the encoder
            latents = encoder(input_image_tensor, encoder_noise)

            sampler.set_strength(strength=strength)
            latents = sampler.add_noise(latents, sampler.timestep[0])

            to_idle(encoder)
        else:
            # If we do txt2img then generate random noise N(0, I)
            latents = torch.randn(latents_shape, generator=generator, device=device)

        diffusion = models["diffusion"]
        diffusion.to(device)

        timesteps = tqdm(sampler.timesteps)
        for i, timestep in enumerate(timesteps):
            # (1, 320)
            time_embedding = get_time_embedding(timestep).to(device)
            # latents : (Batch, 4, Latents_height, latents_width)
            model_input = latents

            if do_cfg:
                # (batch, 4, Latents_height, latents_width) -> (2 * batch, 4, Latents_height, latents_width)
                model_input = model_input.repeat(2, 1, 1, 1)

            # model output is the noise predicted by the UNET
            model_output = diffusion(model_input, context, time_embedding)

            if do_cfg:
                output_cond, output_uncond = model_output.chunk(2, dim=0)
                
                model_output = cfg_scale * (output_cond - output_uncond) + output_uncond # formula of the classifier-free-guidance

            # Remove the noise predicted by the UNET with Sampler(Scheduler)
            latents = sampler.step(timestep, latents, model_output)

        to_idle(diffusion)

        decoder = models["decoder"]
        decoder.to(device)

        images = decoder(latents)
        to_idle(decoder)

        images = rescale(images, (-1, 1), (0, 255), clamp=True)
        # (Batch, Channels, Height, Width) -> (Batch, Height, Width, Channels)
        images = images.permute(0, 2, 3, 1)
        images = images.to("cpu", torch.uint8).numpy()


        return images[0]
        
def rescale(x, old_range, new_range, clamp=False):
    old_min, old_max = old_range
    new_min, new_max = new_range

    x -= old_min
    x *= (new_max - new_min) / (old_max - old_min)
    x += new_min
    if clamp:
        x = x.clamp(new_min, new_max)
    return x

def get_time_embedding(timestep):
    # same as positional encoder in the transformer
    # (160)
    freqs = torch.pow(10000, - torch.arange(start=0, end=160, dtype = torch.float32) / 160)
    # (1, 160)
    x = torch.tensor([timestep], dtype=torch.float32)[: , None] * freqs[None]
    # (1, 320)
    return torch.cat([torch.cos(x), torch.sin(x)], dim=-1)
