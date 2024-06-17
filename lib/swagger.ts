import { createSwaggerSpec } from "next-swagger-doc";
import config from "next-swagger-doc.json";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec(config);
  return spec;
};
