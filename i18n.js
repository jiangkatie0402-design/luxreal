// ---------- English / 中文 ----------
// The pages are written in Chinese; English lives here, keyed by the Chinese text (whitespace
// collapsed). Switching walks the text nodes and the aria-label / alt / placeholder attributes and
// swaps each one found in the table, keeping the original so switching back restores it exactly.
// Elements whose copy mixes markup (the hero title, headings with <br>) carry data-i18n="<key>"
// and swap their innerHTML from EN_HTML instead. The choice is kept per viewer and can be set
// with ?lang=en / ?lang=zh.
const EN = {
  // document
  'LuxReal｜电影级 AI 影像创作平台': 'LuxReal | Cinematic AI Filmmaking Platform',
  'LuxReal 是新一代 AI 影像创作平台，融合顶级摄影美学与智能生成技术，为高端品牌打造电影质感的视觉内容。': 'LuxReal is a next-generation AI filmmaking platform that pairs cinematic craft with generative AI to create film-quality visuals.',
  '关于我们｜LuxReal': 'About Us | LuxReal',
  '了解 LuxReal 的品牌故事、核心价值观与发展历程。': 'The story, values and milestones behind LuxReal.',
  '隐私政策｜LuxReal': 'Privacy Policy | LuxReal',
  'LuxReal 隐私政策：了解我们如何收集、使用与保护你的信息。': 'LuxReal Privacy Policy: how we collect, use and protect your information.',

  // nav, mobile menu
  '跳到主要内容': 'Skip to main content',
  '首页': 'Home',
  '应用场景': 'Use Cases',
  '用户反馈': 'Capabilities',
  '常见问题': 'FAQ',
  '开始创作': 'Start Creating',
  '关于我们': 'About Us',
  '隐私政策': 'Privacy Policy',
  '登录 / 注册': 'Log in / Sign up',
  '菜单': 'Menu',
  '切换语言': 'Language',

  // hero
  '线上影视工业化，从 LuxReal 开始': 'Studio-grade film production, fully online. It starts with LuxReal.',
  '拔剑迎战': 'Draw Your Sword',
  '驯服神兽': 'Tame the Beast',
  '暂停背景视频': 'Pause background video',
  '播放背景视频': 'Play background video',

  // use cases
  'LuxReal，你的故事，由你导演': 'Your story. You direct it.',
  '两种创作形态': 'Two ways to create',
  'AI 短剧': 'AI Short Dramas',
  '一键生成精品剧集': 'Premium series in one click',
  '奇幻冒险': 'Fantasy Adventure',
  '《天海》': 'Tianhai',
  '海天倒悬的港城里，少女与骑士在惊涛中殊死相搏。': 'In a harbor city where sea and sky hang upside down, a girl and a knight fight to the death in the raging surf.',
  '东方神话': 'Eastern Mythology',
  '《封神》': 'Fengshen',
  '殷商城下战火未熄，神兽睁开双眼，一场人神之战就此拉开。': 'War still smolders below the walls of Shang. A divine beast opens its eyes, and the battle between gods and men begins.',
  '下一个视频': 'Next video',
  '互动影游': 'Interactive Films',
  '多线分支叙事，你来决定结局': 'Branching stories. You choose the ending.',
  '科幻': 'Sci-Fi',
  '《时间裂缝》': 'The Time Rift',
  '留在寻常清晨，还是踏入时间裂缝？每个选择都通向不同的结局。': 'Stay in an ordinary morning, or step into the rift in time? Every choice leads to a different ending.',

  // capabilities
  '核心技能点': 'Core Capabilities',
  '智能创作 Agent': 'Creative Agent',
  '放大创意的专业创作引擎': 'A professional engine that amplifies your ideas',
  '输入创意灵感，快速完成影视级剧本框架设定': 'Turn a spark of an idea into a film-grade script outline, fast',
  '梳理故事结构，完善角色弧线、场景设定与人物对白': 'Shape the story structure, character arcs, settings and dialogue',
  '自动拆解剧情节点，规划多线分支与叙事走向': 'Break the plot into beats and map out branching storylines',
  '一键生成视觉提示词，衔接后续视频创作流程': 'Generate visual prompts in one click, ready for video production',
  '智能镜头': 'Smart Shots',
  '多片段中长叙事创作利器': 'Built for multi-clip, long-form storytelling',
  '跨片段自然衔接，统一规划整组镜头': 'Plan a whole sequence at once, with natural cuts between clips',
  '提前预览关键镜头，高效确认剧情画面': 'Preview key shots early and lock in the look of each scene',
  '统一规划分镜，动作、站位与空间关系自然延续': 'Storyboards that keep action, blocking and space consistent',
  '自动识别镜头需求，智能匹配片段，一键完成整组生成': 'Detects what each shot needs, matches clips and renders the set in one click',
  '3D 片场': '3D Set',
  '视频创作的三维预演空间': 'A 3D previs space for video creation',
  '还原人物、场景与空间关系，快速搭建 3D 拍摄现场': 'Rebuild characters, sets and spatial layout as a 3D stage in minutes',
  '场景与动作素材库自由组合，支持 AI 复刻创意参考': 'Mix scene and motion libraries freely, or recreate a reference with AI',
  '自定义相机与关键帧，复杂运镜可反复调整、精准复现': 'Custom cameras and keyframes: refine complex moves and repeat them exactly',
  '一键输出预演视频，为 AI 视频生成提供清晰参考': 'Export a previs video in one click as a clear guide for AI generation',
  '上一个': 'Previous',
  '下一个': 'Next',

  // creators
  '创作者说': 'From Our Creators',
  '他们用 LuxReal 完成了自己的作品，也想把真实的创作体验分享给你。': 'They made their work with LuxReal, and want to tell you what it was really like.',
  '林晚': 'Lin Wan',
  '苏绮': 'Su Qi',
  '韩烈': 'Han Lie',
  '老周': 'Mr. Zhou',
  '以前拍一集奇幻戏要搭景、做特效，现在一个人一周就能出完整一季，角色在每一集里都保持一致。': 'A fantasy episode used to mean building sets and doing VFX. Now I can finish a whole season on my own in a week, and the characters stay consistent in every episode.',
  '独立短剧导演 · 杭州 · 代表作 《天海》奇幻短剧': 'Independent director · Hangzhou · Known for the fantasy series Tianhai',
  '过去一场夜市戏要几十万预算。用 LuxReal 做出来的长安街景，连合作方都以为是实拍。': 'One night-market scene used to cost a fortune. The Chang’an streets we made with LuxReal had our partners convinced they were shot on location.',
  '国风短剧制片人 · 代表作 《长安夜行》': 'Period drama producer · Known for Night Walk in Chang’an',
  '智能镜头能一次规划整组分镜，动作和站位都接得上，节奏比我预想的还要利落。': 'Smart Shots plans a whole storyboard at once. Action and blocking cut together, and the pacing is tighter than I expected.',
  '动作短剧导演 · 代表作 《独眼刀客》': 'Action director · Known for The One-Eyed Blade',
  '七十岁学会用 AI 拍片，把年轻时没拍成的故事一个个做出来，是这两年最开心的事。': 'Learning to make films with AI at seventy, and finally telling the stories I never got to shoot when I was young, has been the joy of these past two years.',
  '退休导演 · AI 创作爱好者 · 代表作 《悦来客栈》系列短片': 'Retired director · AI filmmaking enthusiast · Known for the Yuelai Inn shorts',
  '示例内容：头像取自 LuxReal 生成的角色，人物与评价为演示用，上线前替换为真实创作者。': 'Sample content: portraits are LuxReal-generated characters, and the names and quotes are placeholders to be replaced with real creators before launch.',
  '创作者': 'Creators',
  '暂停轮播': 'Pause rotation',
  '继续轮播': 'Resume rotation',

  // FAQ
  '关于 LuxReal，你可能想知道的。': 'What you might want to know about LuxReal.',
  'LuxReal 是什么？': 'What is LuxReal?',
  'LuxReal 是一个 AI 影视创作平台。从剧本、角色、分镜到成片，你可以在一个地方完成 AI 短剧和互动影游的整个制作流程，不需要摄影棚和拍摄团队。': 'LuxReal is an AI filmmaking platform. From script, characters and storyboards to the final cut, you can produce AI short dramas and interactive films end to end in one place, with no studio or film crew.',
  '不会拍摄和剪辑，也能用吗？': 'Can I use it without filming or editing experience?',
  '可以。你只需要用文字描述故事，智能创作 Agent 会帮你拆解剧情、规划镜头并生成画面。每一步都可以手动调整，熟悉之后也能做更精细的控制。': 'Yes. Describe your story in words and the Creative Agent breaks down the plot, plans the shots and generates the visuals. You can adjust every step by hand and take finer control as you get comfortable.',
  'AI 短剧和互动影游有什么区别？': 'What’s the difference between AI short dramas and interactive films?',
  'AI 短剧是线性的剧集，适合在短视频平台连载；互动影游是多线分支叙事，观众在关键节点做出选择，故事会走向不同的结局。两种形态共用同一套角色和场景资产。': 'AI short dramas are linear series, made for serializing on short-video platforms. Interactive films branch: viewers make choices at key moments and the story heads toward different endings. Both share the same character and scene assets.',
  '角色在不同镜头和剧集里能保持一致吗？': 'Do characters stay consistent across shots and episodes?',
  '可以。角色、服装和场景会存进资产库，之后的每个镜头都会引用同一套设定，长剧情里人物的长相和造型也能保持统一。': 'Yes. Characters, costumes and sets are saved to your asset library, and every later shot references the same setup, so faces and looks hold steady across long stories.',
  '做一部短剧大概需要多长时间？': 'How long does it take to make a short drama?',
  '取决于集数和精细程度。一集 1～2 分钟的短剧，从剧本到成片通常几个小时就能完成，比传统拍摄快得多。': 'It depends on the number of episodes and the level of detail. A 1–2 minute episode usually goes from script to final cut in a few hours, far faster than a traditional shoot.',
  '生成的作品版权归谁？可以商用吗？': 'Who owns what I create? Can I use it commercially?',
  '你创作的内容归你所有，商用范围以你的订阅方案和平台用户协议为准。上线前请以官方条款为准。': 'What you create is yours. Commercial use depends on your subscription plan and the platform’s Terms of Use; the official terms always take precedence.',
  '如何收费？可以免费试用吗？': 'How much does it cost? Is there a free trial?',
  '注册即可免费体验核心功能。需要更高清晰度、更长时长或团队协作时，可以升级到付费方案。': 'Sign up to try the core features for free. Upgrade to a paid plan when you need higher resolution, longer videos or team collaboration.',

  // closing CTA
  '准备好开始你的创作了吗？': 'Ready to start creating?',
  '一个人，也能拍出一部电影。': 'One person is all it takes to make a film.',
  '免费开始创作': 'Start Creating for Free',
  '了解 LuxReal': 'About LuxReal',

  // footer
  'LuxReal 是新一代 AI 影像创作平台，为高端品牌打造电影质感的视觉内容。': 'LuxReal is a next-generation AI filmmaking platform that creates film-quality visuals for premium brands.',
  '产品': 'Product',
  'AI 视频生成器': 'AI Video Generator',
  '短剧 Agent': 'Short Drama Agent',
  '产品广告视频': 'Product Ad Videos',
  '电商广告': 'E-commerce Ads',
  'FMV 游戏制作': 'FMV Game Production',
  '资源': 'Resources',
  '新手指南': 'Getting Started',
  '法律条款': 'Legal',
  '使用条款': 'Terms of Use',
  '© 2026 LuxReal 版权所有': '© 2026 LuxReal. All rights reserved.',
  '为懂差异化的品牌而生': 'Made for brands that stand apart.',

  // sign-in dialog
  '关闭': 'Close',
  '登录': 'Log in',
  '注册': 'Sign up',
  '欢迎回来': 'Welcome back',
  '登录以继续你的创作': 'Log in to keep creating',
  '创建账户': 'Create account',
  '注册 LuxReal，开启电影级影像创作': 'Join LuxReal and start making cinematic films',
  '品牌 / 姓名': 'Brand / name',
  '你的品牌或姓名': 'Your brand or name',
  '邮箱地址': 'Email address',
  '密码': 'Password',
  '演示环境 · 表单交互已就绪，实际账户系统即将上线': 'Demo only: the form works, and real accounts are coming soon.',
  '继续即表示你同意 LuxReal 的': 'By continuing, you agree to LuxReal’s',

  // about
  '品牌故事': 'Our Story',
  'LuxReal 成立的初衷很简单——让每一个拥有出色产品的品牌，都不必再为影像制作的门槛而妥协。我们把电影摄制团队的审美标准，交给了 AI。': 'LuxReal started with a simple idea: no brand with a great product should have to compromise because film production is out of reach. So we handed a film crew’s eye to AI.',
  '"技术应该是隐形的。真正被记住的，永远是画面背后那份未经修饰的情感与质感。"': '“Technology should be invisible. What people remember is the raw emotion and texture behind the image.”',
  '—— LuxReal 创作团队': '— The LuxReal creative team',
  '我们的价值观': 'Our Values',
  '驱动我们前行的四件事': 'Four things that drive us',
  '极致美学': 'Uncompromising craft',
  '对光影、色彩与节奏的每一处细节，抱以近乎苛刻的追求。': 'We obsess over every detail of light, color and rhythm.',
  '技术信任': 'Trusted technology',
  '以企业级的安全标准，守护每一份品牌资产与创作内容。': 'Enterprise-grade security protects every brand asset and every piece of work.',
  '真实表达': 'Authentic expression',
  '拒绝千篇一律的模板感，让每个品牌保有独一无二的声音。': 'No cookie-cutter templates: every brand keeps a voice of its own.',
  '持续创新': 'Constant invention',
  '保持对新技术、新表达方式的敏感，不断突破生成的边界。': 'We stay alert to new technology and new forms, and keep pushing what generation can do.',
  '发展历程': 'Milestones',
  '从一个想法，到品牌的创作伙伴': 'From one idea to a creative partner for brands',
  'LuxReal 成立': 'LuxReal is founded',
  '由一群来自影像与人工智能领域的创作者共同发起，希望重新定义品牌视觉内容的生产方式。': 'Started by filmmakers and AI researchers who wanted to rethink how brand visuals get made.',
  '服务突破千家品牌': 'Over 1,000 brands served',
  '核心生成引擎完成三次迭代，画面质感与品牌调性还原度获得客户广泛认可。': 'Three generations of the core engine, with image quality and brand fidelity that customers rely on.',
  '全球化扩展': 'Going global',
  '上线多语言支持与本地化模板库，服务范围拓展至亚洲、欧洲与北美市场。': 'Multilingual support and localized templates bring LuxReal to Asia, Europe and North America.',
  '新一代影像引擎发布': 'Next-generation engine',
  '推出面向高端场景的电影级渲染引擎，进一步缩短创作到发布的时间。': 'A cinematic rendering engine for premium work that shortens the path from idea to release.',
  '创作团队': 'The Team',
  '来自影像、设计与技术的跨界组合': 'Film, design and engineering under one roof',
  '创意总监': 'Creative Director',
  '技术负责人': 'Head of Engineering',
  '视觉美学顾问': 'Visual Aesthetics Advisor',
  '品牌策略负责人': 'Head of Brand Strategy',
  '无论是加入团队，还是成为我们的下一位客户，我们都期待与你对话。': 'Whether you want to join the team or become our next customer, we’d love to talk.',
  '联系我们': 'Contact Us',

  // privacy
  '法律政策': 'Legal',
  '我们重视你的信任。本政策说明 LuxReal 如何收集、使用、存储与保护你的信息。': 'Your trust matters to us. This policy explains how LuxReal collects, uses, stores and protects your information.',
  '信息的收集': 'Information we collect',
  '信息的使用': 'How we use information',
  'Cookie 与追踪技术': 'Cookies and tracking',
  '信息共享与披露': 'Sharing and disclosure',
  '数据安全': 'Data security',
  '你的权利与选择': 'Your rights and choices',
  '未成年人隐私': 'Children’s privacy',
  '政策变更': 'Changes to this policy',
  '最近更新时间：2026 年 3 月 1 日': 'Last updated: March 1, 2026',
  '当你访问 LuxReal 网站、注册账户或使用我们的创作平台时，我们可能会收集以下类型的信息：': 'When you visit the LuxReal website, create an account or use our platform, we may collect the following:',
  '账户信息：姓名、邮箱地址、品牌名称及登录凭证。': 'Account information: your name, email address, brand name and login credentials.',
  '创作内容：你上传的品牌素材、链接及生成过程中产生的方案与作品。': 'Creative content: brand assets and links you upload, and the plans and works produced while generating.',
  '使用数据：访问时间、设备类型、浏览器信息及操作行为等技术数据。': 'Usage data: technical data such as visit times, device type, browser details and in-app actions.',
  '沟通记录：你通过客服、表单或邮件与我们联系时提供的信息。': 'Communications: what you tell us when you contact support, fill in a form or email us.',
  '我们收集的信息将用于以下目的：': 'We use this information to:',
  '提供、维护并优化 LuxReal 的核心创作功能与用户体验。': 'Provide, maintain and improve LuxReal’s creative tools and experience.',
  '处理账户注册、身份验证与客户支持请求。': 'Handle sign-ups, verification and support requests.',
  '分析产品使用情况，以改进算法效果与界面设计。': 'Understand how the product is used, to improve our models and interface.',
  '在获得你同意的前提下，向你发送产品更新与营销信息。': 'Send product updates and marketing, with your consent.',
  '我们使用 Cookie 及类似技术来记住你的偏好设置、维持登录状态，并了解网站的整体使用情况。你可以通过浏览器设置管理或禁用 Cookie，但这可能会影响部分功能的正常使用。': 'We use cookies and similar technologies to remember your preferences, keep you signed in and understand how the site is used overall. You can manage or disable cookies in your browser settings, though some features may not work as expected.',
  '除以下情形外，我们不会将你的个人信息出售或出租给第三方：': 'We never sell or rent your personal information to third parties, except:',
  '经你明确同意后，与第三方服务商共享以完成特定服务。': 'With your explicit consent, to service providers who help deliver a specific service.',
  '为遵守法律法规、司法程序或政府部门的合法要求。': 'To comply with laws, legal process or lawful requests from authorities.',
  '在企业合并、收购或资产转让等情形下，作为交易的一部分。': 'As part of a merger, acquisition or asset transfer.',
  '我们采用符合行业标准的加密技术、访问控制与安全审计机制，全面保护你的信息安全。所有创作内容与账户数据均在传输与存储过程中进行加密处理。尽管如此，任何互联网传输方式都无法保证绝对安全，我们将持续投入以降低相关风险。': 'We protect your information with industry-standard encryption, access controls and security audits. All creative content and account data is encrypted in transit and at rest. Even so, no transmission over the internet is completely secure, and we keep investing to reduce the risk.',
  '根据适用的法律法规，你有权：': 'Subject to applicable law, you have the right to:',
  '访问、更正或删除我们持有的与你相关的个人信息。': 'Access, correct or delete the personal information we hold about you.',
  '随时撤回此前给予的同意，或要求限制信息处理范围。': 'Withdraw consent at any time, or ask us to limit how we process your information.',
  '要求导出你的账户数据副本。': 'Request a copy of your account data.',
  '取消订阅营销类通讯，同时不影响服务类通知的接收。': 'Unsubscribe from marketing while still receiving service notices.',
  '如需行使上述权利，请通过下方联系方式与我们取得联系。': 'To exercise any of these rights, contact us using the details below.',
  'LuxReal 的服务面向企业与专业创作者，不面向 18 周岁以下的未成年人。我们不会在明知的情况下收集未成年人的个人信息；如发现此类情况，将采取合理措施尽快删除相关数据。': 'LuxReal is built for businesses and professional creators and is not intended for anyone under 18. We do not knowingly collect personal information from minors; if we learn that we have, we will take reasonable steps to delete it promptly.',
  '我们可能会不定期更新本隐私政策，以反映产品功能、法律要求或业务实践的变化。重大变更将通过网站公告或邮件方式通知你，并更新页面顶部的生效日期。': 'We may update this policy from time to time to reflect changes in our product, legal requirements or practices. We will announce significant changes on the site or by email and update the date at the top of this page.',
  '如果你对本隐私政策有任何疑问或建议，欢迎通过以下方式联系我们：': 'If you have any questions or suggestions about this policy, get in touch:',
};
const EN_HTML = {
  'hero-title': 'Pro-Grade AI Film Agent',
  'about-title': 'We believe that <em class="serif grad-text">authenticity</em><br>is the highest form of beauty',
  'about-cta': 'Let’s redefine<br>brand filmmaking together',
};

const I18N_ATTRS = ['aria-label', 'alt', 'placeholder'];
const norm = s => s.replace(/\s+/g, ' ').trim();
let currentLang = 'zh';

function translateText(node, en) {
  if (en) {
    const key = norm(node.nodeValue);
    if (!key || !(key in EN)) return;
    const value = node.nodeValue;
    node.__zh = value;
    node.nodeValue = value.replace(key, EN[key]);
    node.__en = node.nodeValue;
  } else if (node.__zh != null && node.nodeValue === node.__en) {
    node.nodeValue = node.__zh;
  }
}
function translateAttrs(el, en) {
  el.__zhAttrs = el.__zhAttrs || {};
  I18N_ATTRS.forEach(name => {
    if (!el.hasAttribute(name)) return;
    if (en) {
      const key = norm(el.getAttribute(name));
      if (!(key in EN)) return;
      el.__zhAttrs[name] = el.getAttribute(name);
      el.setAttribute(name, EN[key]);
    } else if (name in el.__zhAttrs) {
      el.setAttribute(name, el.__zhAttrs[name]);
    }
  });
}
// translate (or restore) everything under root to the current language
function applyLang(root) {
  const en = currentLang === 'en';
  root.querySelectorAll('[data-i18n]').forEach(el => {
    if (en) {
      if (el.__zhHtml == null) el.__zhHtml = el.innerHTML;
      el.innerHTML = EN_HTML[el.dataset.i18n];
    } else if (el.__zhHtml != null) {
      el.innerHTML = el.__zhHtml;
    }
  });
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.parentElement && n.parentElement.closest('script, style, [data-i18n]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) translateText(n, en);
  root.querySelectorAll(I18N_ATTRS.map(a => `[${a}]`).join(',')).forEach(el => translateAttrs(el, en));
}
function setLang(lang) {
  currentLang = lang === 'en' ? 'en' : 'zh';
  const en = currentLang === 'en';
  document.documentElement.lang = en ? 'en' : 'zh-CN';
  applyLang(document.body);
  const title = document.querySelector('title');
  if (title) translateText(title.firstChild, en);
  const desc = document.querySelector('meta[name="description"]');
  if (desc) {
    if (desc.__zh == null) desc.__zh = desc.content;
    desc.content = en ? (EN[norm(desc.__zh)] || desc.__zh) : desc.__zh;
  }
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    const on = b.dataset.lang === currentLang;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  try { localStorage.setItem('luxreal-lang', currentLang); } catch (e) {}
  document.dispatchEvent(new CustomEvent('lang:change', { detail: currentLang }));
}
// script.js calls this after rewriting copy (the sign-in dialog swaps its title per mode)
window.luxI18n = { apply: root => { if (currentLang === 'en') applyLang(root); }, get lang() { return currentLang; } };

(function initLang() {
  let lang = new URLSearchParams(location.search).get('lang');
  if (!lang) { try { lang = localStorage.getItem('luxreal-lang'); } catch (e) {} }
  if (lang === 'en') setLang('en');
  else document.querySelectorAll('.lang-toggle button').forEach(b => b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'));
  document.querySelectorAll('.lang-toggle button').forEach(btn => {
    btn.addEventListener('click', () => { if (btn.dataset.lang !== currentLang) setLang(btn.dataset.lang); });
  });
})();
