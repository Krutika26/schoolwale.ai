# from diffusers import OnnxStableDiffusionPipeline
# from fastapi import FastAPI
# from pydantic import BaseModel

# app = FastAPI()

# class Prompt(BaseModel):
#     prompt: str

# pipe = OnnxStableDiffusionPipeline.from_pretrained(
#     "CompVis/stable-diffusion-v1-4", revision="onnx", provider="CPUExecutionProvider"
# )

# @app.post("/generate")
# def generate_image(data: Prompt):
#     image = pipe(data.prompt).images[0]
#     image.save("output.png")
#     return {"message": "Image generated and saved as output.png"}

# @app.get("/get_image")
# def get_image():
#     image_path = "output.png"
#     if os.path.exists(image_path):
#         return FileResponse(image_path)
#     return {"error": "Image not found"}

import os
from fastapi import FastAPI
from pydantic import BaseModel
from diffusers import OnnxStableDiffusionPipeline
from fastapi.responses import FileResponse

app = FastAPI()

# Define a prompt model for POST request
class Prompt(BaseModel):
    prompt: str

# Load the ONNX model pipeline
pipe = OnnxStableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4", revision="onnx", provider="CPUExecutionProvider"
)

# POST endpoint to generate an image based on the prompt
@app.post("/generate")
def generate_image(data: Prompt):
    image = pipe(data.prompt).images[0]
    image.save("output.png")
    return {"message": "Image generated and saved as output.png"}

# GET endpoint to fetch the generated image
@app.get("/get_image")
def get_image():
    image_path = "output.png"
    if os.path.exists(image_path):
        return FileResponse(image_path)  # Return the image file
    return {"error": "Image not found"}
