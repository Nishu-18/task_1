import fitz  # PyMuPDF
import re, os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

API_KEY=os.getenv("GROQ_API_KEY")


client =Groq(api_key=API_KEY)



def extract_full_figures(pdf_path, output_folder="figures_output"):
    os.makedirs(output_folder, exist_ok=True)
    doc = fitz.open(pdf_path)
    results = []

    for page_index, page in enumerate(doc):
        text_blocks = page.get_text("blocks")
        page_text = page.get_text("text")

        # Find figure captions
        caption_blocks = []
        for block in text_blocks:
            x0, y0, x1, y1, text, *_ = block
            if re.match(r"^(Figure|Fig\.)\s*\d+", text.strip(), re.IGNORECASE):
                caption_blocks.append((x0, y0, x1, y1, text.strip()))

        for cap_idx, (x0, y0, x1, y1, caption_text) in enumerate(caption_blocks):
            # Define figure area above the caption
            # We capture about 250px above the caption block
            top_y = max(0, y0 - 600)
            bottom_y = y1 + 10
            clip_rect = fitz.Rect(50, top_y, page.rect.width - 50, bottom_y)

            # Render that region to a PNG
            pix = page.get_pixmap(clip=clip_rect, dpi=300, alpha=False)
            image_path = f"{output_folder}/page{page_index+1}_fig{cap_idx+1}.png"
            pix.save(image_path)

            # Extract explanation text mentioning this figure
            fig_num = re.findall(r"\d+", caption_text)
            if fig_num:
                figure_num = fig_num[0]
                explanation_pattern = rf"([^.]*?(Figure|Fig\.)\s*{figure_num}[^.]*\.)"
                explanations = re.findall(explanation_pattern, page_text, flags=re.IGNORECASE)
                explanations = [e[0] for e in explanations]
            else:
                explanations = []

            results.append({
                "page": page_index + 1,
                "caption": caption_text,
                "explanations": genarete_explaination(explanations,caption_text),
                "image_path": image_path
            })

    return results

def genarete_explaination(explanations,caption):
    chat_completion=client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "You are a scientific assistant that explains figures and images in documents.Your goal is to generate a clear, detailed explanation of each figure using the provided caption and related text."
        },
        {
            "role": "user",
            "content": f"""Here is a figure from a document.

            Caption:
            {caption}

            Text near or referring to this figure:
            {explanations}

            Explain what this figure represents, what it demonstrates, and why it is important in the document. 
            Make the explanation clear, concise, and self-contained.
            Avoid repeating the caption word-for-word. Write in 3-5 sentences.""",
        }
    ],
    model="llama-3.3-70b-versatile",
)
    print(chat_completion.choices[0].message.content)
    return chat_completion.choices[0].message.content

# Example usage
# pdf_path = "lebo104.pdf"
# data = extract_full_figures(pdf_path)

# for fig in data:
#     print(f"\n📄 Page {fig['page']}")
#     print(f"🖼️ Image: {fig['image_path']}")
#     print(f"🧾 Caption: {fig['caption']}")
#     print(f"💬 Explanation: {fig['explanations']}")
