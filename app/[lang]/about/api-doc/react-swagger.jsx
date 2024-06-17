import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(
  () => import('swagger-ui-react'),
  { ssr: false }
);

function ReactSwagger({ spec }) {
  return <SwaggerUI spec={spec} />;
}

export default ReactSwagger;