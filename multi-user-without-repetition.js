import exec from 'k6/execution';
import http from 'k6/http';
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';

const authTokens = new SharedArray('authTokens', function () {
  return papaparse.parse(open('./tokens.csv'), { header: true }).data;
});

// It is recommended that `totalUser / totalVu` is not a float
// so all tokens can be distributed equally to each VU.
const totalVu = 10
const totalUser = 20
const totalIteration = Math.ceil(totalUser / totalVu)

export const options = {
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
  scenarios: {
    main: {
        // Use per-vu-iterations so each VU will have the same number of iteration.
        executor: 'per-vu-iterations',
        vus: totalVu,
        iterations: totalIteration,
    }
  }
};

export default function () {
  // Use iterationInInstance as the ID because the (max ID number + 1) is equal to total VU
  const vuId = exec.vu.iterationInInstance

  // Use idInInstance as the ID because the max ID number is equal to total iteration
  const iterationId = exec.vu.idInInstance

  // Each VU will have their own index range to get the token from the array. For example for 2 VU & 5 iteration per VU:3
  // - VU 1 -> [0, 1, 2, 3, 4]
  // - VU 2 -> [5, 6, 7, 8, 9]
  const indexStart = (vuId) * totalVu
  const index = indexStart + iterationId - 1

  const token = authTokens[index].token
  const host = 'https://api-dev.sejutacita.id'

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
    'quality-assurance-qa-tester-23',
    'data-analyst-22',
    'data-engineer-15'
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
