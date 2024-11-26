export async function* readFileByChunks(file: File, chunkSize = 64 * 1024) {
  let offset = 0;
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize);
    const text = await chunk.text();
    yield text;
    offset += chunkSize;
  }
}

export async function processLargeCSV(
  file: File,
  rowsPerFile: number,
  onProgress: (progress: number) => void,
  onFileReady: (content: string, index: number) => void
): Promise<{ totalFiles: number; header: string }> {
  let header = '';
  let currentFileContent: string[] = [];
  let fileIndex = 0;
  let lineBuffer = '';
  let isFirstChunk = true;
  let totalLines = 0;

  for await (const chunk of readFileByChunks(file)) {
    const lines = (lineBuffer + chunk).split('\n');
    lineBuffer = lines.pop() || ''; // Keep partial line for next chunk

    if (isFirstChunk) {
      header = lines[0];
      lines.shift(); // Remove header from processing
      isFirstChunk = false;
    }

    for (const line of lines) {
      if (line.trim()) {
        currentFileContent.push(line);
        totalLines++;

        if (currentFileContent.length >= rowsPerFile) {
          const content = header + '\n' + currentFileContent.join('\n');
          onFileReady(content, fileIndex++);
          currentFileContent = [];
        }
      }
    }

    // Update progress
    onProgress((file.size / chunk.length) * 100);
  }

  // Handle last chunk if there's remaining content
  if (lineBuffer.trim()) {
    currentFileContent.push(lineBuffer);
    totalLines++;
  }

  // Handle remaining lines
  if (currentFileContent.length > 0) {
    const content = header + '\n' + currentFileContent.join('\n');
    onFileReady(content, fileIndex++);
  }

  return { totalFiles: fileIndex, header };
}