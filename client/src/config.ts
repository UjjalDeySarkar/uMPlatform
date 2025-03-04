const config = {
    development: {
      API_BASE_URL: "http://localhost:8000",
    },
    production: {
      API_BASE_URL: "",
    },
  };
  
  export default config.development;
  