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
const baseFunctionKey = [backKey, '/', '+', '=', '-', 'X'];
const functionKey = ['AC', '+/-', '%'];

type CalcType = 'calculate' | 'inputting';

function App() {
  const [inputVal, setInputVal] = useState('0');
  const [historyArr, setHistoryArr] = useState([]);
  const [operator, setOperator] = useState('');
  const [calcType, setCalcType] = useState<CalcType>('inputting');

  const numberTool = (str: string) => {
    if (['+', '-', 'X', '/'].includes(str)) {
      setCalcType('calculate');
      setOperator(str);
      return;
    }
    if (/\d/.test(str)) {
      setInputVal((inputVal + str).replace(/^0/g, ''));
    } else if (str === 'AC') {
      setCalcType('inputting');
      setInputVal('0');
    } else if (str === '+/-') {
      setInputVal(formateNumber(Number(inputVal) * -1));
    } else if (str === '%') {
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
