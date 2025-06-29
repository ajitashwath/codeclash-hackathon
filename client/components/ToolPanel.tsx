import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Circle,
  Triangle,
  Palette,
  Type,
  Crop,
  Eraser,
  List,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import { createPortal } from "react-dom";

interface ToolPanelProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onAlignmentChange: (alignment: "left" | "center" | "right") => void;
  onShapeChange: (shape: "rectangle" | "circle" | "triangle") => void;
  onColorChange: (color: string) => void;
  onFontStyleChange?: (style: "bold" | "italic" | "underline") => void;
  onFontSizeChange?: (size: string) => void;
  selectedElement?: any;
  onTableAdd?: (rows: number, cols: number) => void;
  onBulletListAdd?: () => void;
}

export default function ToolPanel({
  activeTool,
  onToolChange,
  onAlignmentChange,
  onShapeChange,
  onColorChange,
  onFontStyleChange,
  onFontSizeChange,
  selectedElement,
  onTableAdd,
  onBulletListAdd,
}: ToolPanelProps) {
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
  ];

  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

  const [rows, setRows] = React.useState(2);
  const [cols, setCols] = React.useState(2);

  if (activeTool === "alignment") {
    return createPortal(
      <div className="absolute left-24 top-32 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-[1000]">
        <h3 className="text-sm font-medium text-white mb-2">Text Alignment</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => onAlignmentChange("left")}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => onAlignmentChange("center")}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => onAlignmentChange("right")}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  if (activeTool === "shape") {
    return createPortal(
      <div className="absolute left-24 top-32 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-[1000]">
        <h3 className="text-sm font-medium text-white mb-2">Shapes</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => onShapeChange("rectangle")}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => onShapeChange("circle")}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-gray-700"
            onClick={() => onShapeChange("triangle")}
          >
            <Triangle className="w-4 h-4" />
          </Button>
        </div>
        <h4 className="text-xs font-medium text-gray-400 mt-3 mb-2">Colors</h4>
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              className="w-6 h-6 rounded border-2 border-gray-600 hover:border-white transition-colors"
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      </div>,
      document.body
    );
  }

  if (activeTool === "text") {
    return createPortal(
      <div className="absolute left-24 top-32 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-[1000] min-w-[200px]">
        <h3 className="text-sm font-medium text-white mb-3">Text Formatting</h3>
        
        {/* Font Style */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Font Style</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
              onClick={() => onFontStyleChange?.("bold")}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
              onClick={() => onFontStyleChange?.("italic")}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
              onClick={() => onFontStyleChange?.("underline")}
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Font Size</h4>
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            onChange={(e) => onFontSizeChange?.(e.target.value)}
            defaultValue="16px"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Text Alignment */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Alignment</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
              onClick={() => onAlignmentChange("left")}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
              onClick={() => onAlignmentChange("center")}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-gray-700"
              onClick={() => onAlignmentChange("right")}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Text Color */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 mb-2">Text Color</h4>
          <div className="grid grid-cols-4 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className="w-6 h-6 rounded border-2 border-gray-600 hover:border-white transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>

        {/* Add Bullet List Option */}
        <div className="mt-3 pt-3 border-t border-gray-600">
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-blue-600 border-blue-500 text-white hover:bg-blue-500"
            onClick={() => {
              onBulletListAdd?.();
              onToolChange("select");
            }}
          >
            <List className="w-4 h-4 mr-2" />
            Add Bullet List
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  if (activeTool === "crop") {
    return createPortal(
      <div className="absolute left-24 top-32 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-[1000]">
        <h3 className="text-sm font-medium text-white mb-2">Crop Tool</h3>
        <p className="text-xs text-gray-400 mb-2">Select an image to crop</p>
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          onClick={() => onToolChange("select")}
        >
          Cancel
        </Button>
      </div>,
      document.body
    );
  }

  if (activeTool === "eraser") {
    return createPortal(
      <div className="absolute left-24 top-32 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-[1000]">
        <h3 className="text-sm font-medium text-white mb-2">Eraser</h3>
        <p className="text-xs text-gray-400 mb-2">
          Click elements to delete them
        </p>
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
          onClick={() => onToolChange("select")}
        >
          Done
        </Button>
      </div>,
      document.body
    );
  }

  if (activeTool === "table") {
    return createPortal(
      <div className="absolute left-24 top-32 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-[1000]">
        <h3 className="text-sm font-medium text-white mb-2">Insert Table</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            min={1}
            max={10}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Rows"
          />
          <span className="text-white">x</span>
          <input
            type="number"
            min={1}
            max={10}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="Columns"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="bg-blue-600 border-blue-500 text-white hover:bg-blue-500"
          onClick={() => {
            onTableAdd?.(rows, cols);
            onToolChange("select");
          }}
        >
          Add Table
        </Button>
      </div>,
      document.body
    );
  }

  return null;
}