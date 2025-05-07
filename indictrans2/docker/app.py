from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import os

app = FastAPI()

# Define the prompt input model for translation request
class TranslationRequest(BaseModel):
    text: str
    target_language: str

# Load the translation model (You can replace this with your specific model for translation)
translation_pipeline = pipeline("translation", model="Helsinki-NLP/opus-mt-en-de")  # Example: English to German

@app.post("/translate")
def translate_text(data: TranslationRequest):
    try:
        # Perform translation based on the input text and target language
        translation = translation_pipeline(data.text, target_lang=data.target_language)
        
        # Return the translated text
        return {"original_text": data.text, "translated_text": translation[0]['translation_text']}
    
    except Exception as e:
        return {"error": f"Translation failed: {str(e)}"}

