#!/usr/bin/env python3
"""
SlideFlow Backend Setup Script
=============================

This script helps you set up the SlideFlow backend server.
"""

import os
import sys
import subprocess

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All packages installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Error installing packages")
        sys.exit(1)

def setup_env_file():
    """Setup environment file"""
    env_file = ".env"
    
    if os.path.exists(env_file):
        print(f"✅ Found existing {env_file}")
        return
    
    print(f"📝 Creating {env_file}...")
    
    # Get Gemini API key from user
    print("\n🔑 Gemini AI API Key Setup:")
    print("1. Visit: https://aistudio.google.com/app/apikey")
    print("2. Create a free API key")
    print("3. Copy your API key")
    
    api_key = input("\nEnter your Gemini API key (or press Enter to skip): ").strip()
    
    # Create .env file
    env_content = f"""# SlideFlow Backend Environment Configuration
GOOGLE_API_KEY={api_key if api_key else 'your_api_key_here'}
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=server.py
HOST=0.0.0.0
PORT=5000
SECRET_KEY=slideflow_secret_key_2024
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
LOG_LEVEL=INFO
VOICE_ENABLED=true
VOICE_LANGUAGE=en-US
"""
    
    try:
        with open(env_file, 'w') as f:
            f.write(env_content)
        print(f"✅ Created {env_file}")
        
        if not api_key:
            print("⚠️  Remember to add your Gemini API key to .env file later")
            
    except Exception as e:
        print(f"❌ Error creating {env_file}: {e}")

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        import flask
        import flask_cors
        import google.generativeai
        import dotenv
        print("✅ All imports successful")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Try running: pip install -r requirements.txt")
        sys.exit(1)

def main():
    """Main setup function"""
    print("🚀 SlideFlow Backend Setup")
    print("=" * 30)
    
    check_python_version()
    install_requirements()
    setup_env_file()
    test_imports()
    
    print("\n✅ Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Make sure your Gemini API key is in .env file")
    print("2. Run: python server.py")
    print("3. Your backend will be available at: http://localhost:5000")
    print("\n🎤 Voice endpoints:")
    print("- GET  /api/voice/greeting - Get voice greeting")
    print("- POST /api/voice/process  - Process voice input")
    print("\n🤖 AI endpoints:")
    print("- POST /api/generate-slide     - Generate single slide")
    print("- POST /api/presentai          - Create presentation")
    print("- POST /api/quick-inspiration  - Quick inspiration")

if __name__ == "__main__":
    main()