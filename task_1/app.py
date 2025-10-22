from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS

from hello import extract_full_figures
import os
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "figures_output"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


app = Flask(__name__,static_folder="frontend/dist",static_url_path="/")
CORS(app, resources={r"/api/*": {"origins": "https://task-1-teal-nine.vercel.app"}},
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"])






@app.route("/")
def home():
    return "hello world"

@app.route("/api/upload_pdf", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return '"{error": "No file part in request}"'

    file = request.files["file"]

    if file.filename == "":
        return '"{error": "No file selected}"'

    pdf_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(pdf_path)

    # Run extraction
    results = extract_full_figures(pdf_path, output_folder=OUTPUT_FOLDER)
    for r in results:
        r["image_url"] = f"/api/figures/{os.path.basename(r['image_path'])}"
        del r["image_path"]  # don't expose local path

    return jsonify(results)


@app.route("/api/figures/<filename>")
def serve_figure(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)
port=os.environ.get("PORT",5000)

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=port)
