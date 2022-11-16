export const formateNumber = (number: number) => {
  const str = number.toFixed(16).replace(/0+$/, '');
  return str[str.length - 1] === '.' ? str.slice(0, str.length - 1) : str;
};

/**
 * 计算出最终结果
 * 一、将数字和运算符分开
 * 二、将所有的乘除运算计算完
 * 三、将所有的加减运算计算完，得到最终结果
 * @param str
 * @returns
 */
export const calcHandler = (str: string) => {
  let i = 0;
  let len = str.length;
  // 所有数字
  let numbers = [];
  let lastOperatorIndex = null;
  // 所有操作符
  let operatorArr = [];
  let regNumber = /\d|\./;
  let numberItem = '';
  while (i < len) {
    if (
      regNumber.test(str[i]) ||
      (lastOperatorIndex && i - lastOperatorIndex === 1)
    ) {
      numberItem += str[i];
      if (i === len - 1) {
        numbers.push(Number(numberItem));
      }
    } else {
      numbers.push(Number(numberItem));
      operatorArr.push({ type: str[i], index: operatorArr.length });
      lastOperatorIndex = i;
      numberItem = '';
    }
    i++;
  }
  console.log(numbers, operatorArr);
  // 将乘除运算计算完，依次删除数字数组的位数和运算符数组的位数
  let k = 0;
  let oldLen = operatorArr.length;
  while (k < operatorArr.length) {
    let index = operatorArr[k].index - (oldLen - operatorArr.length);
    if (operatorArr[k].type === 'X') {
      numbers[index] = Number(
        formateNumber(numbers[index] * numbers[index + 1])
      );
      operatorArr.splice(k, 1);
      numbers.splice(index + 1, 1);
    } else if (operatorArr[k].type === '/') {
      numbers[index] = Number(
        formateNumber(numbers[index] / numbers[index + 1])
      );
      operatorArr.splice(k, 1);
      numbers.splice(index + 1, 1);
    } else {
      k++;
    }
  }

  let result = numbers[0];
  for (let l = 1; l < numbers.length; l++) {
    const type = operatorArr[l - 1].type;
    if (type === '+') {
      result = Number(formateNumber(result + numbers[l]));
    } else if (type === '-') {
      result = Number(formateNumber(result - numbers[l]));
    }
  }
  return result;
};

export const deleteInput = (str: string) => {
  if (!str) {
    return '0';
  }
  let len = str.length;
  if (/\d|\./.test(str[len - 1])) {
    str = str.slice(0, len - 1);
  } else if (/\s/.test(str[len - 1])) {
    str = str.slice(0, len - 3);
  }
  return str;
};
