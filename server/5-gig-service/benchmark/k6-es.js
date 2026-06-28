/**
 * k6-es.js — Load test cho Elasticsearch search endpoint
 *
 * Chạy:
 *   k6 run benchmark/k6-es.js
 *   k6 run --out json=benchmark/results/es-results.json benchmark/k6-es.js
 *
 * Biến môi trường:
 *   BASE_URL   — mặc định http://localhost:4004
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const esLatency   = new Trend('es_latency',   true);
const esErrors    = new Rate('es_errors');
const esRequests  = new Counter('es_requests');

export const options = {
  scenarios: {
    benchmark: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s',  target: 10  },  // warm-up
        { duration: '60s',  target: 50  },  // ramp
        { duration: '120s', target: 50  },  // sustained — measurement window
        { duration: '30s',  target: 100 },  // peak
        { duration: '30s',  target: 0   }   // cool-down
      ]
    }
  },
  thresholds: {
    es_latency: ['p(95)<1000'],
    es_errors:  ['rate<0.05']
  }
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4004';
const QUERIES  = ['programming', 'design', 'logo', 'video', 'marketing', 'writing', 'music', 'data'];

export default function () {
  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const url   = `${BASE_URL}/benchmark/search/0/10/forward?query=${query}&minprice=100000&maxprice=5000000`;

  const res = http.get(url, { tags: { engine: 'elasticsearch' } });

  esLatency.add(res.timings.duration);
  esRequests.add(1);
  esErrors.add(res.status !== 200);

  check(res, {
    'ES status 200':     (r) => r.status === 200,
    'ES has gigs':       (r) => {
      try { return JSON.parse(r.body).gigs?.length >= 0; } catch { return false; }
    }
  });

  sleep(0.1);
}
