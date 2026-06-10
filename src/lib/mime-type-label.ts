const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word Document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
  'image/jpeg': 'JPEG Image',
  'image/png': 'PNG Image',
};

export const ALLOWED_MIME_TYPES = new Set(Object.keys(MIME_LABELS));

export function mimeTypeLabel(mimeType: string): string {
  return MIME_LABELS[mimeType] ?? mimeType;
}

export function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function validateFileSize(sizeInBytes: number): boolean {
  return sizeInBytes <= 50 * 1024 * 1024;
}
