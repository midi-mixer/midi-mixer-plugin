/**
 * Is `true` if we can reasonably assume that this is a Node environment.
 */
export const isNode: boolean =
  Object.prototype.toString.call(
    typeof process !== "undefined" ? process : 0
  ) === "[object process]";
