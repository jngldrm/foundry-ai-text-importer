export const notUndefined = <T>(item: T | undefined): item is T => {
  return !!item;
};
