"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, Image as ImageIcon, File, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

interface FileUploadProps {
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  files,
  onFilesChange,
  accept = "image/*",
  multiple = true,
  maxFiles,
  maxSizeMB = 10,
  label = "Upload Files",
  description,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File "${file.name}" exceeds maximum size of ${maxSizeMB}MB`;
    }
    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        resolve("");
      }
    });
  };

  const processFiles = useCallback(
    async (newFiles: File[]) => {
      const validationErrors: string[] = [];
      const validFiles: FileWithPreview[] = [];

      // Check max files limit
      if (maxFiles && files.length + newFiles.length > maxFiles) {
        validationErrors.push(`Maximum ${maxFiles} file(s) allowed`);
        setErrors(validationErrors);
        return;
      }

      for (const file of newFiles) {
        const error = validateFile(file);
        if (error) {
          validationErrors.push(error);
          continue;
        }

        try {
          const preview = file.type.startsWith("image/") ? await createPreview(file) : undefined;
          const fileWithPreview: FileWithPreview = Object.assign(file, {
            preview,
            id: `${Date.now()}-${Math.random()}`,
          });
          validFiles.push(fileWithPreview);
        } catch (err) {
          validationErrors.push(`Failed to process "${file.name}"`);
        }
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setTimeout(() => setErrors([]), 5000);
      }

      if (validFiles.length > 0) {
        // If single file mode, replace existing files; otherwise append
        if (!multiple && maxFiles === 1) {
          onFilesChange(validFiles.slice(0, 1));
        } else {
          onFilesChange([...files, ...validFiles]);
        }
      }
    },
    [files, maxFiles, maxSizeMB, onFilesChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles);
      }
    },
    [disabled, processFiles]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (fileId: string) => {
    onFilesChange(files.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="size-5 text-primary" />;
    }
    return <File className="size-5 text-muted-foreground" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-2xl transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          "bg-muted/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
          <div
            className={cn(
              "size-16 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-primary/20" : "bg-primary/10"
            )}
          >
            <Upload
              className={cn(
                "size-8 transition-transform",
                isDragging && "scale-110",
                "text-primary"
              )}
            />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground">
              or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-primary hover:underline font-medium"
              >
                browse from your computer
              </button>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {accept.includes("image") ? "Images" : "Files"} up to {maxSizeMB}MB
              {maxFiles && ` • Maximum ${maxFiles} file(s)`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            {files.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFilesChange([])}
                className="text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all"
              >
                <div className="aspect-square relative bg-muted">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                      onClick={() => removeFile(file.id!)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="absolute top-2 right-2">
                  <div className="size-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="size-3 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
