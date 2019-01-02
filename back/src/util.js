import { random } from 'lodash';

export const oneOf = (array) => {
  const index = random(0, array.length - 1);
  return array[index];
}