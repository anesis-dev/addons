// Named rather than an inline default export: `eslint-config-next` warns on
// anonymous default exports, and this file lands in Next projects too.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
