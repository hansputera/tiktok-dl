export const rateLimitConfig = {
  'enable': true, // you can set it to 'false'
  /**
     * How much rate limit count is allowed?
     */
  'maxRatelimit': 60,
  /**
     * Every x second(s), the ratelimit data will removed.
     * So, their ratelimit data will removed.
     * PS: Data stored on redis.
     */
  'ratelimitTime': 60,
};

/**
 * Provider response data will stored on redis.
 * Default: 1 hour
 */
export const providerCache = 3600;
