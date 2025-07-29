/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "orange",
      },
      backgroundColor: {
        primary: "orange",
      },
       screens: {
        'xs': '325px',
        'xsm': '370px',
        'sm2': '425px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
