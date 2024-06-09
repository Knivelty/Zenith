export async function asyncMap<T, U>(
  array: Array<T>,
  asyncCallback: (item: T, index: number, array: T[]) => Promise<U>
) {
  const promises = array.map(asyncCallback);

  return Promise.all(promises);
}
