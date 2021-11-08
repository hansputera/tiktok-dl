/**
 * Decorator to handle exception.
 * @param {any} target
 * @param {string} _
 * @param {PropertyDescriptor} descriptor
 * @return {void}
 */
export const handleException = <T extends Function>
  (target: object, _: string, descriptor: TypedPropertyDescriptor<T>):
TypedPropertyDescriptor<T> | void => {
  return {
    configurable: true,
    get(this: T): T {
      try {
        const bound: T = descriptor.value?.bind(this);
        Object.defineProperty(this, _, {
          value: bound,
          configurable: true,
          writable: true,
        });

        return bound;
      } catch (err) {
        return {
          'error': (err as Error).message,
        } as unknown as T;
      }
    },
  };
};
