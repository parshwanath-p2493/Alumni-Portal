// // // /** @type {import('postcss-load-config').Config} */
// // // const config = {
// // //   plugins: {
// // //     tailwindcss: {},
// // //   },
// // // };
// // // postcss.config.js
// // // module.exports = {
// // //   plugins: {
// // //     tailwindcss: {},
// // //     autoprefixer: {},
// // //   },
// // // };
// // // export default {
// // //   plugins: {
  
// // //     tailwindcss: {},
// // //     autoprefixer: {},
// // //   },
// // // };
// // module.exports = {
// //   plugins: {
// //     '@tailwindcss/postcss': {},
// //     autoprefixer: {},
// //   },
// // };

// // //export default config;
// /** @type {import('postcss-load-config').Config} */
// const config = {
//   plugins: {
//     tailwindcss: {},
//   },
// };

// export default config;
// postcss.config.mjs
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
  ],
};
