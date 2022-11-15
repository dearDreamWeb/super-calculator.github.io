import { useState, useEffect } from 'react';
import styles from './App.module.less';
import { formateNumber } from './utils/tools';

const backKey = '🔙';

const keyLayout = [
  'AC',
  '+/-',
  '%',
  backKey,
  '7',
  '8',
  '9',
  '/',
  '4',
  '5',
  '6',
  'X',
  '1',
  '2',
  '3',
  '-',
  '0',
  '.',
  '=',
  '+',
];
const baseOperator = ['/', '+', '-', 'X'];
const baseFunctionKey = [backKey, ...baseOperator, '='];
const functionKey = ['AC', '+/-', '%'];

type CalcType = 'calculate' | 'inputting';

function App() {
  const [inputVal, setInputVal] = useState('0');
  const [historyArr, setHistoryArr] = useState<string[]>([]);
  const [operator, setOperator] = useState('');
  const [calcType, setCalcType] = useState<CalcType>('inputting');

  /**
   * 计算出最终结果
   * 一、将数字和运算符分开
   * 二、将所有的乘除运算计算完
   * 三、将所有的加减运算计算完，得到最终结果
   * @param str
   * @returns
   */
  const calcHandler = (str: string) => {
    let i = 0;
    let len = str.length;
    // 所有数字
    let numbers = [];
    // 所有操作符
    let operatorArr = [];
    let regNumber = /\d/;
    let numberItem = '';
    while (i < len) {
      if (regNumber.test(str[i])) {
        numberItem += str[i];
        if (i === len - 1) {
          numbers.push(Number(numberItem));
        }
      } else {
        numbers.push(Number(numberItem));
        operatorArr.push({ type: str[i], index: operatorArr.length });
        numberItem = '';
      }
      i++;
    }

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
    console.log('result', result);
    return result;
  };

  /**
   * 计算结果
   * @param allInput
   * @returns
   */
  const baseToolHandler = (allInput: string): string => {
    if (/\+|-|\*|\//.test(allInput)) {
      let formateStr = allInput.replace(/\s/g, '');
      return calcHandler(formateStr).toString();
    } else {
      return formateNumber(Number(allInput));
    }
  };

  const numberTool = (str: string) => {
    if (baseOperator.includes(str)) {
      setCalcType('calculate');
      setOperator(str);
      // setHistoryArr([...historyArr, `${inputVal} ${str} `]);
      if (calcType === 'inputting') {
        setInputVal(`${inputVal} ${str} `);
      }
      return;
    }
    if (str === '=') {
      if (calcType === 'inputting') {
        const result = baseToolHandler(inputVal);
        setInputVal(result);
      }
    } else if (/\d/.test(str)) {
      setInputVal((inputVal + str).replace(/^0/g, ''));
      setCalcType('inputting');
    } else if (str === 'AC') {
      setCalcType('inputting');
      setInputVal('0');
    } else if (calcType === 'inputting' && str === '+/-') {
      setInputVal(formateNumber(Number(inputVal) * -1));
    } else if (calcType === 'inputting' && str === '%') {
      setInputVal(formateNumber(Number(inputVal) / 100));
    }
  };

  useEffect(() => {
    (document!.querySelector('#root')! as HTMLElement).style.height =
      document.documentElement.clientHeight + 'px' || '0';
  }, []);

  return (
    <div className={styles.app}>
      <div className={styles.topContent}>
        <ul className={styles.historyContent}>
          {historyArr.map((item, index) => {
            return (
              <li key={index} className={styles.historyItem}>
                {item}
              </li>
            );
          })}
        </ul>
        <div className={styles.inputValContent}>{inputVal}</div>
      </div>
      <div className={styles.bottomContent}>
        {keyLayout.map((item) => {
          return (
            <div key={item} className={styles.keyItem}>
              <div
                className={`${styles.keyItemContent} ${
                  baseFunctionKey.includes(item)
                    ? styles.keyItemBaseFunction
                    : ''
                } ${functionKey.includes(item) ? styles.keyItemFunction : ''}`}
                onClick={() => numberTool(item)}
              >
                <div className={styles.keyText}>{item}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
