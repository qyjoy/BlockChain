"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  disabledMessage?: string
}

export function FileUploader({ onFilesSelected, disabled = false, disabledMessage }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      setSelectedFiles(filesArray)
      onFilesSelected(filesArray)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      setSelectedFiles(filesArray)
      onFilesSelected(filesArray)
    }
  }

  const handleButtonClick = () => {
    if (disabled) return

    inputRef.current?.click()
  }

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return "🖼️"
    if (type.includes("audio")) return "🎵"
    if (type.includes("video")) return "🎬"
    if (type.includes("pdf")) return "📄"
    return "📁"
  }

  return (
    <div className="grid gap-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4 ${
          disabled
            ? "border-gray-200 bg-muted/30 opacity-70"
            : dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-700"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium">
            {disabled ? "Uploader unavailable" : "Drag and drop your files here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {disabled ? (disabledMessage || "Waiting for wallet connection") : "or click to browse"}
          </p>
        </div>
        <input ref={inputRef} type="file" className="hidden" multiple onChange={handleChange} disabled={disabled} />
        <Button type="button" variant="outline" onClick={handleButtonClick} disabled={disabled}>
          Select Files
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="grid gap-2">
          <p className="text-sm font-medium">Selected Files:</p>
          <div className="border rounded-lg divide-y">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFileIcon(file.type)}</div>
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type || "Unknown type"} • {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

