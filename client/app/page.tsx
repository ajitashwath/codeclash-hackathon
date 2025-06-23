"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MousePointer,
  Crop,
  AlignLeft,
  Type,
  Square,
  Eraser,
  Table2,
  Plus,
  Save,
  Download,
  Sparkles,
} from "lucide-react";
import PromptInput from "./PromptInput";
import SlideEditor from "./SlideEditor";
import ToolPanel from "@/components/ToolPanel";
import { Slide, SlideElement } from "@/types/slide";

// Define your type here

const tools = [
  { id: "select", icon: MousePointer, label: "Select" },
  { id: "crop", icon: Crop, label: "Crop" },
  { id: "alignment", icon: AlignLeft, label: "Alignment" },
  { id: "text", icon: Type, label: "Text" },
  { id: "shape", icon: Square, label: "Shape" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
  { id: "table", icon: Table2, label: "Table" },
];

export default function App() {
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPresentationId(`pres_${Date.now()}`);
      alert("Presentation saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving presentation. Please try again.");
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Presentation exported successfully!");
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
  const handleGenerateSlides = async (prompt: string) => {
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const generatedSlides: Slide[] = [
        {
          id: 1,
          title: "Introduction",
          content: "Welcome to our presentation",
          notes: "This is the opening slide",
          elements: [],
        },
        {
          id: 2,
          title: "Main Content",
          content: "Key points and information",
          notes: "Elaborate on the main topics",
          elements: [],
        },
      ];
      setSlides(generatedSlides);
      setCurrentSlide(0);
      setPresentationId(`ai_pres_${Date.now()}`);
      setHasImage(true);
      alert("Presentation generated successfully!");
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

  // Tool panel handlers
  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    console.log("Alignment changed to:", alignment);
  };

  const handleShapeChange = (shape: "rectangle" | "circle" | "triangle") => {
    setSelectedShape(shape);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

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
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 hover:bg-gray-600"
            onClick={handleExport}
            disabled={!presentationId}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
            onAlignmentChange={handleAlignmentChange}
            onShapeChange={handleShapeChange}
            onColorChange={handleColorChange}
            onTableAdd={handleTableAdd}
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
          />
        </div>

        {/* Right Sidebar - AI Panel */}
        {showAI && (
          <div className="w-80 bg-gray-800/30 backdrop-blur-sm border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <h2 className="font-semibold">AI</h2>
              </div>
              <p className="text-sm text-gray-400">
                AI Presentation Generation
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Create presentations from text descriptions using advanced AI
              </p>
            </div>

            <div className="flex-1 p-4">
              <PromptInput
                onGenerate={handleGenerateSlides}
                isGenerating={isGenerating}
              />
            </div>

            <div className="p-4 border-t border-gray-700">
              <h3 className="text-sm font-medium mb-3">Quick Inspirations</h3>
              <div className="space-y-2">
                <button
                  className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-sm"
                  onClick={() =>
                    handleGenerateSlides(
                      "Business presentation with sales statistics data"
                    )
                  }
                  disabled={isGenerating}
                >
                  Business presentation with sales statistics data
                </button>
                <button
                  className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-sm"
                  onClick={() =>
                    handleGenerateSlides(
                      "Marketing strategy deck with growth metrics"
                    )
                  }
                  disabled={isGenerating}
                >
                  Marketing strategy deck with growth metrics
                </button>
                <button
                  className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors text-sm"
                  onClick={() =>
                    handleGenerateSlides(
                      "Product launch presentation with timeline"
                    )
                  }
                  disabled={isGenerating}
                >
                  Product launch presentation with timeline
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
