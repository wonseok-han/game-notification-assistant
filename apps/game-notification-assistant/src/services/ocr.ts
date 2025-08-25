import { apiPost, parseApiResponse } from '@utils/api-client';

/**
 * Google Vision API 호출
 * @param image - 이미지 데이터
 * @returns {GoogleVisionResponseType} Google Vision API 응답 데이터
 */
export async function googleVision(
  image: string
): Promise<GoogleVisionResponseType> {
  try {
    const response = await apiPost('/api/ocr/google-vision', { image });

    const result =
      await parseApiResponse<ApiResponseType<GoogleVisionResponseType>>(
        response
      );

    if (!result.success || !result.data) {
      throw new Error(
        result.message || 'Google Vision API 호출에 실패했습니다.'
      );
    }

    return result.data;
  } catch (error) {
    console.error('Google Vision API 호출 오류:', error);
    throw error;
  }
}
