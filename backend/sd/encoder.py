import torch
from torch import nn
from torch.nn import functional as F
from decoder import VAE_AttentionBlock, VAE_ResidualBlock

class VAE_Encoder(nn.Sequential):

    def __init__(self):
        super().__init__(

            # (Batch, channel, height, width) -> (Batch size, 128, Height, Width)
            nn.Conv2d(3, 128, kernel_size=3, padding=1),

            # (Batch, 128, height, width) -> (Batch size, 128, Height, Width)
            VAE_ResidualBlock(128, 128),
            VAE_ResidualBlock(128, 128),

            #(Batch, 128, height, width) -> (Batch size, 128, Height / 2, Width / 2)
            nn.Conv2d(128, 128, kernel_size=3, stride=2, padding=0),
            
            #(Batch, 128, height / 2, width / 2) -> (Batch size, 256, Height / 2, Width / 2)
            VAE_ResidualBlock(128, 256),
            VAE_ResidualBlock(256, 256),

            #(Batch, 256, height / 2, width / 2) -> (Batch size, 256, Height / 4, Width / 4)
            nn.Conv2d(256, 256, kernel_size=3, stride=2, padding=0),

            #(Batch, 256, height / 4, width / 4) -> (Batch size, 512, Height / 4, Width / 4)
            VAE_ResidualBlock(256, 512),
            VAE_ResidualBlock(512, 512),

            #(Batch, 512, height / 4, width / 4) -> (Batch size, 512, Height / 8, Width / 8)
            nn.Conv2d(512, 512, kernel_size=3, stride=2, padding=0),

            #(Batch, 512, height / 8, width / 8) -> (Batch size, 512, Height / 8, Width / 8)
            VAE_ResidualBlock(512, 512),
            VAE_ResidualBlock(512, 512),

            VAE_ResidualBlock(512, 512),

            #(Batch, 512, height / 8, width / 8) -> (Batch size, 512, Height / 8, Width / 8)
            VAE_AttentionBlock(512),

            VAE_ResidualBlock(512, 512),

            #(Batch, 512, height / 8, width / 8) -> (Batch size, 512, Height / 8, Width / 8)
            nn.GroupNorm(32, 512),

            nn.SiLU(),

            #(Batch, 512, height / 8, width / 8) -> (Batch size, 8, Height / 8, Width / 8)
            nn.Conv2d(512, 8, kernel_size=3, padding = 1), # bottleneck

            #(Batch, 8, height / 8, width / 8) -> (Batch size, 8, Height / 8, Width / 8)
            nn.Conv2d(8, 8, kernel_size = 1, padding = 0)


        )

    def forward(self, x: torch.Tensor, noise: torch.Tensor) -> torch.Tensor:
        # x : (Batch Size, Channel, Height, Width)
        # noise : (Batch Size, Out_Channel, Height / 8, Width / 8)
        # Run sequentially all of the modules

        for module in self: # to do assimetrical padding
            if getattr(module, "stride", None) == (2, 2):
                # (Padding_left, Padding_right, Padding_Top, Padding_Bottom) 
                x = F.pad(x, (0, 1, 0, 1))
            x = module(x)

        # VAE returns distribution
        # And we need to find its Mean and variance
        
        # (Batch_Size, 8, Height / 8, Width / 8) -> two tensor of shape (Batch_size, 4, Height / 8, Width / 8)
        mean, log_variance = torch.chunk(x, 2, dim=1)

        # Exponent to transform log_var to variance
        log_variance = torch.clamp(log_variance, -30, 20)

        variance = log_variance.exp()
        
        # Calculate standart deviation
        stddev = variance.sqrt()

        # Convert Z = N(0, 1) Distribution -> X = N(mean, variance) ?
        # X = mean * stdev * Z
        x = mean + stddev * noise

        # Scale the output by a constant
        x *= 0.18215

        return x