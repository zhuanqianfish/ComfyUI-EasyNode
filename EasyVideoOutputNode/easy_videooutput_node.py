from PIL import Image, ImageOps
import base64
import numpy as np
from io import BytesIO

def log(*text):
    print(''.join(map(str, text)))

# Tensor to PIL
def tensor2pil(image):
    return Image.fromarray(np.clip(255. * image.cpu().numpy().squeeze(), 0, 255).astype(np.uint8))

class EasyVideoOutputNode:
    '''Node to output image in a video tag '''
    def __init__(self) -> None:
        pass

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE", {"forceInput": True})
            }
        }
    OUTPUT_NODE = True

    RETURN_TYPES = ()
    FUNCTION = "load_image"

    CATEGORY = "Easy Nodes"

    def load_image(self, images):
        results = list()
    
        for image in images:
            image=tensor2pil(image)
            # image_base64 = base64.b64encode(image.tobytes())

            buffered = BytesIO()
            image.save(buffered, format="JPEG")
            image_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

            results.append(image_base64)
  

        return { "ui": { "images_": results } }




NODE_CLASS_MAPPINGS = {
    "EasyVideoOutputNode": EasyVideoOutputNode,
}

# A dictionary that contains the friendly/humanly readable titles for the nodes
NODE_DISPLAY_NAME_MAPPINGS = {
    "EasyVideoOutputNode": "output images as video and it can play Picture-in-Picture ",
}