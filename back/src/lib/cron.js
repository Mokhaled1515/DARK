

import { CronJob } from "cron";
import https from "node:https";

const job = new CronJob("*/14 * * * *", function () {
  const base = process.env.FRONT_END_URL;
  if (!base) return;
  https.get(`${base}/health`, (res) => {
  }).on("error", () => {});
});

export default job;