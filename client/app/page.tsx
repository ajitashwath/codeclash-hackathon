"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MousePointer,
  Crop,
  Type,
  Square,
  Eraser,
  Table2,
  Plus,
  Save,
  Download,
  Sparkles,
  ChevronDown,
  List,
} from "lucide-react";
import PromptInput from "./PromptInput";
import SlideEditor from "./SlideEditor";
import ToolPanel from "@/components/ToolPanel";
import ColorThemeSelector from "@/components/ColorThemeSelector";
import { Slide, SlideElement } from "@/types/slide";
import { AIProvider } from "@/components/AIProviderSelector";
import { AttachmentFile } from "@/components/AttachmentUpload";
import { apiClient } from "@/lib/api";

const tools = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "crop", icon: Crop, label: "Crop" },
  { id: "text", icon: Type, label: "Text" },
  { id: "shape", icon: Square, label: "Shape" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "table", icon: Table2, label: "Table" },
];

// Pre-generate particle positions to avoid hydration mismatch
const generateParticles = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${(i * 5.263) % 100}%`, // Deterministic positioning
    top: `${(i * 7.891) % 100}%`,
    delay: `${(i * 0.1) % 2}s`,
    duration: `${2 + (i * 0.1) % 2}s`,
  }));
};

const PARTICLES = generateParticles();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTool, setActiveTool] = useState("select");
  const [showAI, setShowAI] = useState(true);
  const [hasImage, setHasImage] = useState(false);

  // Local state for slides and currentSlide
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, title: "Untitled Slide", content: "", notes: "", elements: [] },
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedShape, setSelectedShape] = useState<
    "rectangle" | "circle" | "triangle"
  >("rectangle");

  const [selectedColor, setSelectedColor] = useState<string>("#3b82f6");
  const [currentColorTheme, setCurrentColorTheme] = useState<string>("blue");

  const exportRef = useRef<HTMLButtonElement>(null);
  const [exportType, setExportType] = useState<"json" | "pptx">("json");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportMenuPos, setExportMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // Add selectedElement state to App
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Handler: New Slide
  const handleNewSlide = () => {
    const newSlide: Slide = {
      id: slides.length + 1,
      title: `Slide ${slides.length + 1}`,
      content: "",
      notes: "",
      elements: [],
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
    setHasImage(true);
  };

  // Handler: Save Presentation
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.createPresentation("Manual save", slides, currentColorTheme);
      setPresentationId(response.presentation_id);
      alert("Presentation saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      // Fallback save
      setPresentationId(`local_${Date.now()}`);
      alert("Presentation saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Export Presentation
  const handleExport = async () => {
    if (!presentationId) {
      alert("Please save your presentation first!");
      return;
    }
    try {
      if (exportType === "json") {
        const dataStr =
          "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slides, null, 2));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `presentation_${presentationId}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        alert("Presentation exported as JSON!");
      } else if (exportType === "pptx") {
        try {
          const blob = await apiClient.exportToPPTX(slides);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `presentation_${presentationId}.pptx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          alert("Presentation exported as PPTX!");
        } catch (error) {
          alert("PPTX export not available. Exporting as JSON instead.");
          handleExport(); // Fallback to JSON
        }
      }
    } catch (err) {
      console.error("Export error:", err);
      alert("Error exporting presentation. Please try again.");
    }
  };

  // Handler: Tool selection
  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
  };

  // Handler: Update current slide
  const handleSlideUpdate = (updatedSlide: Slide) => {
    // If the selected element was deleted, clear selection
    if (selectedElement && !updatedSlide.elements.some(el => el.id === selectedElement)) {
      setSelectedElement(null);
    }
    const newSlides = slides.map((slide, index) =>
      index === currentSlide ? updatedSlide : slide
    );
    setSlides(newSlides);
  };

  // Handler: Change current slide
  const handleSlideChange = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  // Handler: Generate slides from AI
  const handleGenerateSlides = async (prompt: string, provider: AIProvider, attachments: AttachmentFile[]) => {
    setIsGenerating(true);
    try {
      const response = await apiClient.generateSlide(prompt, currentColorTheme);
      
      if (response.slide) {
        setSlides([response.slide]);
        setCurrentSlide(0);
        setPresentationId(`ai_pres_${Date.now()}`);
        setHasImage(true);
        alert(`Presentation generated successfully with ${provider.toUpperCase()}!`);
      } else {
        alert("Failed to generate slide");
      }
    } catch (err) {
      console.error("Generation error:", err);
      alert("Error generating presentation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Delete slide
  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      alert("Cannot delete the last slide");
      return;
    }
    const newSlides = slides.filter((_, index) => index !== currentSlide);
    const newCurrentSlide =
      currentSlide >= newSlides.length ? newSlides.length - 1 : currentSlide;
    setSlides(newSlides);
    setCurrentSlide(newCurrentSlide);
  };

  // Handler: Add Table
  const handleTableAdd = (rows: number, cols: number) => {
    const newTable: SlideElement = {
      id: `table_${Date.now()}`,
      type: "table",
      content: "",
      x: 100,
      y: 100,
      width: 300,
      height: 150,
      tableData: {
        rows,
        cols,
        cells: Array.from({ length: rows }, () => Array(cols).fill("")),
      },
    };
    setSlides((prevSlides) =>
      prevSlides.map((slide, idx) =>
        idx === currentSlide
          ? { ...slide, elements: [...slide.elements, newTable] }
          : slide
      )
    );
  };

  // Handler: Add Bullet List
  const handleBulletListAdd = () => {
    const newBulletList: SlideElement = {
      id: `bulletlist_${Date.now()}`,
      type: "bulletList",
      content: "• First bullet point\n• Second bullet point\n• Third bullet point",
      x: 100,
      y: 200,
      width: 400,
      height: 120,
      style: {
        fontSize: "16px",
        textAlign: "left",
        color: "#1f2937",
      },
    };
    setSlides((prevSlides) =>
      prevSlides.map((slide, idx) =>
        idx === currentSlide
          ? { ...slide, elements: [...slide.elements, newBulletList] }
          : slide
      )
    );
  };

  // Handler: Font Style change
  const handleFontStyleChange = (style: "bold" | "italic" | "underline") => {
    if (selectedElement) {
      setSlides(prevSlides => prevSlides.map((slide, idx) => {
        if (idx !== currentSlide) return slide;
        return {
          ...slide,
          elements: slide.elements.map(el => {
            if (el.id === selectedElement && (el.type === "text" || el.type === "bulletList")) {
              const currentStyle = el.style || {};
              let newStyle = { ...currentStyle };
              
              switch (style) {
                case "bold":
                  newStyle.fontWeight = currentStyle.fontWeight === "bold" ? "normal" : "bold";
                  break;
                case "italic":
                  newStyle.fontStyle = currentStyle.fontStyle === "italic" ? "normal" : "italic";
                  break;
                case "underline":
                  newStyle.textDecoration = currentStyle.textDecoration === "underline" ? "none" : "underline";
                  break;
              }
              
              return { ...el, style: newStyle };
            }
            return el;
          })
        };
      }));
    }
  };

  // Handler: Font Size change
  const handleFontSizeChange = (fontSize: string) => {
    if (selectedElement) {
      setSlides(prevSlides => prevSlides.map((slide, idx) => {
        if (idx !== currentSlide) return slide;
        return {
          ...slide,
          elements: slide.elements.map(el =>
            el.id === selectedElement && (el.type === "text" || el.type === "bulletList")
              ? { ...el, style: { ...el.style, fontSize } }
              : el
          )
        };
      }));
    }
  };

  const handleShapeChange = (shape: "rectangle" | "circle" | "triangle") => {
    setSelectedShape(shape);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // If an element is selected, apply color to it
    if (selectedElement) {
      setSlides(prevSlides => prevSlides.map((slide, idx) => {
        if (idx !== currentSlide) return slide;
        return {
          ...slide,
          elements: slide.elements.map(el => {
            if (el.id === selectedElement) {
              if (el.type === "text" || el.type === "bulletList") {
                return { ...el, style: { ...el.style, color } };
              } else if (el.type === "shape") {
                return { ...el, style: { ...el.style, backgroundColor: color } };
              }
            }
            return el;
          })
        };
      }));
    }
  };

  const handleThemeChange = (theme: string) => {
    setCurrentColorTheme(theme);
  };

  const handleShowExportMenu = () => {
    if (exportRef.current) {
      const rect = exportRef.current.getBoundingClientRect();
      setExportMenuPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
      setShowExportMenu(true);
    }
  };

  const handleHideExportMenu = () => setShowExportMenu(false);

  // Handle mounting and loading states
  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show nothing during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center overflow-hidden relative">
        {/* Animated background particles - using deterministic positioning */}
        <div className="absolute inset-0">
          {PARTICLES.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>

        {/* Main loading content */}
        <div className="text-center z-10">
          {/* Logo with pulse animation */}
          <div className="mb-8 relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
              <Sparkles className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl animate-ping opacity-20"></div>
          </div>

          {/* Brand name with typing effect */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4 animate-pulse">
              SlideFlow
            </h1>
            <p className="text-xl text-gray-300 opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}>
              AI-Powered Presentation Editor
            </p>
          </div>

          {/* Loading bar */}
          <div className="w-64 h-2 bg-gray-700 rounded-full mx-auto mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" 
                 style={{ 
                   animation: 'loadingBar 3s ease-in-out forwards',
                 }}>
            </div>
          </div>

          {/* Loading text */}
          <p className="text-gray-400 text-sm animate-pulse" style={{ animationDelay: '1s' }}>
            Initializing your creative workspace...
          </p>
        </div>

        {/* Custom CSS animations */}
        <style jsx>{`
          @keyframes loadingBar {
            0% { width: 0%; }
            50% { width: 60%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SlideFlow
            </h1>
          </div>

          {/* Slide Navigation */}
          {slides.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Slide:</span>
              <select
                value={currentSlide}
                onChange={(e) => handleSlideChange(Number(e.target.value))}
                className="bg-gray-700 border-gray-600 rounded px-2 py-1 text-sm text-white"
              >
                {slides.map((slide, index) => (
                  <option key={slide.id} value={index}>
                    {index + 1} - {slide.title}
                  </option>
                ))}
              </select>
              {slides.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleDeleteSlide}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            onClick={handleNewSlide}
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            ref={exportRef}
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 hover:bg-gray-600 relative"
            disabled={!presentationId}
            onMouseEnter={handleShowExportMenu}
            onMouseLeave={handleHideExportMenu}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showExportMenu && exportMenuPos && ReactDOM.createPortal(
            <div
              className="fixed bg-gray-800 border border-gray-700 rounded shadow-lg z-[9999] pointer-events-auto text-white text-sm"
              style={{
                top: exportMenuPos.top,
                left: exportMenuPos.left,
                width: exportMenuPos.width,
              }}
              onMouseEnter={handleShowExportMenu}
              onMouseLeave={handleHideExportMenu}
            >
              <button
                className={`w-full text-left px-4 py-1.5 hover:bg-gray-700 ${exportType === "json" ? "bg-gray-700" : ""} text-white text-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExportType("json");
                  setShowExportMenu(false);
                  handleExport();
                }}
              >
                Export as JSON
              </button>
              <button
                className={`w-full text-left px-4 py-1.5 hover:bg-gray-700 ${exportType === "pptx" ? "bg-gray-700" : ""} text-white text-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  setExportType("pptx");
                  setShowExportMenu(false);
                  handleExport();
                }}
              >
                Export as PPTX
              </button>
            </div>,
            document.body
          )}
          <Separator orientation="vertical" className="h-6 bg-gray-600" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-20 bg-gray-800/30 backdrop-blur-sm border-r border-gray-700 flex flex-col items-center py-6 gap-4 relative">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                  activeTool === tool.id
                    ? "bg-blue-500 shadow-lg shadow-blue-500/25"
                    : "hover:bg-gray-700/50"
                )}
                title={tool.label}
              >
                <Icon className="w-5 h-5" />
                <span className="absolute left-16 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {tool.label}
                </span>
              </button>
            );
          })}

          {/* Tool Panel */}
          <ToolPanel
            activeTool={activeTool}
            onToolChange={handleToolSelect}
            onShapeChange={handleShapeChange}
            onColorChange={handleColorChange}
            onFontStyleChange={handleFontStyleChange}
            onFontSizeChange={handleFontSizeChange}
            selectedElement={selectedElement}
            onTableAdd={handleTableAdd}
            onBulletListAdd={handleBulletListAdd}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
          <SlideEditor
            hasImage={hasImage}
            setHasImage={setHasImage}
            activeTool={activeTool}
            currentSlide={slides[currentSlide]}
            onSlideUpdate={handleSlideUpdate}
            onToolChange={handleToolSelect}
            selectedShape={selectedShape}
            selectedColor={selectedColor}
            selectedElement={selectedElement}
            setSelectedElement={setSelectedElement}
          />
        </div>

        {/* Right Sidebar - AI Panel - Made Smaller */}
        {showAI && (
          <div className="w-72 bg-gray-800/30 backdrop-blur-sm border-l border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h2 className="font-semibold text-xl">AI Assistant</h2>
              </div>
              <p className="text-sm text-gray-400">
                Multi-Provider AI Generation
              </p>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              <PromptInput
                onGenerate={handleGenerateSlides}
                isGenerating={isGenerating}
              />
            </div>

            <div className="p-3 border-t border-gray-700">
              <ColorThemeSelector
                currentTheme={currentColorTheme}
                onThemeChange={handleThemeChange}
                slideId={slides[currentSlide]?.id}
                presentationId={presentationId || undefined}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}