import torch
from torch import nn

def convert_model_weights(input_file: str, device: str) -> dict[str, torch.Tensor]:

    checkpoint = torch.load(input_file, map_location = device, weights_only = False)

    converted = {}
    converted["params_ema"] = {}

    converted["params_ema"]["initial.weight"] = checkpoint["conv_first.weight"]
    converted["params_ema"]["initial.bias"] = checkpoint["conv_first.bias"]
    
    for j in range(23):
        for z in range(3):
            for i in range(5):
                converted["params_ema"]["residuals."+str(j)+".rrdb."+str(z)+".blocks."+str(i)+".cnn.weight"] = checkpoint["body."+str(j)+".rdb"+str((z+1))+".conv"+str((i+1))+".weight"]
                converted["params_ema"]["residuals."+str(j)+".rrdb."+str(z)+".blocks."+str(i)+".cnn.bias"] = checkpoint["body."+str(j)+".rdb"+str((z+1))+".conv"+str((i+1))+".bias"]
    
    converted["params_ema"]["conv.weight"] = checkpoint["conv_body.weight"] 
    converted["params_ema"]["conv.bias"] = checkpoint["conv_body.bias"]

    for i in range(2):
        converted["params_ema"]["upsamples."+str(i)+".conv.weight"] = checkpoint["conv_up"+str(i+1)+".weight"]
        converted["params_ema"]["upsamples."+str(i)+".conv.bias"] = checkpoint["conv_up"+str(i+1)+".bias"]

    converted["params_ema"]["final.0.weight"] = checkpoint["conv_hr.weight"]
    converted["params_ema"]["final.0.bias"] = checkpoint["conv_hr.bias"]
    converted["params_ema"]["final.2.weight"] = checkpoint["conv_last.weight"]
    converted["params_ema"]["final.2.bias"] = checkpoint["conv_last.bias"]
    

    return converted