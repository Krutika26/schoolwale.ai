# from flask import Flask, request, jsonify
# import faiss
# import numpy as np
# import json
# import fitz  # PyMuPDF for PDF
# from docx import Document  # python-docx for Word
# from PIL import Image  # Pillow for image processing
# import io
# import os
# import requests
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# dim = 384  # Example, adjust based on your model

# INDEX_FILE = "index.faiss"
# index = None

# def get_index(dimension):
#     global index
#     if index is None:
#         if os.path.exists(INDEX_FILE):
#             index = faiss.read_index(INDEX_FILE)
#         else:
#             index = faiss.IndexFlatL2(dimension)
#     return index


# import os

# INDEX_FILE = "index.faiss"
# index = None

# def get_index(dimension):
#     global index
#     if index is None:
#         if os.path.exists(INDEX_FILE):
#             index = faiss.read_index(INDEX_FILE)
#         else:
#             index = faiss.IndexFlatL2(dimension)
#     return index

# @app.route('/add_vectors', methods=['POST'])
# def add_vectors():
#     file = request.files.get('file')
#     if not file:
#         return jsonify({"error": "No file uploaded"}), 400

#     file_type = file.content_type
#     print(f"File type: {file_type}")

#     # Extract text or features based on file type
#     if "pdf" in file_type:
#         vectors = process_pdf(file)
#     elif "word" in file_type:
#         vectors = process_word(file)
#     elif "image" in file_type:
#         vectors = process_image(file)
#     else:
#         return jsonify({"error": "Unsupported file type"}), 415

#     if vectors is None:
#         return jsonify({"error": "Failed to process vectors from the file"}), 500

#     # Get or create persistent index
#     index = get_index(vectors.shape[1])
#     index.add(vectors)

#     # Save the updated index and metadata
#     faiss.write_index(index, INDEX_FILE)
#     metadata = {"ntotal": index.ntotal}
#     with open("metadata.json", "w") as f:
#         json.dump(metadata, f)

#     return jsonify({"message": "Vectors added successfully", "ntotal": index.ntotal}), 200

# def process_pdf(file):
#     pdf_data = file.read()
#     doc = fitz.open(stream=io.BytesIO(pdf_data), filetype="pdf")
#     text = ""
#     for page in doc:
#         text += page.get_text("text")
    
#     # Convert text into vectors (placeholder)
#     return np.random.rand(10, 128).astype(np.float32)

# def process_word(file):
#     # Process Word document and extract text
#     doc = Document(io.BytesIO(file.read()))
#     text = ""
#     for para in doc.paragraphs:
#         text += para.text
    
#     # Convert text into vectors (placeholder, replace with your actual vectorization logic)
#     return np.random.rand(10, 128).astype(np.float32)

# def process_image(file):
#     # Process image and extract features
#     img = Image.open(io.BytesIO(file.read()))
#     img = img.resize((224, 224))  # Resize image for processing
#     img_array = np.array(img)
    
#     # Convert image to vector (use a pre-trained model to extract features)
#     # Example: using a pre-trained CNN like ResNet50, MobileNet, etc.
#     # For simplicity, we use random vectors here. Replace with actual model inference.
#     return np.random.rand(10, 128).astype(np.float32)

# @app.route('/search', methods=['GET'])
# def search():
#     query = request.args.get('query')
#     if not query:
#         return jsonify({"error": "No query provided"}), 400

#     # Assuming query is a list of floats (embedding of a query)
#     query_vector = np.array([float(x) for x in query.split(',')], dtype=np.float32).reshape(1, -1)
#     D, I = index.search(query_vector, k=5)  # Get top 5 results
    
#     return jsonify({"distances": D.tolist(), "indices": I.tolist()}), 200

# @app.route('/status', methods=['GET'])
# def status():
#     global index
#     if index is None and os.path.exists(INDEX_FILE):
#         index = faiss.read_index(INDEX_FILE)
#     return jsonify({"ntotal": index.ntotal if index else 0}), 200

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)


from flask import Flask, request, jsonify
import faiss
import numpy as np
import json
import fitz  # PyMuPDF for PDF
from docx import Document  # python-docx for Word
from PIL import Image  # Pillow for image processing
import io
import os
import requests
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)
CORS(app)

dim = 384  # Example, adjust based on your model

INDEX_FILE = "index.faiss"
metadata_file = "metadata.json"
index = None

# Load or create metadata
def load_metadata():
    if os.path.exists(metadata_file):
        with open(metadata_file, 'r') as f:
            return json.load(f)
    else:
        return {"files": []}

metadata = load_metadata()

def get_index(expected_dim=None):
    if os.path.exists(INDEX_FILE):
        index = faiss.read_index(INDEX_FILE)
        if expected_dim is not None and index.d != expected_dim:
            raise ValueError(f"Vector dimension mismatch: index expects {index.d}, but got {expected_dim}")
        return index
    else:
        return faiss.IndexFlatL2(expected_dim)
 # Create a new index with the given dimension


# @app.route('/add_vectors', methods=['POST'])
# def add_vectors():
#     file = request.files.get('file')
#     file_name = request.form.get('file_name')  # Optional: allow file name input
#     if not file:
#         return jsonify({"error": "No file uploaded"}), 400

#     file_type = file.content_type
#     print(f"File type: {file_type}")

#     # Extract text or features based on file type
#     if "pdf" in file_type:
#         vectors = process_pdf(file)
#     elif "word" in file_type:
#         vectors = process_word(file)
#     elif "image" in file_type:
#         vectors = process_image(file)
#     else:
#         return jsonify({"error": "Unsupported file type"}), 415

#     if vectors is None:
#         return jsonify({"error": "Failed to process vectors from the file"}), 500

#     # Get or create persistent index
#     index = get_index(vectors.shape[1])
#     index.add(vectors)

#     # Update metadata with file information
#     file_metadata = {
#         "name": file_name or "unnamed_file",  # Use provided file name or default
#         "type": file_type,
#         "vector_id": index.ntotal - len(vectors),  # Record the starting index of the vectors
#         "vector_count": len(vectors),
#     }
#     metadata["files"].append(file_metadata)

#     # Save the updated index and metadata
#     faiss.write_index(index, INDEX_FILE)
#     with open(metadata_file, "w") as f:
#         json.dump(metadata, f)

#     return jsonify({"message": "Vectors added successfully", "ntotal": index.ntotal}), 200
@app.route('/add_vectors', methods=['POST'])
def add_vectors():
    file = request.files.get('file')
    file_name = request.form.get('file_name')  # Optional: allow file name input
    
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    print(f"File name: {file_name}") 
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    file_type = file.content_type
    print(f"File type: {file_type}")

    # Extract vectors and text chunks based on file type
    if "pdf" in file_type:
        vectors, text_chunks = process_pdf(file)  # This now returns both vectors and text chunks
    elif "word" in file_type:
        vectors, text_chunks = process_word(file)  # Modify process_word similarly if needed
    elif "image" in file_type:
        vectors, text_chunks = process_image(file)  # Modify process_image similarly if needed
    else:
        return jsonify({"error": "Unsupported file type"}), 415

    if vectors is None or text_chunks is None:
        return jsonify({"error": "Failed to process vectors or extract text from the file"}), 500

    # Get or create persistent index
    index = get_index(vectors.shape[1])
    if index is None:
        return jsonify({"error": "Failed to initialize FAISS index"}), 500

    # Add the vectors to the FAISS index
    index.add(vectors)

    # Update metadata with file information
    file_metadata = {
        "name": file_name or "unnamed_file",  # Use provided file name or default
        "type": file_type,
        "vector_id": index.ntotal - len(vectors),  # Record the starting index of the vectors
        "vector_count": len(vectors),
        "text_chunks": text_chunks  # Store text chunks alongside vectors
    }

    metadata["files"].append(file_metadata)

    # Save the updated index and metadata
    faiss.write_index(index, INDEX_FILE)
    with open(metadata_file, "w") as f:
        json.dump(metadata, f)

    return jsonify({"message": "Vectors and text chunks added successfully", "ntotal": index.ntotal}), 200

# @app.route('/search', methods=['GET'])
# def search():
#     query = request.args.get('query')
#     if not query:
#         return jsonify({"error": "No query provided"}), 400

#     query_vector = np.array([float(x) for x in query.split(',')], dtype=np.float32).reshape(1, -1)
#     D, I = index.search(query_vector, k=5)  # Get top 5 results

#     # Find corresponding file names and indices
#     results = []
#     for i in I[0]:
#         file_metadata = next((file for file in metadata["files"] if file["vector_id"] <= i < file["vector_id"] + file["vector_count"]), None)
#         if file_metadata:
#             results.append({
#                 "name": file_metadata["name"],
#                 "distance": D[0][I[0].tolist().index(i)],
#                 "vector_id": i
#             })

#     return jsonify({"results": results}), 200

@app.route('/search', methods=['GET'])
def search():
    # Retrieve the 'name' query parameter
    name_query = request.args.get('name')  # Expecting 'name' for file search
    print(f"Received search query for name: {name_query}")

    if not name_query:
        return jsonify({"error": "No 'name' query provided"}), 400

    try:
        # Load metadata from file
        with open("metadata.json", "r") as f:
            metadata = json.load(f)
    except Exception as e:
        return jsonify({"error": f"Failed to load metadata: {str(e)}"}), 500

    # Search for the file in metadata by name
    file_metadata = next((file for file in metadata["files"] if file["name"] == name_query), None)

    if not file_metadata:
        return jsonify({"error": "File not found by name"}), 404
    
    index = get_index()
    if index is None:
        return jsonify({"error": "FAISS index not found"}), 500
    print(f"{file_metadata} {index}")

    # Retrieve the vector_id and vector_count from metadata
    vector_id = file_metadata["vector_id"]
    vector_count = file_metadata["vector_count"]
    print(f"{vector_id} {vector_count}")

    # Extract the vectors from FAISS based on the vector_id and vector_count
    try:
        # Fetch the vectors from the FAISS index
        vectors = index.reconstruct_n(vector_id, vector_count)
        print(f"Received vectors for {name_query} {vectors}")

        # Return the vectors as part of the response
        return jsonify({
            "name": file_metadata["name"],
            "type": file_metadata["type"],
            "vector_id": vector_id,
            "vector_count": vector_count,
            "vectors": vectors.tolist(),  # Convert vectors to list for JSON serialization
            "results": file_metadata["text_chunks"]
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve vectors from FAISS: {str(e)}"}), 500

@app.route('/status', methods=['GET'])

def status():
    global index
    if index is None and os.path.exists(INDEX_FILE):
        index = faiss.read_index(INDEX_FILE)
    return jsonify({"ntotal": index.ntotal if index else 0}), 200

# def process_pdf(file):
#     pdf_data = file.read()
#     doc = fitz.open(stream=io.BytesIO(pdf_data), filetype="pdf")
#     text = ""
#     for page in doc:
#         text += page.get_text("text")
    
#     return np.random.rand(10, 128).astype(np.float32)

from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dim vectors

def process_pdf(file):
    import fitz  # PyMuPDF
    import io

    pdf_data = file.read()
    doc = fitz.open(stream=io.BytesIO(pdf_data), filetype="pdf")
    text_chunks = []

    for page in doc:
        page_text = page.get_text("text")
        if page_text.strip():
            text_chunks.extend(page_text.strip().split('\n\n'))  # Chunk by paragraphs

    # Filter out empty chunks
    text_chunks = [chunk.strip() for chunk in text_chunks if chunk.strip()]

    vectors = model.encode(text_chunks).astype(np.float32)

    return vectors, text_chunks

def process_word(file):
    doc = Document(io.BytesIO(file.read()))
    text = ""
    for para in doc.paragraphs:
        text += para.text
    
    return np.random.rand(10, 128).astype(np.float32)

def process_image(file):
    img = Image.open(io.BytesIO(file.read()))
    img = img.resize((224, 224))  
    img_array = np.array(img)
    
    return np.random.rand(10, 128).astype(np.float32)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)