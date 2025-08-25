import type { NextRequest } from 'next/server';

import { MiddlewareWithPOST } from '@server/custom-method';
import { NextResponse } from 'next/server';

/**
 * Google Cloud Vision API를 호출하여 이미지에서 텍스트를 추출하는 API
 * @param {NextRequest} request - 요청 객체
 * @returns {NextResponse} 응답 객체
 */
export const POST = MiddlewareWithPOST(async (request: NextRequest) => {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, message: '이미지가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // Google Cloud Vision API 호출
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: image,
              },
              features: [
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 50,
                },
              ],
              imageContext: {
                languageHints: ['ko', 'en'],
              },
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json();
      console.error('Google Vision API 오류:', errorData);

      return NextResponse.json(
        {
          success: false,
          message: 'Google Vision API 호출에 실패했습니다.',
        },
        { status: visionResponse.status }
      );
    }

    const visionData = await visionResponse.json();

    // 텍스트 추출 결과 처리
    const textAnnotations = visionData.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      return NextResponse.json(
        { success: false, message: '이미지에서 텍스트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 전체 텍스트 추출 (첫 번째 항목이 전체 텍스트)
    const rawText = textAnnotations[0]?.description || '';

    // 텍스트 정리 및 필터링 적용
    const fullText = sanitizeAndFilterText(rawText, 0.8);
    // const fullText = removeSpecialChars(filteredText);

    // 개별 텍스트 항목들 (위치 정보 포함)
    const individualTexts = textAnnotations
      .slice(1)
      .map(
        (annotation: {
          description: string;
          boundingPoly: { vertices: { x: number; y: number }[] };
        }) => ({
          text: annotation.description,
          bounds: annotation.boundingPoly?.vertices,
        })
      );

    console.log('Google Vision API 응답:', {
      rawTextLength: rawText.length,
      filteredTextLength: fullText.length,
      individualTextsCount: individualTexts.length,
      sampleTexts: individualTexts
        .slice(0, 3)
        .map((t: { text: string }) => t.text),
    });

    return NextResponse.json({
      success: true,
      data: {
        text: fullText,
        individualTexts,
      },
      message: '텍스트 추출이 성공했습니다.',
    });
  } catch (error) {
    console.error('Google Vision API 처리 중 오류:', error);

    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
});

// 허용 문자 비율 계산 함수
function calculateAllowedCharRatio(line: string): number {
  const allowedChars =
    line.match(
      /[\p{Script=Hangul}A-Za-z0-9\s:~\-.,()/오전후시분초일월까지남음]/gu
    ) || [];
  return allowedChars.length / line.length;
}

// 특수문자 제거 함수
function removeSpecialChars(text: string): string {
  return text
    .replace(/["""''④©①]/g, '') // 특수문자 제거
    .replace(/^\s+|\s+$/g, '') // 앞뒤 공백 제거
    .replace(/\n\s*\n/g, '\n'); // 빈 줄 제거
}

// 텍스트 정리 + 허용 비율 필터링
function sanitizeAndFilterText(rawText: string, minRatio = 0.6): string {
  const lines = rawText.split('\n');

  return lines
    .map((line) => removeSpecialChars(line).trim())
    .filter((line) => {
      if (line.length === 0) return false;

      const ratio = calculateAllowedCharRatio(line);
      // 허용 비율이 기준값보다 낮으면 제거
      return ratio >= minRatio;
    })
    .join('\n');
}
