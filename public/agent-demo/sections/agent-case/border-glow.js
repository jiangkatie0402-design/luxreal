/* BorderGlow, adapted from the user-supplied React Bits JavaScript + CSS component.
 * React Bits: https://reactbits.dev/components/border-glow
 * MIT + Commons Clause. See REACT-BITS-LICENSE.txt in this directory.
 * Uses the page's existing React instance; no additional runtime dependency.
 */
(() => {
  function parseHSL(value) {
    const match = String(value).match(/([\d.]+)\s+([\d.]+)%?\s+([\d.]+)%?/);
    return match ? { h: +match[1], s: +match[2], l: +match[3] } : { h: 268, s: 80, l: 80 };
  }
  function buildGlowVars(color, intensity) {
    const { h, s, l } = parseHSL(color);
    const vars = {};
    for (const alpha of [100, 60, 50, 40, 30, 20, 10]) {
      vars[`--glow-color${alpha === 100 ? '' : `-${alpha}`}`] = `hsl(${h}deg ${s}% ${l}% / ${Math.min(alpha * intensity, 100)}%)`;
    }
    return vars;
  }
  function buildGradientVars(colors) {
    const positions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
    const names = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    const colorMap = [0, 1, 2, 0, 1, 2, 1];
    const palette = colors.length ? colors : ['#c084fc', '#f472b6', '#38bdf8'];
    const vars = { '--gradient-base': `linear-gradient(${palette[0]} 0 100%)` };
    positions.forEach((position, index) => {
      vars[`--gradient-${names[index]}`] = `radial-gradient(at ${position}, ${palette[Math.min(colorMap[index], palette.length - 1)]} 0px, transparent 50%)`;
    });
    return vars;
  }
  function isLightColor(color) {
    let hex = color.replace('#', '');
    if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(hex)) return false;
    if (hex.length === 3) hex = [...hex].map(char => char + char).join('');
    return parseInt(hex.slice(0, 2), 16) * .2126 + parseInt(hex.slice(2, 4), 16) * .7152 + parseInt(hex.slice(4, 6), 16) * .0722 > 180;
  }
  window.__AHOLO_BORDER_GLOW_FACTORY__ = function (React) {
    return function BorderGlow({
      children, className = '', edgeSensitivity = 30, glowColor = '268 75 80',
      backgroundColor = '#120F17', borderRadius = 26, glowRadius = 30,
      glowIntensity = .8, coneSpread = 25, animated = false, sweepKey = 0,
      colors = ['#bda0ef', '#d9a1cc', '#80aee8'], fillOpacity = .16,
      style = {}, inert = false, ...rest
    }) {
      const cardRef = React.useRef(null);
      React.useEffect(() => { if (cardRef.current) cardRef.current.inert = Boolean(inert); }, [inert]);
      const updatePosition = React.useCallback(event => {
        const card = cardRef.current;
        if (!card || event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const dx = event.clientX - rect.left - rect.width / 2;
        const dy = event.clientY - rect.top - rect.height / 2;
        const edge = Math.min(Math.max(Math.max(Math.abs(dx) / (rect.width / 2), Math.abs(dy) / (rect.height / 2)), 0), 1);
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
        card.dataset.glowActive = 'true';
        card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
        card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
      }, []);
      const leave = React.useCallback(() => {
        if (!cardRef.current) return;
        cardRef.current.style.setProperty('--edge-proximity', '0');
        delete cardRef.current.dataset.glowActive;
      }, []);
      React.useEffect(() => {
        const card = cardRef.current;
        if (!animated || !card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let frame;
        let started;
        const duration = 2600;
        card.classList.add('sweep-active');
        const tick = time => {
          if (started === undefined) started = time;
          const progress = Math.min((time - started) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const edge = progress < .16 ? progress / .16 * 100 : progress > .62 ? (1 - progress) / .38 * 100 : 100;
          card.style.setProperty('--edge-proximity', String(edge));
          card.style.setProperty('--cursor-angle', `${110 + 355 * eased}deg`);
          if (progress < 1) frame = requestAnimationFrame(tick);
          else { card.classList.remove('sweep-active'); card.style.setProperty('--edge-proximity', '0'); }
        };
        frame = requestAnimationFrame(tick);
        return () => { cancelAnimationFrame(frame); card.classList.remove('sweep-active'); card.style.setProperty('--edge-proximity', '0'); };
      }, [animated, sweepKey]);
      return React.createElement('div', {
        ...rest,
        ref: cardRef,
        onPointerMove: updatePosition,
        onPointerLeave: leave,
        className: `border-glow-card${isLightColor(backgroundColor) ? ' border-glow-card--light' : ''} ${className}`,
        style: {
          '--card-bg': backgroundColor, '--edge-sensitivity': edgeSensitivity,
          '--border-radius': `${borderRadius}px`, '--glow-padding': `${glowRadius}px`,
          '--cone-spread': coneSpread, '--fill-opacity': fillOpacity,
          ...buildGlowVars(glowColor, glowIntensity), ...buildGradientVars(colors), ...style
        }
      }, React.createElement('span', { className: 'edge-light', 'aria-hidden': true }),
      React.createElement('div', { className: 'border-glow-inner' }, children));
    };
  };
})();
