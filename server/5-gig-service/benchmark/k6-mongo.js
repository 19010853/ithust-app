/**
 * k6-mongo.js — Load test cho MongoDB search endpoint
 *
 * Chạy:
 *   k6 run --env MONGO_MODE=text  benchmark/k6-mongo.js
 *   k6 run --env MONGO_MODE=regex benchmark/k6-mongo.js
 *   k6 run --env MONGO_MODE=text --out json=benchmark/results/mongo-text-results.json benchmark/k6-mongo.js
 *
 * Biến môi trường:
 *   BASE_URL    — mặc định http://localhost:4004
 *   MONGO_MODE  — 'text' (mặc định) hoặc 'regex'
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const mongoLatency  = new Trend('mongo_latency',  true);
const mongoErrors   = new Rate('mongo_errors');
const mongoRequests = new Counter('mongo_requests');

export const options = {
  scenarios: {
    benchmark: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s',  target: 10  },
        { duration: '60s',  target: 50  },
        { duration: '120s', target: 50  },
        { duration: '30s',  target: 100 },
        { duration: '30s',  target: 0   }
      ]
    }
  },
  thresholds: {
    mongo_latency: ['p(95)<5000'],
    mongo_errors:  ['rate<0.10']
  }
};

const BASE_URL   = __ENV.BASE_URL   || 'http://localhost:4004';
const MONGO_MODE = __ENV.MONGO_MODE || 'text';
const QUERIES    = ['programming', 'design', 'logo', 'video', 'marketing', 'writing', 'music', 'data'];

export default function () {
  const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const url   = `${BASE_URL}/benchmark/mongo/search/0/10/forward?query=${query}&mode=${MONGO_MODE}&minprice=100000&maxprice=5000000`;

  const res = http.get(url, { tags: { engine: `mongodb-${MONGO_MODE}` } });

  mongoLatency.add(res.timings.duration);
  mongoRequests.add(1);
  mongoErrors.add(res.status !== 200);

  check(res, {
    'Mongo status 200': (r) => r.status === 200,
    'Mongo has gigs':   (r) => {
      try { return JSON.parse(r.body).gigs?.length >= 0; } catch { return false; }
    }
  });

  sleep(0.1);
}
