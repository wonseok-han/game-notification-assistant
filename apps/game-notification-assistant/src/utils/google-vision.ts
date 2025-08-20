/**
 * Google Cloud Vision OCR 유틸리티
 * - 클라이언트에서 이미지를 base64로 변환하여 내부 API(`/api/ocr/google-vision`)에 전달
 * - 내부 API는 Vision API를 호출해 텍스트를 추출
 */

/**
 * File을 base64 문자열로 변환
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (!result) {
        reject(new Error('파일 읽기 결과가 비어있습니다.'));
        return;
      }
      const commaIndex = result.indexOf(',');
      const base64 = commaIndex >= 0 ? result.slice(commaIndex + 1) : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

/**
 * Google Vision API로 텍스트 추출
 */
export async function extractTextWithGoogleVision(
  imageFile: File
): Promise<string> {
  // base64 변환
  const base64Image = await fileToBase64(imageFile);

  const response = await fetch('/api/ocr/google-vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Google Vision API 호출 실패: ${response.status} ${err}`);
  }

  const result = (await response.json()) as {
    success: boolean;
    text?: string;
    message?: string;
  };

  console.log('Google Vision API 응답:', result);

  if (!result.success || !result.text) {
    throw new Error(result.message || '텍스트 추출에 실패했습니다.');
  }

  return result.text;
}
