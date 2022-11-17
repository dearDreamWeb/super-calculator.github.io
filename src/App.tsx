import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './App.module.less';
import { formateNumber, calcHandler, deleteInput } from './utils/tools';
import keyDown from './assets/audios/keyDown.mp3';
import moment from 'moment';
import { ReactComponent as AllowPlay } from './assets/images/allow-play.svg';
import { ReactComponent as ForbiddenPlay } from './assets/images/forbidden-play.svg';
import { ReactComponent as HistoryIcon } from './assets/images/history-icon.svg';
import { ReactComponent as CloseIcon } from './assets/images/close.svg';
import { evaluate } from 'decimal-eval';

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
  const [calcType, setCalcType] = useState<CalcType>('inputting');
  const [isMuted, setIsMuted] = useState(true);
  const [showHistoryPage, setShowHistoryPage] = useState(false);

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
      return formateNumber(allInput);
    }
  };

  const numberTool = (str: string) => {
    if (baseOperator.includes(str)) {
      setCalcType('calculate');
      if (calcType !== 'calculate') {
        setInputVal(`${inputVal} ${str} `);
      }
      return;
    }
    if (str === '=') {
      if (calcType === 'inputting') {
        const result = baseToolHandler(inputVal);
        let newHistory: HistoryItem[] = [
          ...historyArr,
          {
            type: 'result',
            createTime: moment().format('YYYY-MM-DD , hh:mm:ss'),
            content: `${inputVal} = ${result}`,
          },
        ];
        setHistoryArr(newHistory);
        localStorage.setItem('historyData', JSON.stringify(newHistory));
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
    } else if (calcType !== 'result' && str === '+/-') {
      const lastIndex = inputVal.lastIndexOf(' ');
      let value = inputVal;
      let prefix = '';
      if (lastIndex > -1) {
        value = inputVal.slice(lastIndex + 1);
        value = formateNumber(`${value} * ${-1}`);
        prefix = inputVal.slice(0, lastIndex + 1);
      } else {
        value = formateNumber(`${value} * ${-1}`);
      }
      setInputVal(`${prefix}${value}`);
    } else if (calcType !== 'result' && str === '%') {
      const lastIndex = inputVal.lastIndexOf(' ');
      let value = inputVal;
      let prefix = '';
      if (lastIndex > -1) {
        value = inputVal.slice(lastIndex + 1);
        value = formateNumber(evaluate(`${value} / 100`));
        prefix = inputVal.slice(0, lastIndex + 1);
      } else {
        value = formateNumber(`${value} / 100`);
      }
      setInputVal(`${prefix}${value}`);
    } else if (calcType !== 'result' && str === backKey) {
      setInputVal(deleteInput(inputVal));
    }
  };

  useEffect(() => {
    (document!.querySelector('#root')! as HTMLElement).style.height =
      document.documentElement.clientHeight + 'px' || '0';

    let storage = localStorage.getItem('historyData');
    let storageData = typeof storage === 'string' ? JSON.parse(storage) : [];
    setHistoryArr(storageData);
  }, []);

  const isFontSmall = useMemo(() => {
    return inputVal.length > 11;
  }, [inputVal]);

  return (
    <div className={styles.app}>
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

      <HistoryIcon
        className={styles.historyIcon}
        onClick={() => setShowHistoryPage(true)}
      />

      {showHistoryPage && (
        <div className={styles.historyModal}>
          <CloseIcon
            className={styles.closeIcon}
            onClick={() => setShowHistoryPage(false)}
          />
          <div className={styles.historyMain}>
            {historyArr.map((item) => {
              return (
                <div key={item.createTime} className={styles.historyItemBox}>
                  <div className={styles.historyCreateTime}>
                    {item.createTime}
                  </div>
                  <div className={styles.historyContent}>{item.content}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.topContent}>
        <div className={styles.historyWrapper}>
          <ul className={styles.historyContent}>
            {historyArr.map((item) => {
              return (
                <li key={item.createTime} className={styles.historyItem}>
                  {item.content}
                </li>
              );
            })}
          </ul>
        </div>
        <div
          className={`${styles.inputValContent} ${
            isFontSmall ? styles.fontSmall : ''
          }`}
        >
          {inputVal}
        </div>
      </div>
      <div className={styles.bottomContent}>
        {keyLayout.map((item, index) => {
          return (
            <div
              key={item}
              className={styles.keyItem}
              onClick={() => {
                if (!isMuted) {
                  (document.querySelector(
                    `#audio-${index}`
                  )! as HTMLAudioElement)!.play();
                }
              }}
            >
              <audio
                id={`audio-${index}`}
                muted={isMuted}
                src={keyDown}
                style={{ display: 'none' }}
              ></audio>
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
