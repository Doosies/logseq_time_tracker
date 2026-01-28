import { useState } from 'react';
import './global.css';
import * as styles from './App.css';
import { light_theme } from './theme.css';

const App = () => {
    const [count, setCount] = useState(0);

    const handleIncrement = () => {
        setCount((prev_count) => prev_count + 1);
    };

    const handleDecrement = () => {
        setCount((prev_count) => prev_count - 1);
    };

    const handleReset = () => {
        setCount(0);
    };

    return (
        <div className={`${styles.container} ${light_theme}`}>
            <h1 className={styles.title}>Logseq Personal Plugin</h1>
            <div className={styles.counter_section}>
                <p className={styles.count_text}>Count: {count}</p>
                <div className={styles.button_group}>
                    <button onClick={handleDecrement} className={styles.button}>
                        -
                    </button>
                    <button onClick={handleReset} className={styles.button}>
                        Reset
                    </button>
                    <button onClick={handleIncrement} className={styles.button}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
