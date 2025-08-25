/**
 * Google Cloud Vision OCR 유틸리티
 * - 클라이언트에서 이미지를 base64로 변환하여 내부 API(`/api/ocr/google-vision`)에 전달
 * - 내부 API는 Vision API를 호출해 텍스트를 추출
 */

import { googleVision } from '@services/ocr';

/**
 * File을 base64 문자열로 변환
 * @param {File} file - 파일 객체
 * @returns {Promise<string>} base64 문자열
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
 * @param {File} imageFile - 이미지 파일
 * @returns {Promise<string>} 텍스트 추출 결과
 */
export async function extractTextWithGoogleVision(
  imageFile: File
): Promise<string> {
  // base64 변환
  const base64Image = await fileToBase64(imageFile);

  const response = await googleVision(base64Image);

  return response.text;
}
