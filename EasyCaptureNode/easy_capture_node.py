import os
import io
from server import PromptServer
from aiohttp import web
from PIL import Image, ImageOps
import torch
import numpy as np
import base64
from io import BytesIO
from server import PromptServer, BinaryEventTypes

def log(*text):
    print(''.join(map(str, text)))

class EasyCaptureNode:
    '''Node to load images directly from Krita or other external sources
    without needing to previously upload a file to inputs directory. Intended
    to be used in API only and not the web UI.'''
    def __init__(self) -> None:
        pass

    @classmethod
    def INPUT_TYPES(s):
        # return {"required": {"image": ("STRING", {"multiline": True})}}
        return {
            "required": {
                "image": ("STRING", {})
            },
            "optional": {
              "text": ("STRING", {"forceInput": True}),     
            },
        }

    RETURN_TYPES = ("IMAGE", "MASK")
    FUNCTION = "load_image"

    CATEGORY = "Easy Nodes"

    def load_image(self, image):
        try:
            # print("image:", image)
            defaultImgData = '/9j/4AAQSkZJRgABAgAAZABkAAD/7AARRHVja3kAAQAEAAAAPAAA/+4ADkFkb2JlAGTAAAAAAf/bAIQABgQEBAUEBgUFBgkGBQYJCwgGBggLDAoKCwoKDBAMDAwMDAwQDA4PEA8ODBMTFBQTExwbGxscHx8fHx8fHx8fHwEHBwcNDA0YEBAYGhURFRofHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8f/8AAEQgAAQABAwERAAIRAQMRAf/EAEoAAQAAAAAAAAAAAAAAAAAAAAgBAQAAAAAAAAAAAAAAAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AFSD/9k='
            if(image == 'data:,'):  #no image input
                image = defaultImgData
            imgdata = base64.b64decode(image)
            i = Image.open(io.BytesIO(imgdata))
            i = ImageOps.exif_transpose(i)
            image = i.convert("RGB")
            image = np.array(image).astype(np.float32) / 255.0
            image = torch.from_numpy(image)[None,]
            if 'A' in i.getbands():
                mask = np.array(i.getchannel('A')).astype(np.float32) / 255.0
                mask = 1. - torch.from_numpy(mask)
            else:
                mask = torch.zeros((64,64), dtype=torch.float32, device="cpu")
            return (image, mask)
        except ValueError as ex:
            print(str(ex))



NODE_CLASS_MAPPINGS = {
    "EasyCaptureNode": EasyCaptureNode,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "EasyCaptureNode": "Capture screen and convert to base64 encoded image",
}