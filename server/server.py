from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import uuid
import os
from datetime import datetime
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    logger.info("✅ Gemini AI configured successfully")
else:
    logger.warning("⚠️ GEMINI_API_KEY not found in environment variables")
    model = None

# In-memory storage for demo (use database in production)
presentations = {}
conversations = {}

# Color themes mapping
COLOR_THEMES = {
    "red": {
        "background": "#fee2e2",
        "primary": "#dc2626",
        "secondary": "#fca5a5",
        "text": "#7f1d1d",
        "accent": "#ef4444"
    },
    "blue": {
        "background": "#dbeafe", 
        "primary": "#2563eb",
        "secondary": "#93c5fd",
        "text": "#1e3a8a",
        "accent": "#3b82f6"
    },
    "green": {
        "background": "#dcfce7",
        "primary": "#16a34a", 
        "secondary": "#86efac",
        "text": "#14532d",
        "accent": "#22c55e"
    },
    "yellow": {
        "background": "#fef3c7",
        "primary": "#d97706",
        "secondary": "#fcd34d", 
        "text": "#92400e",
        "accent": "#f59e0b"
    },
    "purple": {
        "background": "#f3e8ff",
        "primary": "#9333ea",
        "secondary": "#c4b5fd",
        "text": "#581c87", 
        "accent": "#a855f7"
    },
    "pink": {
        "background": "#fce7f3",
        "primary": "#db2777",
        "secondary": "#f9a8d4",
        "text": "#831843",
        "accent": "#ec4899"
    },
    "cyan": {
        "background": "#cffafe",
        "primary": "#0891b2",
        "secondary": "#67e8f9", 
        "text": "#164e63",
        "accent": "#06b6d4"
    },
    "lime": {
        "background": "#ecfccb",
        "primary": "#65a30d",
        "secondary": "#bef264",
        "text": "#365314",
        "accent": "#84cc16"
    }
}

def generate_with_gemini(prompt):
    """Generate content using Gemini AI"""
    if not model:
        logger.warning("Gemini model not available, using fallback")
        return generate_fallback_content(prompt)
    try:
        enhanced_prompt = f"""
        Create a professional presentation slide based on this request: \"{prompt}\"
        Respond with a JSON object containing:
        - title: A clear, engaging slide title
        - content: Main content summary (2-3 sentences)
        - bullet_points: Array of 3-5 key points
        - design_theme: Suggested color theme (professional, creative, modern, minimal)
        - layout_type: Suggested layout (title-content, two-column, image-text, bullet-list)
        Keep the response concise and professional.
        """
        response = model.generate_content(enhanced_prompt)
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            return parse_text_response(response.text, prompt)
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return generate_fallback_content(prompt)

def parse_text_response(text, original_prompt):
    """Parse text response into structured format"""
    lines = text.strip().split('\n')
    
    # Extract title (usually first line or contains "title")
    title = f"Presentation: {original_prompt}"
    for line in lines[:3]:
        if line.strip() and not line.startswith('-') and not line.startswith('•'):
            title = line.strip()
            break
    
    # Extract bullet points
    bullet_points = []
    for line in lines:
        if line.strip().startswith('-') or line.strip().startswith('•'):
            bullet_points.append(line.strip().lstrip('-•').strip())
    
    if not bullet_points:
        bullet_points = [
            "Key insight from your request",
            "Important details to highlight", 
            "Action items or next steps"
        ]
    
    return {
        "title": title,
        "content": f"This slide covers: {original_prompt}",
        "bullet_points": bullet_points[:5],  # Limit to 5 points
        "design_theme": "professional",
        "layout_type": "bullet-list"
    }

def generate_fallback_content(prompt):
    """Generate fallback content when Gemini is unavailable"""
    return {
        "title": f"Presentation: {prompt}",
        "content": f"Content overview for: {prompt}",
        "bullet_points": [
            "Overview of the topic",
            "Key points to discuss",
            "Important considerations",
            "Next steps or conclusions"
        ],
        "design_theme": "professional",
        "layout_type": "bullet-list"
    }

def convert_to_slide_elements(ai_response, color_theme="blue"):
    """Convert AI response to frontend slide elements with color theme"""
    elements = []
    y_position = 80
    theme_colors = COLOR_THEMES.get(color_theme, COLOR_THEMES["blue"])
    
    # Add title
    elements.append({
        "id": f"title_{uuid.uuid4().hex[:8]}",
        "type": "text",
        "content": ai_response.get("title", "Untitled Slide"),
        "x": 50,
        "y": y_position,
        "width": 700,
        "height": 60,
        "style": {
            "fontSize": "24px",
            "fontWeight": "bold",
            "color": theme_colors["primary"]
        }
    })
    y_position += 100
    
    # Add main content if available
    if ai_response.get("content"):
        elements.append({
            "id": f"content_{uuid.uuid4().hex[:8]}",
            "type": "text",
            "content": ai_response["content"],
            "x": 50,
            "y": y_position,
            "width": 700,
            "height": 80,
            "style": {
                "fontSize": "16px",
                "color": theme_colors["text"],
                "lineHeight": "1.5"
            }
        })
        y_position += 100
    
    # Add bullet points
    if ai_response.get("bullet_points"):
        bullet_text = "\n".join([f"• {point}" for point in ai_response["bullet_points"]])
        elements.append({
            "id": f"bullets_{uuid.uuid4().hex[:8]}",
            "type": "text",
            "content": bullet_text,
            "x": 50,
            "y": y_position,
            "width": 700,
            "height": len(ai_response["bullet_points"]) * 30 + 20,
            "style": {
                "fontSize": "14px",
                "color": theme_colors["text"],
                "lineHeight": "1.8"
            }
        })
    
    return elements

# Voice interaction responses
def get_voice_greeting():
    """Get a friendly greeting for voice interaction"""
    greetings = [
        "Hello! How's your day going? What kind of presentation would you like to create today?",
        "Good day! I'm here to help you create amazing slides. What's your presentation topic?",
        "Hi there! Ready to build something great? Tell me about your presentation needs.",
        "Welcome! I'm excited to help you create your presentation. What's on your mind?"
    ]
    import random
    return random.choice(greetings)

# API Routes
@app.route('/api/voice/greeting', methods=['GET'])
def voice_greeting():
    """Get voice greeting for user interaction"""
    try:
        greeting = get_voice_greeting()
        return jsonify({
            "message": greeting,
            "voice_enabled": True,
            "suggestions": [
                "Business presentation",
                "Marketing strategy",
                "Project proposal",
                "Team meeting"
            ]
        })
    except Exception as e:
        logger.error(f"Error in voice greeting: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/voice/process', methods=['POST'])
def process_voice_input():
    """Process voice input and generate appropriate response"""
    try:
        data = request.get_json()
        user_input = data.get('input', '').strip()
        
        if not user_input:
            return jsonify({"error": "No input provided"}), 400
        
        # Check if it's a greeting/casual response
        casual_keywords = ['good', 'fine', 'great', 'okay', 'well', 'nice', 'bad', 'tired']
        if any(keyword in user_input.lower() for keyword in casual_keywords):
            response = "That's great to hear! Now, what type of presentation would you like to create? You can describe your topic or ask for suggestions."
        else:
            # Treat as presentation request
            response = f"Perfect! I'll help you create a presentation about '{user_input}'. Let me generate some slide content for you."
        
        return jsonify({
            "response": response,
            "should_generate": not any(keyword in user_input.lower() for keyword in casual_keywords),
            "topic": user_input if not any(keyword in user_input.lower() for keyword in casual_keywords) else None
        })
        
    except Exception as e:
        logger.error(f"Error processing voice input: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-slide', methods=['POST'])
def generate_slide():
    """Generate a single slide from prompt"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        color_theme = data.get('color_theme', 'blue')
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Generating slide for: {prompt} with color theme: {color_theme}")
        
        # Generate content with Gemini
        ai_response = generate_with_gemini(prompt)
        
        # Convert to slide format with color theme
        slide = {
            "id": int(datetime.now().timestamp()),
            "title": ai_response.get("title", "Generated Slide"),
            "elements": convert_to_slide_elements(ai_response, color_theme),
            "theme": ai_response.get("design_theme", "professional"),
            "layout": ai_response.get("layout_type", "bullet-list"),
            "color_theme": color_theme,
            "background_color": COLOR_THEMES.get(color_theme, COLOR_THEMES["blue"])["background"],
            "ai_metadata": {
                "original_prompt": prompt,
                "generated_at": datetime.now().isoformat()
            }
        }
        
        return jsonify({
            "slide": slide,
            "ai_response": ai_response,
            "message": "Slide generated successfully"
        })
        
    except Exception as e:
        logger.error(f"Error generating slide: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/slides/<int:slide_id>/color', methods=['PUT'])
def change_slide_color(slide_id):
    """Change the color theme of a specific slide"""
    try:
        data = request.get_json()
        color_theme = data.get('color_theme', 'blue')
        presentation_id = data.get('presentation_id')
        
        if color_theme not in COLOR_THEMES:
            return jsonify({"error": "Invalid color theme"}), 400
        
        # Find and update the slide
        updated = False
        for pres_id, presentation in presentations.items():
            if presentation_id and pres_id != presentation_id:
                continue
                
            for slide in presentation['slides']:
                if slide['id'] == slide_id:
                    # Update slide color theme
                    slide['color_theme'] = color_theme
                    slide['background_color'] = COLOR_THEMES[color_theme]["background"]
                    
                    # Update all text elements with new color theme
                    theme_colors = COLOR_THEMES[color_theme]
                    for element in slide['elements']:
                        if element['type'] == 'text':
                            if 'title_' in element['id']:
                                element['style']['color'] = theme_colors["primary"]
                            else:
                                element['style']['color'] = theme_colors["text"]
                    
                    presentation['updated_at'] = datetime.now().isoformat()
                    updated = True
                    break
            
            if updated:
                break
        
        if not updated:
            return jsonify({"error": "Slide not found"}), 404
        
        return jsonify({
            "message": f"Slide color changed to {color_theme}",
            "color_theme": color_theme,
            "background_color": COLOR_THEMES[color_theme]["background"]
        })
        
    except Exception as e:
        logger.error(f"Error changing slide color: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/color-themes', methods=['GET'])
def get_color_themes():
    """Get available color themes"""
    try:
        return jsonify({
            "themes": COLOR_THEMES,
            "available_colors": list(COLOR_THEMES.keys())
        })
    except Exception as e:
        logger.error(f"Error getting color themes: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/presentai', methods=['POST'])
def create_presentation():
    """Create or update presentation"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        slides = data.get('slides', [])
        color_theme = data.get('color_theme', 'blue')
        
        presentation_id = str(uuid.uuid4())
        
        # If prompt provided, generate new slide
        if prompt and prompt != "Manual save":
            logger.info(f"Creating presentation with prompt: {prompt}")
            ai_response = generate_with_gemini(prompt)
            
            new_slide = {
                "id": len(slides) + 1,
                "title": ai_response.get("title", "Generated Slide"),
                "elements": convert_to_slide_elements(ai_response, color_theme),
                "theme": ai_response.get("design_theme", "professional"),
                "layout": ai_response.get("layout_type", "bullet-list"),
                "color_theme": color_theme,
                "background_color": COLOR_THEMES.get(color_theme, COLOR_THEMES["blue"])["background"]
            }
            
            slides.append(new_slide)
        
        # Store presentation
        presentations[presentation_id] = {
            "id": presentation_id,
            "prompt": prompt,
            "slides": slides,
            "default_color_theme": color_theme,
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

@app.route('/api/presentations/<presentation_id>', methods=['GET'])
def get_presentation(presentation_id):
    """Get specific presentation"""
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
    """Update existing presentation"""
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

@app.route('/api/quick-inspiration', methods=['POST'])
def quick_inspiration():
    """Handle quick inspiration prompts"""
    try:
        data = request.get_json()
        inspiration = data.get('inspiration', '')
        
        if not inspiration:
            return jsonify({"error": "Inspiration text required"}), 400
        
        # Generate content based on inspiration
        ai_response = generate_with_gemini(inspiration)
        
        return jsonify({
            "slide_content": ai_response,
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
        "gemini_configured": model is not None,
        "version": "1.0.0"
    })

# Error handlers
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
    print("🎤 Voice interaction endpoints ready")
    print("🎨 Color theme support enabled")
    print(f"🤖 Gemini AI: {'✅ Connected' if model else '❌ Not configured'}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)