/**
 * Is `true` if we can reasonably assume that this is a Node environment.
 */
export const isNode: boolean =
  Object.prototype.toString.call(
    typeof process !== "undefined" ? process : 0
  ) === "[object process]";

let startCpuTime: ReturnType<typeof process.hrtime> | null = null;
let startCpuUsage: NodeJS.CpuUsage | null = null;

/**
 * If we're a Node process, this will calculate and return the percentage CPU
 * usage for this process. If we're not a Node process, calling this function
 * will likely throw an error due to the use of `process`.
 */
export const getNodeCpuUsage = (): number => {
  if (!startCpuUsage || !startCpuTime) {
    startCpuTime = process.hrtime();
    startCpuUsage = process.cpuUsage();
  }

  const newStartTime = process.hrtime();
  const newStartUsage = process.cpuUsage();

  const elapsedTime = process.hrtime(startCpuTime);
  const elapsedUsage = process.cpuUsage(startCpuUsage);

  startCpuTime = newStartTime;
  startCpuUsage = newStartUsage;

  const elapsedTimeMs = hrtimeToMs(elapsedTime);
  const elapsedUserMs = elapsedUsage.user / 1000;
  const elapsedSystemMs = elapsedUsage.system / 1000;
  const cpuPercent = (100 * (elapsedUserMs + elapsedSystemMs)) / elapsedTimeMs;

  return cpuPercent;
};

const hrtimeToMs = (hrtime: ReturnType<typeof process.hrtime>): number => {
  return hrtime[0] * 1e3 + hrtime[1] / 1e6;
};
