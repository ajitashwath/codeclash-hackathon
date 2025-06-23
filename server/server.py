from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import uuid
import os
from datetime import datetime
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Set your API key directly (for demo purposes only; use environment variable in production)
# (No configure method available in your installed package)

# In-memory storage for demo (use database in production)
presentations = {}
slide_templates = {}

def generate_slide_content(prompt):
    """Generate slide content using Gemini AI"""
    try:
        # Enhanced prompt for better slide generation
        enhanced_prompt = f"""Create a professional presentation slide based on this description: \"{prompt}\" ..."""
        # No supported Gemini API in your installed package
        raise NotImplementedError("Your google-generativeai package version does not support the required API. Please upgrade or check the documentation for supported methods.")
        # If you upgrade, you can use genai.configure and genai.GenerativeModel or genai.generate_text as shown previously.
    except Exception as e:
        logger.error(f"Error generating content with Gemini: {str(e)}")
        # Fallback response
        return {
            "title": f"Presentation: {prompt}",
            "content": f"Content for {prompt}",
            "elements": [
                {
                    "type": "text",
                    "content": f"This slide covers: {prompt}",
                    "position": "center",
                    "style": "body"
                },
                {
                    "type": "bullet_points",
                    "content": ["Key Point 1", "Key Point 2", "Key Point 3"]
                }
            ],
            "design_suggestions": {
                "color_scheme": "professional",
                "layout": "balanced"
            }
        }

@app.route('/api/presentai', methods=['POST'])
def create_presentation():
    """Main endpoint for creating presentations"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        slides = data.get('slides', [])
        
        if not prompt and not slides:
            return jsonify({"error": "Prompt or slides data required"}), 400
        
        presentation_id = str(uuid.uuid4())
        
        # If prompt is provided, generate new slide content
        if prompt and prompt != "Manual save":
            logger.info(f"Generating slide for prompt: {prompt}")
            slide_content = generate_slide_content(prompt)
            
            # Convert AI response to frontend format
            new_slide = {
                "id": len(slides) + 1,
                "title": slide_content.get("title", "Generated Slide"),
                "content": slide_content.get("content", ""),
                "elements": convert_ai_elements_to_frontend(slide_content.get("elements", [])),
                "ai_metadata": slide_content.get("design_suggestions", {})
            }
            
            slides.append(new_slide)
        
        # Store presentation
        presentations[presentation_id] = {
            "id": presentation_id,
            "prompt": prompt,
            "slides": slides,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        logger.info(f"Created presentation {presentation_id} with {len(slides)} slides")
        
        return jsonify({
            "presentation_id": presentation_id,
            "slides": slides,
            "message": "Presentation created successfully"
        })
        
    except Exception as e:
        logger.error(f"Error creating presentation: {str(e)}")
        return jsonify({"error": str(e)}), 500

def convert_ai_elements_to_frontend(ai_elements):
    """Convert AI-generated elements to frontend slide element format"""
    frontend_elements = []
    y_offset = 100
    
    for i, element in enumerate(ai_elements):
        if element.get("type") == "text":
            frontend_elements.append({
                "id": f"ai_element_{i}_{uuid.uuid4().hex[:8]}",
                "type": "text",
                "content": element.get("content", ""),
                "x": 50 if element.get("position") == "left" else 500 if element.get("position") == "right" else 250,
                "y": y_offset,
                "width": 400,
                "height": 60,
                "style": {
                    "fontSize": "18px" if element.get("style") == "heading" else "14px",
                    "fontWeight": "bold" if element.get("style") == "heading" else "normal"
                }
            })
            y_offset += 80
            
        elif element.get("type") == "bullet_points":
            bullet_text = "\n".join([f"• {point}" for point in element.get("content", [])])
            frontend_elements.append({
                "id": f"ai_element_{i}_{uuid.uuid4().hex[:8]}",
                "type": "text",
                "content": bullet_text,
                "x": 50,
                "y": y_offset,
                "width": 400,
                "height": 120,
                "style": {
                    "fontSize": "14px",
                    "lineHeight": "1.5"
                }
            })
            y_offset += 140
            
        elif element.get("type") == "chart_suggestion":
            frontend_elements.append({
                "id": f"ai_element_{i}_{uuid.uuid4().hex[:8]}",
                "type": "shape",
                "content": "chart",
                "x": 500,
                "y": y_offset,
                "width": 200,
                "height": 150,
                "style": {
                    "backgroundColor": "#e5e7eb",
                    "border": "2px dashed #9ca3af",
                    "display": "flex",
                    "alignItems": "center",
                    "justifyContent": "center"
                }
            })
            y_offset += 170
    
    return frontend_elements

@app.route('/api/presentations/<presentation_id>', methods=['GET'])
def get_presentation(presentation_id):
    """Get a specific presentation"""
    try:
        presentation = presentations.get(presentation_id)
        if not presentation:
            return jsonify({"error": "Presentation not found"}), 404
        
        return jsonify(presentation)
        
    except Exception as e:
        logger.error(f"Error retrieving presentation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/presentations/<presentation_id>', methods=['PUT'])
def update_presentation(presentation_id):
    """Update a presentation"""
    try:
        data = request.get_json()
        
        if presentation_id not in presentations:
            return jsonify({"error": "Presentation not found"}), 404
        
        presentations[presentation_id].update({
            "slides": data.get("slides", presentations[presentation_id]["slides"]),
            "updated_at": datetime.now().isoformat()
        })
        
        return jsonify({
            "message": "Presentation updated successfully",
            "presentation": presentations[presentation_id]
        })
        
    except Exception as e:
        logger.error(f"Error updating presentation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/presentations', methods=['GET'])
def list_presentations():
    """List all presentations"""
    try:
        return jsonify({
            "presentations": list(presentations.values()),
            "count": len(presentations)
        })
        
    except Exception as e:
        logger.error(f"Error listing presentations: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/presentations/<presentation_id>/export', methods=['POST'])
def export_presentation(presentation_id):
    """Export presentation (placeholder for PPTX export)"""
    try:
        presentation = presentations.get(presentation_id)
        if not presentation:
            return jsonify({"error": "Presentation not found"}), 404
        
        # TODO: Implement actual PPTX export using python-pptx
        # For now, return the presentation data
        return jsonify({
            "message": "Export functionality would be implemented here",
            "presentation_id": presentation_id,
            "export_format": "pptx",
            "download_url": f"/api/presentations/{presentation_id}/download"
        })
        
    except Exception as e:
        logger.error(f"Error exporting presentation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-slide', methods=['POST'])
def generate_single_slide():
    """Generate a single slide from prompt"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Generating single slide for: {prompt}")
        slide_content = generate_slide_content(prompt)
        
        # Convert to frontend format
        slide = {
            "id": int(datetime.now().timestamp()),
            "title": slide_content.get("title", "Generated Slide"),
            "content": slide_content.get("content", ""),
            "elements": convert_ai_elements_to_frontend(slide_content.get("elements", [])),
            "ai_metadata": slide_content.get("design_suggestions", {})
        }
        
        return jsonify({
            "slide": slide,
            "message": "Slide generated successfully"
        })
        
    except Exception as e:
        logger.error(f"Error generating single slide: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/quick-inspiration', methods=['POST'])
def quick_inspiration():
    """Handle quick inspiration button clicks"""
    try:
        data = request.get_json()
        inspiration_text = data.get('inspiration', '')
        
        if not inspiration_text:
            return jsonify({"error": "Inspiration text is required"}), 400
        
        # Generate content based on inspiration
        slide_content = generate_slide_content(inspiration_text)
        
        return jsonify({
            "slide_content": slide_content,
            "message": "Inspiration processed successfully"
        })
        
    except Exception as e:
        logger.error(f"Error processing inspiration: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gemini_configured": False
    })

@app.route('/api/health')
def health():
    return {"status": "ok"}

@app.route('/api/generate', methods=['POST'])
def generate():
    return jsonify({"message": "Not implemented"}), 501

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("🚀 Starting SlideFlow Backend Server...")
    print("📊 Frontend should connect to: http://localhost:5000")
    print("🔗 API endpoints available at: http://localhost:5000/api/")
    
    app.run(debug=True, host='0.0.0.0', port=5000)