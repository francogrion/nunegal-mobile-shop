import styles from './CircuitBackground.module.css'

// Printed circuit traces drawn in a 1200×560 box. `end` marks the pad drawn
// at the end of each trace.
const TRACES = [
  { d: 'M0 92 H210 L250 132 H520', end: [520, 132] },
  { d: 'M1200 64 H930 L890 104 H700 L660 144 H590', end: [590, 144] },
  { d: 'M0 262 H140 L180 222 H360 L400 262 H480', end: [480, 262] },
  { d: 'M1200 300 H1010 L970 260 H820', end: [820, 260] },
  { d: 'M760 0 V70 L800 110 V190', end: [800, 190] },
  { d: 'M300 560 V380 L340 340 H560', end: [560, 340] },
  { d: 'M1200 184 H1080 L1040 224 H930', end: [930, 224] },
  { d: 'M40 0 V40 L80 80 H170', end: [170, 80] },
  { d: 'M560 0 V36 L600 76 H700', end: [700, 76] },
]

/**
 * Decorative background: circuit traces with pulses of light travelling
 * along them. Hidden from assistive technologies; the animation stops when
 * the user asks for reduced motion.
 */
function CircuitBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <svg
        className={styles.circuit}
        viewBox="0 0 1200 560"
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="circuit-pulse">
            <stop offset="0" stopColor="#2f54eb" stopOpacity="0" />
            <stop offset="0.5" stopColor="#2f54eb" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        {TRACES.map(({ d }) => (
          <path key={d} className={styles.trace} d={d} />
        ))}
        {TRACES.map(({ d }, index) => (
          <path
            key={`pulse-${d}`}
            className={styles.pulse}
            d={d}
            pathLength="100"
            style={{
              animationDelay: `${-index * 1.3}s`,
              animationDuration: `${6 + (index % 3) * 1.5}s`,
            }}
          />
        ))}
        {TRACES.map(({ d, end: [cx, cy] }) => (
          <circle
            key={`pad-${d}`}
            className={styles.pad}
            cx={cx}
            cy={cy}
            r="3.5"
          />
        ))}
      </svg>
    </div>
  )
}

export default CircuitBackground
