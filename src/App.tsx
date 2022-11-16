import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './App.module.less';
import { formateNumber, calcHandler, deleteInput } from './utils/tools';
import keyDown from './assets/audios/keyDown.mp3';
import moment from 'moment';
import { ReactComponent as AllowPlay } from './assets/images/allow-play.svg';
import { ReactComponent as ForbiddenPlay } from './assets/images/forbidden-play.svg';

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

type CalcType = 'calculate' | 'inputting' | 'result';
interface HistoryItem {
  type: 'result';
  createTime: string;
  content: string;
}

function App() {
  const [inputVal, setInputVal] = useState('0');
  const [historyArr, setHistoryArr] = useState<HistoryItem[]>([]);
  const [operator, setOperator] = useState('');
  const [calcType, setCalcType] = useState<CalcType>('inputting');
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  /**
   * 计算结果
   * @param allInput
   * @returns
   */
  const baseToolHandler = (allInput: string): string => {
    if (/\+|-|X|\//.test(allInput)) {
      let formateStr = allInput.replace(/\s/g, '');
      return calcHandler(formateStr).toString();
    } else {
      return formateNumber(Number(allInput));
    }
  };

  const numberTool = (str: string) => {
    if (baseOperator.includes(str)) {
      setCalcType('calculate');
      if (calcType === 'inputting') {
        setInputVal(`${inputVal} ${str} `);
      }
      return;
    }
    if (str === '=') {
      if (calcType === 'inputting') {
        const result = baseToolHandler(inputVal);
        setHistoryArr([
          ...historyArr,
          {
            type: 'result',
            createTime: moment().format('YYYY-MMMM-DD , hh:mm:ss'),
            content: `${inputVal} = ${result}`,
          },
        ]);
        setCalcType('result');
        setInputVal(result);
      }
    } else if (/\d|\./.test(str)) {
      if (calcType === 'result') {
        setInputVal(str);
      } else {
        if (/^0\./.test(inputVal + str)) {
          setInputVal(inputVal + str);
        } else {
          setInputVal((inputVal + str).replace(/^0/g, ''));
        }
      }
      setCalcType('inputting');
    } else if (str === 'AC') {
      setCalcType('inputting');
      setInputVal('0');
    } else if (calcType === 'inputting' && str === '+/-') {
      const lastIndex = inputVal.lastIndexOf(' ');
      let value = inputVal;
      let prefix = '';
      if (lastIndex > -1) {
        value = inputVal.slice(lastIndex + 1);
        value = formateNumber(Number(value) * -1);
        prefix = inputVal.slice(0, lastIndex + 1);
      } else {
        value = formateNumber(Number(value) * -1);
      }
      setInputVal(`${prefix}${value}`);
    } else if (calcType === 'inputting' && str === '%') {
      const lastIndex = inputVal.lastIndexOf(' ');
      let value = inputVal;
      let prefix = '';
      if (lastIndex > -1) {
        value = inputVal.slice(lastIndex + 1);
        value = formateNumber(Number(value) / 100);
        prefix = inputVal.slice(0, lastIndex + 1);
      } else {
        value = formateNumber(Number(value) / 100);
      }
      setInputVal(`${prefix}${value}`);
    } else if (calcType === 'inputting' && str === backKey) {
      setInputVal(deleteInput(inputVal));
    }
  };

  useEffect(() => {
    (document!.querySelector('#root')! as HTMLElement).style.height =
      document.documentElement.clientHeight + 'px' || '0';
  }, []);

  const isFontSmall = useMemo(() => {
    return inputVal.length > 11;
  }, [inputVal]);

  return (
    <div className={styles.app}>
      <audio
        ref={audioRef}
        muted={isMuted}
        src={keyDown}
        style={{ display: 'none' }}
      ></audio>

      {isMuted ? (
        <ForbiddenPlay
          className={styles.audioIcon}
          onClick={() => setIsMuted(!isMuted)}
        />
      ) : (
        <AllowPlay
          className={styles.audioIcon}
          onClick={() => setIsMuted(!isMuted)}
        />
      )}

      <div className={styles.topContent}>
        <ul className={styles.historyContent}>
          {historyArr.map((item) => {
            return (
              <li key={item.createTime} className={styles.historyItem}>
                {item.content}
              </li>
            );
          })}
        </ul>
        <div
          className={`${styles.inputValContent} ${
            isFontSmall ? styles.fontSmall : ''
          }`}
        >
          {inputVal}
        </div>
      </div>
      <div
        className={styles.bottomContent}
        onClick={() => !isMuted && audioRef.current && audioRef.current.play()}
      >
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
