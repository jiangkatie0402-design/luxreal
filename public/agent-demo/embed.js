// Fit the desktop demo (laid out for ~1000px) into whatever size the homepage window gives it.
(() => {
  const DESIGN = 900;
  const fit = () => {
    const z = Math.min(1, innerWidth / DESIGN);
    const s = document.documentElement.style;
    s.setProperty('--z', z);
    s.setProperty('--lw', innerWidth / z + 'px');
    s.setProperty('--lh', innerHeight / z + 'px');
  };
  fit();
  addEventListener('resize', fit);
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'zh';
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  const AgentSceneCase = window.__AHOLO_AGENT_CASE_FACTORY__(React);
  ReactDOM.createRoot(document.getElementById('agent-root')).render(
    React.createElement(AgentSceneCase, {
      title: lang === 'en' ? 'Let AI agents do your 3D' : '让 AI Agent 帮你做 3D',
      lang,
      ctaHref: '#',
      ctaLabel: '',
    }),
  );
})();
