from flask import Flask, request, jsonify
import faiss
import numpy as np
import json
import fitz  # PyMuPDF for PDF
from docx import Document  # python-docx for Word
from PIL import Image  # Pillow for image processing
import io
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

dim = 384  # Example, adjust based on your model

INDEX_FILE = "index.faiss"
index = None

def get_index(dimension):
    global index
    if index is None:
        if os.path.exists(INDEX_FILE):
            index = faiss.read_index(INDEX_FILE)
        else:
            index = faiss.IndexFlatL2(dimension)
    return index


import os

INDEX_FILE = "index.faiss"
index = None

def get_index(dimension):
    global index
    if index is None:
        if os.path.exists(INDEX_FILE):
            index = faiss.read_index(INDEX_FILE)
        else:
            index = faiss.IndexFlatL2(dimension)
    return index

@app.route('/add_vectors', methods=['POST'])
def add_vectors():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    file_type = file.content_type
    print(f"File type: {file_type}")

    # Extract text or features based on file type
    if "pdf" in file_type:
        vectors = process_pdf(file)
    elif "word" in file_type:
        vectors = process_word(file)
    elif "image" in file_type:
        vectors = process_image(file)
    else:
        return jsonify({"error": "Unsupported file type"}), 415

    if vectors is None:
        return jsonify({"error": "Failed to process vectors from the file"}), 500

    # Get or create persistent index
    index = get_index(vectors.shape[1])
    index.add(vectors)

    # Save the updated index and metadata
    faiss.write_index(index, INDEX_FILE)
    metadata = {"ntotal": index.ntotal}
    with open("metadata.json", "w") as f:
        json.dump(metadata, f)

    return jsonify({"message": "Vectors added successfully", "ntotal": index.ntotal}), 200

def process_pdf(file):
    pdf_data = file.read()
    doc = fitz.open(stream=io.BytesIO(pdf_data), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text("text")
    
    # Convert text into vectors (placeholder)
    return np.random.rand(10, 128).astype(np.float32)

def process_word(file):
    # Process Word document and extract text
    doc = Document(io.BytesIO(file.read()))
    text = ""
    for para in doc.paragraphs:
        text += para.text
    
    # Convert text into vectors (placeholder, replace with your actual vectorization logic)
    return np.random.rand(10, 128).astype(np.float32)

def process_image(file):
    # Process image and extract features
    img = Image.open(io.BytesIO(file.read()))
    img = img.resize((224, 224))  # Resize image for processing
    img_array = np.array(img)
    
    # Convert image to vector (use a pre-trained model to extract features)
    # Example: using a pre-trained CNN like ResNet50, MobileNet, etc.
    # For simplicity, we use random vectors here. Replace with actual model inference.
    return np.random.rand(10, 128).astype(np.float32)

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "No query provided"}), 400

    # Assuming query is a list of floats (embedding of a query)
    query_vector = np.array([float(x) for x in query.split(',')], dtype=np.float32).reshape(1, -1)
    D, I = index.search(query_vector, k=5)  # Get top 5 results
    
    return jsonify({"distances": D.tolist(), "indices": I.tolist()}), 200

@app.route('/status', methods=['GET'])
def status():
    global index
    if index is None and os.path.exists(INDEX_FILE):
        index = faiss.read_index(INDEX_FILE)
    return jsonify({"ntotal": index.ntotal if index else 0}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
