/* A scripted product demonstration, not a live MCP client or a record of real tool calls. */
(() => {
  const base = new URL('.', document.currentScript.src).href;
  window.__AHOLO_AGENT_CASE_FACTORY__ = function (React) {
    const h = React.createElement;
    const BorderGlow = window.__AHOLO_BORDER_GLOW_FACTORY__(React);
    const logo = new URL('../../aholo-mark.svg', base).href;
    const icons = {
      replay: 'M3 10a9 9 0 1 1 2.3 8M3 4v6h6',
      check: 'm5 12 4 4L19 6',
      arrow: 'M5 12h14m-5-5 5 5-5 5',
      cube: 'm12 3 9 5v8l-9 5-9-5V8l9-5Zm0 9 9-4m-9 4L3 8m9 4v9'
    };
    function icon(name, props = {}) {
      return h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, ...props }, h('path', { d: icons[name] }));
    }
    const copy = {
      zh: {
        intro: '给出参考与需求，让 Agent 把独立资产组合成完整场景。', replay: '重播演示', context: '与 Agent 对话', example: '示例演示',
        file: '运动公园参考.png', user: '把这张图做成一个 3D 运动公园。球场、泳池和周边设施分别生成，再按原图组合到一起。',
        plan: '我会拆分场景资产，通过 Aholo 3D 生成模型，再统一比例、还原摆放关系。',
        mcp: 'Aholo 3D MCP', running: '执行中', complete: '已完成',
        tasks: ['拆分球场、泳池与周边设施', '生成并整理各类场景资产', '统一比例与位置，组合完整场景'],
        thinking: ['正在分析参考图…', '正在规划场景资产…', '正在准备场景资产…', '正在组合场景…', '场景已准备就绪'],
        finish: '场景已组合完成，可以在右侧旋转查看整体布局。',
        note: '从一个想法，走向完整的 3D 场景。', result: '生成结果', assembled: '场景已组合', name: '运动公园',
        desc: '球场、泳池与配套设施，组合为同一个场景。', tag: '3D 场景', frameTitle: '运动公园交互式 3D 预览', posterAlt: '运动公园场景参考图'
      },
      en: {
        intro: 'Give your agent a reference. Let it turn individual assets into a complete scene.', replay: 'Replay demo', context: 'Chat with your agent', example: 'Illustrative demo',
        file: 'sports-park-reference.png', user: 'Turn this image into a 3D sports park. Generate the courts, pool and surrounding facilities, then assemble them to match the reference.',
        plan: 'I’ll identify the individual elements, generate the scene assets with Aholo 3D, then match their scale and arrangement.',
        mcp: 'Aholo 3D MCP', running: 'Working', complete: 'Complete',
        tasks: ['Identify courts, pool and facilities', 'Generate and organise scene assets', 'Match scale and positions, then assemble'],
        thinking: ['Analysing the reference…', 'Planning the scene assets…', 'Preparing scene assets…', 'Assembling the scene…', 'The scene is ready'],
        finish: 'The scene is assembled. The courts, pool and facilities follow the reference layout. Explore the result on the right.',
        note: 'From one idea to a complete 3D scene.', result: 'Result', assembled: 'Scene assembled', name: 'Sports park',
        desc: 'Courts, pool and facilities, brought together in one scene.', tag: '3D scene', frameTitle: 'Interactive 3D sports park preview', posterAlt: 'Sports park scene reference'
      }
    };
    return function AgentSceneCase({ title, lang, ctaHref, ctaLabel }) {
      const text = copy[lang === 'en' ? 'en' : 'zh'];
      const root = React.useRef(null);
      const frame = React.useRef(null);
      const started = React.useRef(false);
      const [step, setStep] = React.useState(0);
      const [run, setRun] = React.useState(0);
      const [mounted, setMounted] = React.useState(false);
      const [visible, setVisible] = React.useState(false);
      const [reduced, setReduced] = React.useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
      const complete = step >= 7;

      React.useEffect(() => {
        const query = matchMedia('(prefers-reduced-motion: reduce)');
        const change = () => setReduced(query.matches);
        query.addEventListener('change', change);
        return () => query.removeEventListener('change', change);
      }, []);
      React.useEffect(() => {
        const observer = new IntersectionObserver(entries => {
          const inView = entries[0].isIntersecting;
          setVisible(inView);
          if (inView && !started.current) {
            started.current = true;
            setMounted(true);
          }
        }, { threshold: .18 });
        if (root.current) observer.observe(root.current);
        return () => observer.disconnect();
      }, []);
      React.useEffect(() => {
        if (!mounted) return;
        setStep(reduced ? 7 : 0);
        if (reduced) return;
        const sequence = [[600, 1], [1400, 2], [2400, 3], [3650, 4], [4900, 5], [5850, 6], [6800, 7]];
        const playbackRate = 1.2;
        const timers = sequence.map(([delay, next]) => setTimeout(() => setStep(next), delay / playbackRate));
        return () => timers.forEach(clearTimeout);
      }, [mounted, run, reduced]);
      React.useEffect(() => {
        frame.current?.contentWindow?.postMessage({ type: 'aholo-scene-visibility', active: visible && complete }, location.origin);
      }, [visible, complete]);
      React.useEffect(() => {
        const onMessage = event => {
          if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
          if (event.data?.type === 'aholo-scene-ready') {
            frame.current?.contentWindow?.postMessage({ type: 'aholo-scene-visibility', active: visible && complete }, location.origin);
          }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
      }, [visible, complete]);

      const replay = () => {
        setMounted(true);
        setStep(reduced ? 7 : 0);
        setRun(value => value + 1);
        frame.current?.contentWindow?.postMessage({ type: 'aholo-scene-reset' }, location.origin);
      };
      const taskStates = [step >= 3, step >= 4, step >= 5];
      const activeTask = step < 3 ? 0 : step < 4 ? 1 : 2;
      const thinkingIndex = Math.min(4, Math.max(0, step - 1));

      return h('div', { className: 'ac-demo', ref: root, 'data-demo-step': step, 'data-demo-state': complete ? 'complete' : mounted ? 'playing' : 'waiting' },
        h('div', { className: 'ac-heading' },
          h('div', null, h('h3', null, title), h('p', null, text.intro)),
          h('button', { className: 'ac-replay', type: 'button', onClick: replay }, icon('replay'), text.replay)
        ),
        h('div', { className: `ac-stage${complete ? ' is-complete' : ''}` },
          h(BorderGlow, { className: 'ac-context', backgroundColor: '#100e14', animated: mounted && !reduced, sweepKey: run },
            h('div', { className: 'ac-window-bar' },
              h('span', { className: 'ac-window-dots', 'aria-hidden': true }, h('i'), h('i'), h('i')),
              h('div', { className: 'ac-window-title' }, h('img', { src: logo, alt: '', width: 20, height: 20 }), h('span', null, 'Aholo 3D'), h('span', { className: 'ac-window-slash' }, '/'), h('span', { className: 'ac-window-subtitle' }, lang === 'en' ? 'Agent' : 'Agent 接入')),
              h('span', { className: 'ac-example' }, text.example)
            ),
            h('div', { className: 'ac-context-inner' },
              h('div', { className: 'ac-context-top' },
                h('span', null, h('span', { className: 'ac-status-dot' }), text.context)
              ),
              h('div', { className: 'ac-user' },
                h('div', { className: 'ac-reference' }, h('img', { src: `${base}assets/stadium-reference.webp`, alt: text.posterAlt, width: 465, height: 438 })),
                h('div', { className: 'ac-user-copy' }, h('div', { className: 'ac-filename' }, text.file), h('p', null, text.user))
              ),
              h('div', { className: `ac-agent${step >= 1 ? ' is-visible' : ''}`, 'aria-hidden': step < 1 },
                h('div', { className: 'ac-agent-label' }, 'Agent'), h('p', null, text.plan)
              ),
              h('div', { className: `ac-tool${step >= 2 ? ' is-visible' : ''}`, 'aria-hidden': step < 2 },
                h('div', { className: 'ac-tool-heading' },
                  h('img', { className: 'ac-tool-mark', src: logo, alt: '', width: 24, height: 24, 'aria-hidden': true }),
                  h('span', null, text.mcp),
                  h('span', { className: 'ac-tool-state' }, step >= 5 ? icon('check') : null, step >= 5 ? text.complete : text.running)
                ),
                h('ul', { className: 'ac-task-list' }, text.tasks.map((task, index) => h('li', { key: task, className: `ac-task${taskStates[index] ? ' is-done' : activeTask === index ? ' is-active' : ''}` },
                  h('span', { className: 'ac-task-icon' }, icon('check')), h('span', null, task)
                ))),
                h('div', { className: 'ac-thinking', 'aria-live': 'off' },
                  step < 5 ? h('span', { className: 'ac-thinking-dots', 'aria-hidden': true }, h('i'), h('i'), h('i')) : null,
                  h('span', null, text.thinking[thinkingIndex])
                )
              ),
              h('p', { className: `ac-finish${step >= 6 ? ' is-visible' : ''}`, 'aria-hidden': step < 6 }, text.finish),
              h('div', { className: 'ac-bottom' },
                h('span', { className: 'ac-bottom-note' }, text.note),
                h('a', { className: 'ac-cta', href: ctaHref }, ctaLabel, icon('arrow'))
              )
            )
          ),
          h(BorderGlow, { className: 'ac-result', backgroundColor: '#121116', animated: complete && !reduced, sweepKey: run, 'aria-hidden': !complete, inert: !complete },
            h('div', { className: 'ac-result-top' },
              h('span', { className: 'ac-result-label' }, h('span', { className: 'ac-status-dot' }), text.result),
              h('span', { className: 'ac-result-badge' }, icon('check'), text.assembled)
            ),
            h('div', { className: 'ac-model' }, mounted ? h('iframe', {
              ref: frame, src: `${base}scene-viewer.html?lang=${lang === 'en' ? 'en' : 'zh'}`, title: text.frameTitle,
              allow: 'fullscreen', allowFullScreen: true,
              onLoad: () => frame.current?.contentWindow?.postMessage({ type: 'aholo-scene-visibility', active: visible && complete }, location.origin)
            }) : h('div', { className: 'ac-model-placeholder' }, h('img', { src: `${base}assets/stadium-poster.webp`, alt: text.posterAlt }))),
            h('div', { className: 'ac-result-footer' },
              h('div', null, h('div', { className: 'ac-scene-name' }, text.name), h('div', { className: 'ac-scene-desc' }, text.desc)),
              h('span', { className: 'ac-scene-tag' }, text.tag)
            )
          )
        )
      );
    };
  };
})();
