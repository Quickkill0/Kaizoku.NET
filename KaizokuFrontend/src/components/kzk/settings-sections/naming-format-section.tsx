"use client";

import React, { useRef, useMemo } from 'react';
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Settings } from "@/lib/api/types";

// Sample data for preview generation
const SAMPLE_DATA = {
  Series: "One Piece",
  Chapter: "1089",
  Volume: "105",
  Provider: "MangaDex",
  Scanlator: "TCB Scans",
  Language: "en",
  Title: "The Decisive Battle",
  Year: "2024",
  Month: "01",
  Day: "15",
  Type: "Manga",
};

// File name template variables
const FILE_NAME_VARIABLES = [
  { name: "{Series}", description: "Series title" },
  { name: "{Chapter}", description: "Chapter number" },
  { name: "{Chapter:000}", description: "Chapter with padding" },
  { name: "{Volume}", description: "Volume number" },
  { name: "{Provider}", description: "Source provider" },
  { name: "{Scanlator}", description: "Scanlator group" },
  { name: "{Language}", description: "Language code" },
  { name: "{Title}", description: "Chapter title" },
  { name: "{Year}", description: "Year" },
  { name: "{Month}", description: "Month" },
  { name: "{Day}", description: "Day" },
];

// Folder template variables
const FOLDER_VARIABLES = [
  { name: "{Series}", description: "Series title" },
  { name: "{Type}", description: "Content type (Manga, Manhwa, etc.)" },
  { name: "{Provider}", description: "Source provider" },
  { name: "{Language}", description: "Language code" },
  { name: "{Year}", description: "Year" },
];

// Output format options
const OUTPUT_FORMATS = [
  { value: "0", label: "CBZ (Comic Book ZIP)" },
  { value: "1", label: "PDF (Portable Document Format)" },
];

// Chapter padding options
const CHAPTER_PADDING_OPTIONS = [
  { value: "auto", label: "Auto (based on max chapter)" },
  { value: "0", label: "None (1, 2, 10)" },
  { value: "00", label: "2 digits (01, 02)" },
  { value: "000", label: "3 digits (001, 002)" },
  { value: "0000", label: "4 digits (0001, 0002)" },
];

// Volume padding options
const VOLUME_PADDING_OPTIONS = [
  { value: "0", label: "None (1, 2, 10)" },
  { value: "00", label: "2 digits (01, 02)" },
  { value: "000", label: "3 digits (001, 002)" },
];

interface NamingFormatSectionProps {
  localSettings: Settings;
  setLocalSettings: (updater: (prev: Settings) => Settings) => void;
}

// Variable Chip Component
function VariableChip({
  variable,
  onClick
}: {
  variable: { name: string; description: string };
  onClick: () => void;
}) {
  return (
    <Badge
      variant="outline"
      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
      onClick={onClick}
      title={variable.description}
    >
      {variable.name}
    </Badge>
  );
}

// Template Input with Variable Chips
function TemplateInput({
  id,
  label,
  description,
  value,
  onChange,
  variables,
  preview,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  variables: Array<{ name: string; description: string }>;
  preview: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChipClick = (variableName: string) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart ?? value.length;
      const end = input.selectionEnd ?? value.length;
      const newValue = value.slice(0, start) + variableName + value.slice(end);
      onChange(newValue);

      // Restore focus and set cursor position after the inserted variable
      setTimeout(() => {
        input.focus();
        const newPosition = start + variableName.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    } else {
      // Fallback: append to end
      onChange(value + variableName);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}...`}
          className="mt-1.5"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Click to insert variable:</Label>
        <div className="flex flex-wrap gap-1.5">
          {variables.map((variable) => (
            <VariableChip
              key={variable.name}
              variable={variable}
              onClick={() => handleChipClick(variable.name)}
            />
          ))}
        </div>
      </div>

      <div className="p-3 bg-muted/50 rounded-md border">
        <p className="text-sm">
          <span className="font-medium text-muted-foreground">Preview: </span>
          <span className="font-mono text-primary">{preview}</span>
        </p>
      </div>
    </div>
  );
}

// Generate preview from template
function generatePreview(
  template: string,
  sampleData: Record<string, string>,
  chapterPadding: string,
  volumePadding: string,
  outputFormat: number,
  includeChapterTitle: boolean,
  isFolder: boolean = false
): string {
  if (!template) {
    return isFolder ? "Manga/One Piece/" : "[MangaDex][en] One Piece 1089.cbz";
  }

  let result = template;

  // Replace standard variables
  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, value);
  });

  // Handle Chapter padding
  const chapterNum = parseInt(sampleData.Chapter, 10);
  let paddedChapter = sampleData.Chapter;

  if (chapterPadding === "auto") {
    paddedChapter = chapterNum.toString().padStart(4, '0'); // Assume max chapter for preview
  } else if (chapterPadding === "00") {
    paddedChapter = chapterNum.toString().padStart(2, '0');
  } else if (chapterPadding === "000") {
    paddedChapter = chapterNum.toString().padStart(3, '0');
  } else if (chapterPadding === "0000") {
    paddedChapter = chapterNum.toString().padStart(4, '0');
  }

  // Replace {Chapter:000} style patterns
  result = result.replace(/\{Chapter:\d+\}/gi, paddedChapter);

  // Handle Volume padding
  const volumeNum = parseInt(sampleData.Volume, 10);
  let paddedVolume = sampleData.Volume;

  if (volumePadding === "00") {
    paddedVolume = volumeNum.toString().padStart(2, '0');
  } else if (volumePadding === "000") {
    paddedVolume = volumeNum.toString().padStart(3, '0');
  }

  // Apply volume padding to already replaced Volume values
  result = result.replace(new RegExp(sampleData.Volume, 'g'), paddedVolume);

  // Handle title inclusion
  if (!includeChapterTitle) {
    // Remove title from the preview if it was included
    result = result.replace(new RegExp(`\\s*-?\\s*${sampleData.Title}`, 'gi'), '');
  }

  // Add file extension for file names (not folders)
  if (!isFolder) {
    const extension = outputFormat === 1 ? ".pdf" : ".cbz";
    if (!result.endsWith(extension)) {
      result = result + extension;
    }
  } else {
    // Ensure folder paths end with /
    if (!result.endsWith('/')) {
      result = result + '/';
    }
  }

  return result;
}

export function NamingFormatSection({
  localSettings,
  setLocalSettings
}: NamingFormatSectionProps) {
  // Derive default values if not set
  const fileNameTemplate = localSettings.fileNameTemplate ?? "[{Provider}][{Language}] {Series} {Chapter}";
  const folderTemplate = localSettings.folderTemplate ?? "{Type}/{Series}";
  const chapterPadding = localSettings.chapterPadding ?? "auto";
  const volumePadding = localSettings.volumePadding ?? "0";
  const outputFormat = localSettings.outputFormat ?? 0;
  const includeChapterTitle = localSettings.includeChapterTitle ?? false;

  // Generate live previews
  const fileNamePreview = useMemo(() =>
    generatePreview(
      fileNameTemplate,
      SAMPLE_DATA,
      chapterPadding,
      volumePadding,
      outputFormat,
      includeChapterTitle,
      false
    ),
    [fileNameTemplate, chapterPadding, volumePadding, outputFormat, includeChapterTitle]
  );

  const folderPreview = useMemo(() =>
    generatePreview(
      folderTemplate,
      SAMPLE_DATA,
      chapterPadding,
      volumePadding,
      outputFormat,
      includeChapterTitle,
      true
    ),
    [folderTemplate, chapterPadding, volumePadding, outputFormat, includeChapterTitle]
  );

  return (
    <CardContent className="space-y-6">
      {/* File Name Template */}
      <TemplateInput
        id="file-name-template"
        label="File Name Template"
        description="Define how downloaded chapter files are named"
        value={fileNameTemplate}
        onChange={(value) => setLocalSettings(prev => ({
          ...prev,
          fileNameTemplate: value
        }))}
        variables={FILE_NAME_VARIABLES}
        preview={fileNamePreview}
      />

      {/* Folder Structure Template */}
      <TemplateInput
        id="folder-template"
        label="Folder Structure Template"
        description="Define the folder hierarchy for organizing series"
        value={folderTemplate}
        onChange={(value) => setLocalSettings(prev => ({
          ...prev,
          folderTemplate: value
        }))}
        variables={FOLDER_VARIABLES}
        preview={folderPreview}
      />

      {/* Output Format and Padding Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Output Format */}
        <div className="space-y-2">
          <Label htmlFor="output-format">Output Format</Label>
          <Select
            value={outputFormat.toString()}
            onValueChange={(value) => setLocalSettings(prev => ({
              ...prev,
              outputFormat: parseInt(value, 10)
            }))}
          >
            <SelectTrigger id="output-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            File format for downloaded chapters
          </p>
        </div>

        {/* Chapter Padding */}
        <div className="space-y-2">
          <Label htmlFor="chapter-padding">Chapter Padding</Label>
          <Select
            value={chapterPadding}
            onValueChange={(value) => setLocalSettings(prev => ({
              ...prev,
              chapterPadding: value
            }))}
          >
            <SelectTrigger id="chapter-padding">
              <SelectValue placeholder="Select padding" />
            </SelectTrigger>
            <SelectContent>
              {CHAPTER_PADDING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Zero-padding for chapter numbers
          </p>
        </div>

        {/* Volume Padding */}
        <div className="space-y-2">
          <Label htmlFor="volume-padding">Volume Padding</Label>
          <Select
            value={volumePadding}
            onValueChange={(value) => setLocalSettings(prev => ({
              ...prev,
              volumePadding: value
            }))}
          >
            <SelectTrigger id="volume-padding">
              <SelectValue placeholder="Select padding" />
            </SelectTrigger>
            <SelectContent>
              {VOLUME_PADDING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Zero-padding for volume numbers
          </p>
        </div>
      </div>

      {/* Include Chapter Title Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="include-chapter-title" className="text-base">
            Include Chapter Title
          </Label>
          <p className="text-sm text-muted-foreground">
            Include chapter title in filename when available from the source
          </p>
        </div>
        <Switch
          id="include-chapter-title"
          checked={includeChapterTitle}
          onCheckedChange={(checked) => setLocalSettings(prev => ({
            ...prev,
            includeChapterTitle: checked
          }))}
        />
      </div>
    </CardContent>
  );
}
