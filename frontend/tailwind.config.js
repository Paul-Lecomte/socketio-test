const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{jsx,js,ts,tsx}"  // Make sure this includes all your component file types
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
