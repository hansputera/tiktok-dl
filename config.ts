export const rateLimitConfig = {
  'enable': true, // you can set it to 'false'
  /**
     * How much rate limit count per x second(s)
     * -is allowed? Default: 60 requests
     */
  'maxRatelimitPerXSeconds': 60,
  /**
     * Every x second(s), the ratelimit data will removed.
     * So, their ratelimit data will removed.
     * PS: Data stored on redis.
     */
  'ratelimitTime': 60,
};

/**
 * Provider response data will stored on redis.
 */
export const providerCache = 600;
