import http from "k6/http";
import { check, sleep } from "k6";

// 1. Configure the traffic attack parameters
export const options = {
  scenarios: {
    blitz_attack: {
      executor: "constant-arrival-rate",
      rate: 10000, // Target: 10,000 requests!
      timeUnit: "30s", // Distributed smoothly across a 30-second window
      duration: "30s", // Total length of the test execution
      preAllocatedVUs: 200, // Pre-warm 200 virtual user threads to prevent client-side lag
      maxVUs: 1000, // Max out at 1000 virtual users if necessary
    },
  },
};

export default function () {
  const url = "http://localhost:3000/api/v1/checkout";

  // Generate a random payload representing a unique customer checkout attempt
  const payload = JSON.stringify({
    userId: `simulated_user_${Math.random().toString(36).substring(2, 9)}`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // 2. Fire the POST request at our high-speed gatekeeper endpoint
  const res = http.post(url, payload, params);

  // 3. Telemetry Evaluation: Track successful claims (200) vs graceful rejections (410)
  check(res, {
    "Status is either 200 or 410": (r) => r.status === 200 || r.status === 410,
    "Response time under 50ms": (r) => r.timings.duration < 50,
  });

  // Short pause between virtual actions to maintain runtime integrity
  sleep(0.1);
}
