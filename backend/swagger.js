const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRUD API",
      version: "1.0.0",
      description: "Simple CRUD API documentation",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Docker compose",
      },
      {
        url: "http://localhost:5000",
        description: "Local backend",
      },
    ],
  },
  apis: [path.join(__dirname, "app.js")],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
