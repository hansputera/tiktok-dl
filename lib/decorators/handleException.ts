/**
 * Decorator to handle exception.
 * @return {Function}
 */
export const handleException = (): Function => {
  return function(
      target: any,
      _: string,
      descriptor: PropertyDescriptor) {
    const oldValue = descriptor.value;
    descriptor.value = (...args: any) => {
      try {
        return oldValue.apply(target, args);
      } catch (err) {
        return {'error': (err as Error).message};
      }
    };
  };
};
