# SlideFlow

**AI-Powered Presentation Editor**

SlideFlow is a modern, web-based presentation editor that combines traditional slide editing capabilities with advanced AI-powered content generation. Create professional presentations with intelligent assistance, interactive tools, and seamless export options.

![SlideFlow](https://i.ibb.co/sdQ8CFp8/Screenshot-2025-06-29-213230.png)

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Smart Slide Creation**: Generate professional slides from text descriptions
- **Gemini AI Integration**: Powered by Google's Gemini AI for intelligent content generation
- **Quick Inspirations**: Pre-built templates for common presentation types

### 🎨 Rich Editing Tools
- **Visual Editor**: Drag-and-drop interface with real-time editing
- **Multiple Tools**: Select, Crop, Alignment, Text, Shape, Eraser, and Table tools
- **Element Management**: Add and manipulate text, shapes, and tables
- **Color Themes**: 8 professional color themes

### 📊 Visualization Elements
- **Dynamic Tables**: Create and edit tables with customizable rows and columns
- **Shape Tools**: Rectangle, Circle, and Triangle shapes with color customization
- **Text Formatting**: Rich text editing with alignment and styling options
- **Element Selection**: Multi-element selection and manipulation

### 💾 Export & Sharing
- **Multiple Formats**: Export as JSON or PowerPoint (PPTX)
- **Real-time Saving**: Auto-save functionality with presentation management
- **Cross-platform**: Works on desktop and mobile browsers

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **Server**: Flask (Python)
- **AI Integration**: Google Gemini AI API
- **CORS**: Flask-CORS for cross-origin requests
- **Export**: python-pptx for PowerPoint generation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/ajitashwath/codeclash-hackathon.git
cd codeclash-hackathon
```

### 2. Frontend Setup
```bash
cd client
npm install
# or
yarn install
```

### 3. Backend Setup
```bash
cd server
```

### 4. Environment Configuration
Create a `.env` file in the server directory:
```env
GEMINI_API_KEY = your_gemini_api_key_here
```

To get a Gemini API key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### 5. Install Python Dependencies
```bash
pip install flask flask-cors google-generativeai python-dotenv python-pptx
```

## 🚀 Running the Application

### Start the Backend Server
```bash
cd server
python server.py
```
The server will start on `http://localhost:5000`

### Start the Frontend
```bash
cd client
npm run dev
# or
yarn dev
```
The client will start on `http://localhost:3000`

## 📖 Usage Guide

### Creating Your First Presentation

1. **Launch SlideFlow**: Open your browser and navigate to `http://localhost:3000`
2. **Wait for Loading**: The app will initialize with a beautiful loading screen
3. **Choose Creation Method**:
   - Use the AI panel to generate slides from text descriptions
   - Start with a blank slide and use the editing tools
   - Try quick inspiration templates

### AI-Powered Generation

#### Using Text Prompts
1. Click the AI panel on the right sidebar
2. Enter your presentation topic or description
3. Click "Generate" to create AI-powered slides
4. Customize the generated content using editing tools

#### Quick Inspirations
Try these pre-built templates:
- "Business presentation with sales statistics data"
- "Marketing strategy deck with growth metrics"
- "Product launch presentation with timeline"

### Manual Editing Tools

#### Tool Panel (Left Sidebar)
- **Select** (MousePointer): Select and move elements
- **Crop**: Crop and resize elements
- **Alignment**: Align text elements (left, center, right)
- **Text**: Add and edit text elements
- **Shape**: Add geometric shapes (rectangle, circle, triangle)
- **Eraser**: Delete selected elements
- **Table**: Create interactive tables

#### Working with Elements
1. **Adding Text**: Select the Text tool and click on the canvas
2. **Creating Shapes**: Choose the Shape tool, select shape type and color
3. **Building Tables**: Use the Table tool to specify rows and columns
4. **Element Selection**: Click elements to select and modify properties

### Slide Management
- **New Slide**: Click the "New" button in the header
- **Navigation**: Use the slide dropdown to switch between slides
- **Delete**: Remove slides using the "Delete" button
- **Save**: Use "Save" to store your presentation

### Export Options
1. **JSON Export**: Download presentation data as JSON
2. **PowerPoint Export**: Generate PPTX files for use in Microsoft PowerPoint


## 🏗️ Project Structure

```
codeclash-hackathon/          # Tentative name
├── client/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Main application component
|   |   ├── layout.tsx
|   |   ├── globals.css
|   |   ├── SlideEditor.tsx  # Slide editing canvas
│   │   ├── PromptInput.tsx  # AI prompt interface
│   │   └── SlidePreview.tsx
│   ├── components/
│   │   ├── ui/              # UI components (Button, Separator, etc.)
│   │   └── ToolPanel.tsx    # Tool selection panel
|   ├── hooks/
|   |   ├── use-toast.ts
│   ├── types/
│   │   └── slide.ts         # TypeScript type definitions
│   └── lib/
│       └── utils.ts         # Utility functions
└── server/                  # Flask backend
    ├── server.py           # Main server application
    └── setup.py
```


## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |

## 🚧 In Progress
- [ ] Voice recognition implementation
- [ ] Advanced slide layouts
- [ ] Export functionality
- [ ] User authentication
- [ ] Database integration
- [ ] Minor Design Correction


## 🙏 Acknowledgments

- **Google Gemini AI** for powering the AI content generation
- **Next.js Team** for the excellent React framework
- **Flask Community** for the lightweight Python web framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide Icons** for the beautiful icon set

---

**Built for the CodeClash 2.0 Hackathon**
