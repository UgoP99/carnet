export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

/** Shares a file via the Web Share API (iOS share sheet) or falls back to a browser download. */
export async function shareOrDownloadFile(
  filename: string,
  content: string,
  mimeType: string,
): Promise<ShareOutcome> {
  const file = new File([content], filename, { type: mimeType });

  if ('canShare' in navigator && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      throw error;
    }
  }

  downloadFile(file);
  return 'downloaded';
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
