import http from 'k6/http';

export const options = {
  vus: 30,
  duration: '60s',
  discardResponseBodies: true,
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
  const host = 'http://localhost'

  http.get(`${host}/v1/job-portal/job/slug/software-engineer-backend`)
}
