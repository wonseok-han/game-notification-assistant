/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      oneOf: [
        {
          issuer: /\.[jt]sx?$/, // .jsx, .tsx 파일에서 SVG를 React 컴포넌트로 사용
          use: ['@svgr/webpack'],
        },
        {
          issuer: /\.s[0,1]css$/, // .css, .scss 파일에서 SVG를 URL로 사용
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash].[ext]',
                outputPath: 'static/media',
                publicPath: '/_next/static/media',
              },
            },
          ],
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
