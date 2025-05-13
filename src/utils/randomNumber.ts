//@ts-expect-error
import { rando as r } from "@nastyox/rando.js";

export const randomNumber = (maxNumber?: number) => {
  let randomNumberString;
  switch (maxNumber) {
    case 1:
      randomNumberString = r(1, 9).toString();
      break;
    case 2:
      randomNumberString = r(10, 90).toString();
      break;
    case 3:
      randomNumberString = r(100, 900).toString();
      break;
    case 4:
      randomNumberString = r(1000, 9000).toString();
      break;
    case 5:
      randomNumberString = r(10000, 90000).toString();
      break;
    case 6:
      randomNumberString = r(100000, 900000).toString();
      break;
    default:
      randomNumberString = r(1, 9).toString();
      break;
  }
  return randomNumberString;
};
