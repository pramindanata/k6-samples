import exec from 'k6/execution';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

const authTokens = new SharedArray('authTokens', function () {
  return papaparse.parse(open('./tokens.csv'), { header: true }).data;
});

export const options = {
  vus: 30,
  duration: '60s',
  discardResponseBodies: true,
  thresholds: {
    'http_req_duration{name:getMyStudentData}': [],
    'http_req_duration{name:getJobBySlug}': []
  },
  summaryTrendStats: [
    'avg',
    'min',
    'med',
    'max',
    'p(90)',
    'p(95)',
    'p(97)',
    'p(99)',
    'count'
  ],
};

export default function () {
  const index = (exec.vu.idInTest - 1) % authTokens.length;
  const token = authTokens[index].token
  const host = 'http://localhost'

  http.get(
    `${host}/v1/job-portal/me/student`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      tags: {
        name: "getMyStudentData",
      }
    }
  );

  const slugs = [
    'senior-product-manager',
    'software-engineer-backend',
    'beep-engineer'
  ]

  const randomizedSlug = slugs[Math.floor(Math.random() * slugs.length)]

  http.get(
    `${host}/v1/job-portal/job/slug/${randomizedSlug}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
      tags: {
        name: "getJobBySlug",
      }
    }
  )
}
