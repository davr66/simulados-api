import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const healthResponse = http.get(`${baseUrl}/health`);
  check(healthResponse, {
    'health retorna 200': (response) => response.status === 200,
  });

  const simuladoResponse = http.get(
    `${baseUrl}/api/v1/simulados?banca_id=1&concurso_id=1&quantidade=5`,
    {
      headers: {
        'X-Trace-Id': `k6-${__VU}-${__ITER}`,
      },
    },
  );
  check(simuladoResponse, {
    'simulado retorna 200': (response) => response.status === 200,
    'simulado retorna questões': (response) => {
      const body = response.json();
      return Array.isArray(body) && body.length > 0;
    },
  });

  sleep(1);
}
