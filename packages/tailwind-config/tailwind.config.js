/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      screens: {
        // 기본 브레이크포인트 수정
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
