// Gera o site estático: node tools/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://evertonbottega.com.br';
const WPP = '5551992828012';
const wa = (msg) => `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`;
const WA_DEFAULT = wa('Olá, vim pelo site do Éverton Bottega e gostaria de agendar minha avaliação.');
const LINKS = {
  kiwifyHome: 'https://pay.kiwify.com.br/pF5kNxq',
  kiwifyVsl: 'https://pay.kiwify.com.br/8BjC0ra',
  hotmartNutri: 'https://hotmart.com/pt-br/marketplace/produtos/nutri-sem-limites/F67845766O',
  hotmartSeja: 'https://hotmart.com/pt-br/marketplace/produtos/seja-sua-propria-transformacao/W72327667R',
  hotmartNow: 'https://hotmart.com/pt-br/marketplace/produtos/n-o-w-natureza-da-sabedoria/O67919205Y',
  amazon: 'https://www.amazon.com.br/W-Natureza-Sabedoria-Everton-Bottega/dp/8594551274/ref=sr_1_1?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&keywords=NOW+-+natureza+da+sabedoria&qid=1636569351&sr=8-1',
  clinica: 'https://www.espacobottega.com/',
  transformacao: 'https://treinamentobottega.com.br/transformacao/',
  yt: 'https://www.youtube.com/@Evertonbottega',
  yt2: 'https://youtube.com/@nutricionistaetreinadorbottega',
  ig: 'https://www.instagram.com/evertonbottega/',
  fb: 'https://www.facebook.com/evertonbottega',
};
const WPP_SVG = '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>';
const btnWpp = (txt, msg, cls = '') => `<a class="btn btn-wpp ${cls}" target="_blank" rel="noopener" href="${msg ? wa(msg) : WA_DEFAULT}">${WPP_SVG}<span>${txt}</span></a>`;

/* ---------- posts ---------- */
const MONTHS = { janeiro: 1, fevereiro: 2, 'março': 3, abril: 4, maio: 5, junho: 6, julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12 };
const parseDate = (s) => { const m = /(\d+) de (\S+) de (\d{4})/.exec(s); return m ? new Date(+m[3], MONTHS[m[2].toLowerCase()] - 1, +m[1]) : new Date(0); };
const plain = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const titleCase = (t) => {
  const small = new Set(['a', 'o', 'as', 'os', 'e', 'de', 'da', 'do', 'das', 'dos', 'para', 'em', 'na', 'no', 'com', 'que', 'um', 'uma', 'ou', 'por', 'ao', 'nos', 'nas']);
  if (t !== t.toUpperCase()) return t;
  return t.toLowerCase().split(' ').map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
    .replace(/\bQ10\b/i, 'Q10').replace(/\bBcaas?\b/i, (m) => m.toUpperCase());
};
const category = (p) => {
  const t = (p.slug + ' ' + p.title).toLowerCase();
  if (/suplement|bcaa|beta-alanina|ribose|ubiquinona|coenzima|aminoacido/.test(t)) return 'Suplementação';
  if (/treino|exercic|abdomin|recupera|endurance|energ|muscula/.test(t)) return 'Treino';
  if (/mouse|mousse|batata|chocolate|fracionar|alimenta|comer/.test(t)) return 'Nutrição';
  return 'Saúde';
};
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/posts.json'), 'utf8')).map((p) => {
  const img = fs.readdirSync(path.join(ROOT, 'assets/blog')).find((f) => f.startsWith(p.slug + '.'));
  const words = p.blocks.map((b) => plain(b.html)).join(' ').split(' ').length;
  const first = p.blocks.find((b) => b.tag === 'p' && plain(b.html).length > 60);
  let ex = first ? plain(first.html) : '';
  if (ex.length > 150) ex = ex.slice(0, 150).replace(/\s\S*$/, '') + '…';
  return { ...p, title: titleCase(p.title), img: img && 'assets/blog/' + img, cat: category(p), min: Math.max(2, Math.round(words / 200)), ex, d: parseDate(p.date) };
}).sort((a, b) => b.d - a.d || a.title.localeCompare(b.title));

/* ---------- layout ---------- */
const NAV = [['index.html', 'Home'], ['everton.html', 'Éverton'], ['produtos.html', 'Produtos'], ['blog/index.html', 'Blog'], ['contato.html', 'Contato']];
function layout({ file, title, desc, body, base = '', active = '', og = 'assets/img/hero.jpg', ld = '' }) {
  const links = NAV.map(([h, l]) => `<a href="${base}${h}"${active === h ? ' aria-current="page"' : ''}>${l}</a>`).join('') +
    `<a href="${LINKS.clinica}" target="_blank" rel="noopener">Clínica Bottega</a>`;
  const mlinks = NAV.map(([h, l]) => `<a class="m" href="${base}${h}">${l}</a>`).join('') +
    `<a class="m" href="${LINKS.clinica}" target="_blank" rel="noopener">Clínica Bottega</a>`;
  const url = `${SITE}/${file === 'index.html' ? '' : file}`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#020617">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/${og}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${base}assets/img/favicon.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="${base}assets/site.css">
${ld ? `<script type="application/ld+json">${ld}</script>` : ''}
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<header class="top">
  <div class="wrap">
    <div class="glass">
      <a href="${base}index.html" aria-label="Éverton Bottega"><img src="${base}assets/img/logo.png" alt="Éverton Bottega" class="logo" width="114" height="36"></a>
      <nav class="nav" aria-label="Principal">${links}</nav>
      <div class="hr">
        <div class="pill"><i></i><span>Presencial &amp; On-line</span></div>
        <a class="btn btn-wpp btn-sm pulse mag" target="_blank" rel="noopener" href="${WA_DEFAULT}">${WPP_SVG}<span>Agendar</span></a>
        <button class="burger" aria-label="Abrir menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </div>
</header>
<div class="menu" aria-label="Menu">${mlinks}<a class="btn btn-wpp" target="_blank" rel="noopener" href="${WA_DEFAULT}">${WPP_SVG}<span>Agendar no WhatsApp</span></a></div>
<main>
${body}
</main>
<footer class="ft">
  <div class="wrap">
    <div class="fg">
      <div>
        <img src="${base}assets/img/logo.png" alt="Éverton Bottega" width="114" height="36">
        <p style="font-size:14px;max-width:340px">Treinador e Nutricionista Éverton Bottega. Acompanhamento nutricional e treinamento físico, presencial em Porto Alegre e on-line.</p>
        <p style="font-size:14px;margin-top:12px">📍 R. Schiller, 40 - Rio Branco<br>Porto Alegre - RS, 90430-150</p>
      </div>
      <div>
        <h4>Navegação</h4>
        <ul>${NAV.map(([h, l]) => `<li><a href="${base}${h}">${l}</a></li>`).join('')}<li><a href="${LINKS.clinica}" target="_blank" rel="noopener">Clínica Bottega</a></li></ul>
      </div>
      <div>
        <h4>Conecte-se</h4>
        <ul>
          <li><a href="${WA_DEFAULT}" target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="${LINKS.ig}" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="${LINKS.fb}" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="${LINKS.yt}" target="_blank" rel="noopener">YouTube</a></li>
          <li><a href="${LINKS.yt2}" target="_blank" rel="noopener">YouTube (canal 2)</a></li>
        </ul>
      </div>
    </div>
    <small>&copy; 2026 Éverton Bottega. Todos os direitos reservados.</small>
  </div>
</footer>
<div class="sticky"><a class="btn btn-wpp" target="_blank" rel="noopener" href="${WA_DEFAULT}">${WPP_SVG}<span>Agendar Avaliação no WhatsApp</span></a></div>
<script src="${base}assets/site.js" defer></script>
</body>
</html>
`;
}
const write = (rel, html) => { const f = path.join(ROOT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };

/* ---------- blocos reutilizáveis ---------- */
const postCard = (p, base = '', attrs = true) => `<a class="post tilt" href="${base}blog/${p.slug}.html" data-r${attrs ? ` data-t="${esc(p.title + ' ' + p.ex)}" data-c="${p.cat}"` : ''}>
  <div class="im"><img src="${base}${p.img}" alt="${esc(p.title)}" loading="lazy" width="600" height="400"></div>
  <div class="bd"><div class="meta"><span class="cat">${p.cat}</span><span>${p.date}</span><span>${p.min} min de leitura</span></div>
  <h3>${esc(p.title)}</h3><p>${esc(p.ex)}</p><span class="more">Ler artigo</span></div><span class="shine"></span></a>`;

const FAQ = [
  ['O atendimento é presencial em Porto Alegre ou também on-line?', 'Atendemos presencialmente na clínica, no bairro Rio Branco, em Porto Alegre, e também oferecemos acompanhamento on-line para pacientes de todo o Brasil e do exterior.'],
  ['Vou precisar passar fome ou parar de comer o que gosto?', 'Jamais. O pilar do trabalho do Éverton é a adesão sustentável. Construímos um plano flexível com alimentos reais, calculados estrategicamente para que você continue socializando sem culpa.'],
  ['Como funciona o acompanhamento nutricional e de treino?', 'Nutrição e treino trabalham de forma alinhada: o plano alimentar e a prescrição de treinos são desenhados juntos, a partir do seu objetivo, da sua rotina e da sua avaliação inicial.'],
  ['Quais são os cursos, livros e programas do Éverton?', 'Você encontra a Máquina de Definição (Método ATP3), o curso Nutri Sem Limites, o guia Seja a sua própria transformação e o livro N.O.W. – Natureza da Sabedoria. Tudo na página de produtos.'],
  ['Como falo com o Éverton e a equipe?', 'Pelo WhatsApp, no botão do site. Você conta o seu objetivo e a equipe indica o melhor caminho para começar.'],
];
const faqHtml = `<div class="faq" data-stagger="80">${FAQ.map(([q, a]) => `<details><summary>${q}</summary><div class="ans">${a}</div></details>`).join('')}</div>`;
const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };

const locHtml = (base = '') => `<section class="sec sec-cream" id="local" style="padding:72px 0">
  <div class="wrap loc">
    <div class="txt" data-stagger="100">
      <span class="eyebrow">Nossa localização</span>
      <h3>Venha conhecer a estrutura do Espaço Bottega</h3>
      <p>📍 R. Schiller, 40 - Rio Branco, Porto Alegre - RS, 90430-150</p>
      <p style="font-size:13px">Atendimento presencial com horário agendado, de segunda a sexta. Também atendemos on-line.</p>
      ${btnWpp('Agendar Atendimento', 'Olá, vim pelo site do Éverton Bottega e gostaria de agendar meu atendimento.', 'btn-sm')}
    </div>
    <div class="map" data-r="zoom"><iframe src="https://maps.google.com/maps?q=R.%20Schiller%2C%2040%20-%20Rio%20Branco%2C%20Porto%20Alegre%20-%20RS%2C%2090430-150&t=m&z=16&output=embed&iwloc=near" loading="lazy" allowfullscreen title="Mapa do Espaço Bottega"></iframe></div>
  </div>
</section>`;

const finalCta = (h = 'Comece a sua transformação <em>hoje</em>', p = 'Conte o seu objetivo pelo WhatsApp e receba a orientação de quem transforma corpo e mente há mais de 15 anos.') => `<section class="sec sec-black final">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span></div>
  <div class="wrap">
    <h2 data-split>${h}</h2>
    <p data-r>${p}</p>
    <div data-r data-d="150">${btnWpp('Agendar no WhatsApp', '', 'pulse mag')}</div>
  </div>
</section>`;

const PRODUCTS = [
  { id: 'maquina', tag: 'Programa · Método ATP3', title: 'Máquina de Definição', img: 'assets/img/gym.jpg', pos: 'right center',
    txt: 'Perca até 8kg de gordura e aumente a sua massa muscular em 90 dias. O Método ATP3 em 3 fases, com encontros ao vivo todo mês, avaliação das suas medidas e plano específico para você.',
    long: 'O Método ATP3 conduz você em 3 fases (Queima Máxima, Força Bruta e Definição Total) para perder gordura, ganhar definição e criar a base que impede o efeito sanfona. Inclui encontros ao vivo todo mês, avaliação personalizada das suas medidas e evolução e um plano específico para você.',
    btns: [['Conhecer o método', 'maquina-de-definicao.html', 'gold', true], ['Comprar', LINKS.kiwifyHome, 'ghost']] },
  { id: 'nutri', tag: 'Curso', title: 'Nutri Sem Limites', img: 'assets/prod/nutri-sem-limites.png', pos: 'center',
    txt: 'O passo a passo para nutricionistas iniciantes decolarem suas carreiras em apenas um mês.',
    long: 'Curso criado para nutricionistas iniciantes: o passo a passo para decolar a carreira em apenas um mês, com a experiência de quem atua há mais de 15 anos na área.',
    btns: [['Saiba mais', LINKS.hotmartNutri, 'gold']] },
  { id: 'seja', tag: 'Guia', title: 'Seja a sua própria transformação', img: 'assets/prod/seja-transformacao.jpg', pos: 'center',
    txt: 'Um guia para superar as dificuldades, adotar a nutrição ideal, o treino correto, o sono reparador e atingir a transformação pessoal, física e mental.',
    long: 'Você gostaria de aprender com alguém que superou a obesidade e se tornou multicampeão de fisiculturismo? Um guia para superar as dificuldades, adotar a nutrição ideal, o treino correto, o sono reparador e atingir a transformação pessoal, física e mental.',
    btns: [['Comprar', LINKS.hotmartSeja, 'gold']] },
  { id: 'now', tag: 'Livro e palestra', title: 'N.O.W. – Natureza da Sabedoria', img: 'assets/prod/now.jpg', pos: 'top',
    txt: 'Now – Nature of Wisdom. O guia completo para a sua jornada em busca da qualidade de vida e da autoestima.',
    long: 'Now – Nature of Wisdom: Natureza da Sabedoria. O guia completo para a sua jornada em busca da qualidade de vida e da autoestima, nascido da trajetória do Éverton como professor de pós-graduação, palestrante motivacional e amante de pessoas. Acompanha a palestra do livro, também por Éverton Bottega.',
    btns: [['Livro digital', LINKS.hotmartNow, 'gold'], ['Livro na Amazon', LINKS.amazon, 'ghost']] },
];
const pbtn = (b, base = '') => {
  const [t, h, k, internal] = b;
  return `<a class="btn btn-${k} btn-sm" href="${internal ? base + h : h}"${internal ? '' : ' target="_blank" rel="noopener"'}>${t}</a>`;
};

/* ---------- HOME ---------- */
function home() {
  const latest = posts.slice(0, 3).map((p) => postCard(p, '', false)).join('');
  const body = `
<section class="hero">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span><div class="grid-lines"></div></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <div class="badge" data-r="blur"><span class="st">★★★★★</span><span>5.0 no Google (144+ avaliações)</span><span class="tg">Porto Alegre &amp; On-line</span></div>
      <h1 data-split data-base="150">Acompanhamento nutricional e treinamento físico com <em>Éverton Bottega</em></h1>
      <p class="lead" data-r data-d="500">Treinador e Nutricionista há mais de <strong>15 anos</strong> transformando corpo e mente, para você viver com a sua melhor versão.</p>
      <ul class="checks" data-stagger="110" data-d="600">
        <li>Emagrecimento</li><li>Hipertrofia</li><li>Performance esportiva</li><li>Qualidade de vida e longevidade</li>
      </ul>
      <div class="cta-row" data-r data-d="900">
        ${btnWpp('Agendar no WhatsApp', '', 'pulse mag')}
        <a class="btn btn-ghost mag" href="#atendimentos">Conhecer os atendimentos</a>
      </div>
      <div class="stats" data-r data-d="1050">
        <div><b data-count="15" data-suffix="+">15+</b><span>Anos de experiência</span></div>
        <div><b data-count="2">2</b><span>Graduações: Ed. Física e Nutrição</span></div>
        <div><b data-count="5.0">5,0</b><span>Nota no Google</span></div>
      </div>
    </div>
    <div class="hero-photo" data-parallax=".05">
      <div class="frame" data-r="mask"><img src="assets/img/hero.jpg" alt="Éverton Bottega, treinador e nutricionista" width="1034" height="1280" fetchpriority="high"></div>
      <div class="chip c1" data-r data-d="1200"><i></i>Presencial &amp; On-line</div>
      <div class="chip c2" data-r data-d="1400">Nutrição + Treino</div>
    </div>
  </div>
  <div class="cue" aria-hidden="true">Role</div>
</section>

<div class="marquee" aria-hidden="true"><div class="track">
  ${[0, 1].map(() => '<span>Emagrecimento</span><span>Hipertrofia</span><span>Performance esportiva</span><span>Qualidade de vida</span><span>Longevidade</span><span>Nutrição</span><span>Treino</span><span>Mentalidade</span>').join('')}
</div></div>

<section class="sec" id="atendimentos">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow" data-r>Atendimentos</span>
      <h2 data-split>Como o <span class="grad">Éverton</span> pode transformar a sua saúde</h2>
      <p data-r>Três caminhos para você chegar ao seu objetivo, com acompanhamento de quem entende de corpo e mente.</p>
    </div>
    <div class="grid g3" data-stagger="140">
      <div class="card tilt"><span class="shine"></span>
        <div class="num">01</div><h3>Acompanhamento Nutricional</h3>
        <p>Plano alimentar sob medida para a sua rotina, preferências e vida social, com treino alinhado à nutrição. Sem cardápio genérico e sem restrições malucas.</p>
        <ul><li>Alimentos reais e saborosos</li><li>Treino e nutrição integrados</li><li>Presencial ou on-line</li></ul>
        ${btnWpp('Falar no WhatsApp', 'Olá, vim pelo site do Éverton Bottega e quero saber sobre o acompanhamento nutricional.', 'btn-sm')}
      </div>
      <div class="card feat tilt"><span class="shine"></span><span class="tagtop">Clínica</span>
        <div class="num" style="background:rgba(197,155,39,.2);color:var(--gold-600)">02</div><h3>Clínica Bottega</h3>
        <p>Clínica de Medicina e Nutrição Integrativa: análise metabólica e hormonal, avaliação de exames e acompanhamento com equipe multidisciplinar.</p>
        <ul><li>Medicina do esporte e hormonal</li><li>Nutrição esportiva de precisão</li><li>Mentoria comportamental</li></ul>
        <a class="btn btn-gold btn-sm" target="_blank" rel="noopener" href="${LINKS.clinica}">Conhecer o Espaço Bottega</a>
      </div>
      <div class="card tilt"><span class="shine"></span>
        <div class="num" style="background:#d1fae5;color:#047857">03</div><h3>Máquina de Definição</h3>
        <p>Perca até 8kg de gordura e aumente a sua massa muscular em 90 dias com o Método ATP3, passo a passo, no seu ritmo.</p>
        <ul><li>Foco em gordura e massa muscular</li><li>Método em 3 fases</li><li>Encontros ao vivo todo mês</li></ul>
        <a class="btn btn-wpp btn-sm" href="maquina-de-definicao.html">Conhecer o método</a>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-dark story" id="como-funciona">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow" data-r>Como funciona</span>
      <h2 data-split>Do primeiro contato ao <em>resultado que fica</em></h2>
    </div>
    <div class="story-grid">
      <div class="story-media">
        <img src="assets/img/hero.jpg" alt="" loading="lazy"><img src="assets/img/portrait.jpg" alt="" loading="lazy"><img src="assets/img/gym.jpg" alt="" loading="lazy" style="object-position:70% top">
        <span class="no">01</span>
      </div>
      <div class="story-steps">
        <article class="step" data-step="0"><small>Etapa 01</small><h3>Avaliação e objetivo</h3><p>Conversamos sobre a sua rotina, o seu histórico e o que você quer conquistar: emagrecer, ganhar massa muscular, melhorar a performance ou viver melhor por mais tempo.</p></article>
        <article class="step" data-step="1"><small>Etapa 02</small><h3>Plano sob medida</h3><p>Nutrição e treino desenhados juntos, com alimentos reais, horários que cabem na sua vida e nada de cardápio genérico.</p></article>
        <article class="step" data-step="2"><small>Etapa 03</small><h3>Acompanhamento de perto</h3><p>Ajustes constantes, presencial em Porto Alegre ou on-line, para você manter o resultado e evoluir sem efeito sanfona.</p></article>
      </div>
    </div>
  </div>
</section>

<section class="sec sec-black manifesto">
  <div class="wrap">
    <p class="scrub" data-scrub data-gold="transformou,transformado,faz">“Ninguém transforma ninguém, sem antes ter se transformado. Não importa o que você sabe, mas sim o que você faz com o que você sabe.”</p>
    <div class="attr" data-r>Éverton Bottega · A milhão, igual a uma máquina de energia!</div>
  </div>
</section>

<section class="sec sec-dark" id="sobre">
  <div class="wrap about">
    <div class="ph"><div class="frame" data-r="mask"><img src="assets/img/everton.jpg" alt="Éverton Bottega, treinador e nutricionista" loading="lazy" width="2500" height="2500"></div></div>
    <div class="txt" data-stagger="110">
      <span class="eyebrow">Liderança &amp; autoridade</span>
      <h2>Treinador e Nutricionista <em>Éverton Bottega</em></h2>
      <p class="big">O Éverton Bottega atua há mais de 15 anos contribuindo com a transformação de centenas de pessoas. É referência nacional na área da saúde, no desenvolvimento humano e na nutrição esportiva.</p>
      <div class="mini">
        <div><h4>Treinado por Anthony Robbins</h4><p>Capacitado em Las Vegas e Londres pelo maior coach do mundo.</p></div>
        <div><h4>Dupla graduação</h4><p>Formado em Educação Física e em Nutrição.</p></div>
      </div>
      <p>Formado pelo Instituto de Formação de Treinadores Comportamentais (IFT), pelo Instituto Brasileiro de Coach (IBC) e pelo Instituto Geronimo Theml (IGT), com formação em Programação Neurolinguística (PNL). Ex-atleta multicampeão de fisiculturismo.</p>
      <a class="btn btn-gold mag" href="everton.html">Conheça a história →</a>
    </div>
  </div>
</section>

<section class="sec sec-dark" id="produtos" style="padding-top:0">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow dk" data-r>Cursos, livros e programas</span>
      <h2 data-split>Leve o método do Éverton <em>onde você estiver</em></h2>
      <p data-r>Programa, curso, guia e livro para quem quer aprender e evoluir no seu ritmo.</p>
    </div>
    <div class="prods" data-stagger="120">
      ${PRODUCTS.map((p) => `<div class="prod tilt"><span class="shine"></span><div class="im"><img src="${p.img}" alt="${esc(p.title)}" loading="lazy" style="object-position:${p.pos}"></div><div class="bd"><span class="ptag">${p.tag}</span><h3>${p.title}</h3><p>${p.txt}</p><div class="acts">${p.btns.map((b) => pbtn(b)).join('')}</div></div></div>`).join('')}
    </div>
    <div class="center" style="margin-top:24px" data-r><a class="btn btn-ghost" href="produtos.html">Ver todos os produtos</a></div>
    <div class="yt" data-r="zoom">
      <img src="assets/img/youtube.jpg" alt="Canal do Éverton Bottega no YouTube" loading="lazy">
      <div class="ov"><h3>Acompanhe o canal do Éverton no YouTube</h3><a class="btn btn-red mag" target="_blank" rel="noopener" href="${LINKS.yt}">▶ Acesse o canal do YouTube</a></div>
    </div>
  </div>
</section>

<section class="sec" id="blog">
  <div class="wrap">
    <div class="head">
      <span class="eyebrow" data-r>Blog</span>
      <h2 data-split>Artigos do <span class="grad">Éverton Bottega</span></h2>
      <p data-r>Assuntos sobre nutrição, exercícios, suplementação, neurociência e inteligência emocional.</p>
    </div>
    <div class="posts" data-stagger="130">${latest}</div>
    <div class="center" style="margin-top:36px" data-r><a class="btn btn-line" href="blog/index.html">Ver todos os artigos</a></div>
  </div>
</section>

<section class="sec sec-cream" id="faq">
  <div class="wrap">
    <div class="head"><span class="eyebrow" data-r>Tire suas dúvidas</span><h2 data-split>Perguntas Frequentes</h2></div>
    ${faqHtml}
  </div>
</section>

${finalCta()}
${locHtml()}`;
  const person = ({ '@context': 'https://schema.org', '@type': 'Person', name: 'Éverton Bottega', jobTitle: 'Treinador e Nutricionista', url: SITE, image: `${SITE}/assets/img/hero.jpg`, sameAs: [LINKS.ig, LINKS.fb, LINKS.yt], address: { '@type': 'PostalAddress', streetAddress: 'R. Schiller, 40 - Rio Branco', addressLocality: 'Porto Alegre', addressRegion: 'RS', postalCode: '90430-150', addressCountry: 'BR' } });
  const ld = JSON.stringify([person, faqLd]);
  return layout({ file: 'index.html', title: 'Éverton Bottega | Treinador e Nutricionista Esportivo em Porto Alegre', desc: 'Acompanhamento nutricional e treinamento físico com Éverton Bottega. Emagrecimento, hipertrofia, performance esportiva, qualidade de vida e longevidade. Presencial em Porto Alegre e on-line.', body, active: 'index.html', ld: `[${ld},${faqLd}]`.replace(/^\[|\]$/g, '') && ld });
}

/* ---------- ÉVERTON ---------- */
function everton() {
  const body = `
<section class="ph-hero">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span></div>
  <div class="wrap"><span class="eyebrow dk" data-r>Sobre</span><h1 data-split>Treinador e Nutricionista <em>Éverton Bottega</em></h1><p data-r>Há mais de 15 anos contribuindo com a transformação de centenas de pessoas. Referência nacional na área da saúde.</p></div>
</section>
<section class="sec sec-dark">
  <div class="wrap about">
    <div class="ph"><div class="frame" data-r="mask"><img src="assets/img/portrait.jpg" alt="Éverton Bottega" width="720" height="1080"></div></div>
    <div class="txt" data-stagger="110">
      <span class="eyebrow">Trajetória</span>
      <p class="big">O Éverton Bottega atua há mais de 15 anos contribuindo com a transformação de centenas de pessoas, ele é referência nacional na área da saúde. Foi treinado pelo maior coach do mundo, Anthony Robbins, em Las Vegas e Londres, e pelo maior mentor de vida e finanças, T. Harv Eker, autor do livro “Os Segredos da Mente Milionária”.</p>
      <p>É formado pelo Instituto de Formação de Treinadores Comportamentais (IFT), Instituto Brasileiro de Coach (IBC), Instituto Geronimo Theml (IGT). A formação em Programação Neurolinguística (PNL) também faz parte da sua trajetória. Somam-se, ainda, duas graduações: Educação física e Nutrição.</p>
      <p>Ele já precisou colocar muito em prática as técnicas que aprendeu ao longo da sua história. Exemplo disso é sua carreira de ex-atleta. Éverton foi multicampeão no fisiculturismo e sentiu na pele o poder controlador da mente. Ele soube dominar seus sabotadores, para se tornar um vencedor. Já treinou vários atletas e hoje é dono de duas grandes empresas na área da saúde: Academia Unidade do Corpo e Clínica Espaço de Transformação Bottega.</p>
      <p>Do saldo positivo da sua grande jornada como professor de pós-graduação, palestrante motivacional e amante de pessoas, nasceu o livro “NOW – Natureza da Sabedoria”. Assim, um número infinito de pessoas pode encontrar a conexão perfeita para o seu aprimoramento pessoal, físico e mental.</p>
    </div>
  </div>
</section>
<section class="sec sec-black manifesto">
  <div class="wrap">
    <p class="scrub" data-scrub data-gold="transformou,transformado,faz">“Ninguém transforma ninguém, sem antes ter se transformado. Não importa o que você sabe, mas sim o que você faz com o que você sabe.”</p>
    <div class="attr" data-r>Os dois lemas do Éverton na profissão</div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="head"><span class="eyebrow" data-r>Formação e experiência</span><h2 data-split>O que sustenta o <span class="grad">método</span></h2></div>
    <div class="grid g3" data-stagger="120">
      <div class="card tilt"><span class="shine"></span><div class="num">01</div><h3>Mentores de referência</h3><p>Treinado por Anthony Robbins, em Las Vegas e Londres, e por T. Harv Eker, autor de “Os Segredos da Mente Milionária”.</p></div>
      <div class="card tilt"><span class="shine"></span><div class="num">02</div><h3>Formação sólida</h3><p>Duas graduações (Educação Física e Nutrição), IFT, IBC, IGT e formação em Programação Neurolinguística (PNL).</p></div>
      <div class="card tilt"><span class="shine"></span><div class="num">03</div><h3>Vivência de atleta</h3><p>Ex-atleta multicampeão de fisiculturismo, professor de pós-graduação e palestrante motivacional.</p></div>
    </div>
    <div class="grid g2" style="margin-top:28px" data-stagger="120">
      <div class="card tilt"><span class="shine"></span><h3>Academia Unidade do Corpo</h3><p>Uma das duas grandes empresas de saúde do Éverton.</p></div>
      <div class="card tilt"><span class="shine"></span><h3>Clínica Espaço de Transformação Bottega</h3><p>Medicina e nutrição integrativa em Porto Alegre.</p><a class="btn btn-gold btn-sm" target="_blank" rel="noopener" href="${LINKS.clinica}">Conhecer a clínica</a></div>
    </div>
  </div>
</section>
${finalCta('Quer treinar e comer com <em>estratégia</em>?')}
${locHtml()}`;
  return layout({ file: 'everton.html', title: 'Éverton Bottega | Treinador e Nutricionista', desc: 'Conheça a trajetória do Éverton Bottega: mais de 15 anos de experiência, duas graduações, treinado por Anthony Robbins e multicampeão de fisiculturismo.', body, active: 'everton.html', og: 'assets/img/portrait.jpg' });
}

/* ---------- PRODUTOS ---------- */
function produtos() {
  const rows = PRODUCTS.map((p, i) => `<div class="row ${i % 2 ? 'rev' : ''}">
    <div class="im" data-r="${i % 2 ? 'right' : 'left'}"><img src="${p.img}" alt="${esc(p.title)}" loading="lazy" style="object-position:${p.pos}"></div>
    <div class="tx" data-stagger="110"><span class="eyebrow">${p.tag}</span><h2>${p.title}</h2><p>${p.long}</p><div class="acts">${p.btns.map((b) => pbtn(b)).join('')}</div></div>
  </div>`).join('') + `<div class="row rev">
    <div class="im" data-r="right"><img src="assets/img/clinica.jpg" alt="Espaço Bottega" loading="lazy"></div>
    <div class="tx" data-stagger="110"><span class="eyebrow">Atendimento</span><h2>Acompanhamento Nutricional e Clínica Bottega</h2><p>Plano alimentar e treino sob medida, presencialmente em Porto Alegre ou on-line, e a Clínica de Medicina e Nutrição Integrativa do Espaço Bottega.</p><div class="acts">${btnWpp('Falar no WhatsApp', 'Olá, vim pelo site do Éverton Bottega e quero saber sobre o acompanhamento nutricional.', 'btn-sm')}<a class="btn btn-line btn-sm" target="_blank" rel="noopener" href="${LINKS.clinica}">Espaço Bottega</a></div></div>
  </div>`;
  const body = `
<section class="ph-hero">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span></div>
  <div class="wrap"><span class="eyebrow dk" data-r>Produtos</span><h1 data-split>Cursos, livros e programas do <em>Éverton</em></h1><p data-r>Conteúdo para você transformar corpo e mente, no seu ritmo.</p></div>
</section>
<section class="sec"><div class="wrap">${rows}</div></section>
${finalCta('Não sabe por onde <em>começar</em>?', 'Fale com a equipe no WhatsApp e descubra o melhor caminho para o seu objetivo.')}`;
  return layout({ file: 'produtos.html', title: 'Produtos | Éverton Bottega', desc: 'Máquina de Definição (Método ATP3), Nutri Sem Limites, Seja a sua própria transformação e o livro N.O.W. – Natureza da Sabedoria.', body, active: 'produtos.html', og: 'assets/img/gym.jpg' });
}

/* ---------- MÁQUINA DE DEFINIÇÃO (VSL) ---------- */
function maquina() {
  const cta = (t = 'QUERO FICAR IRRECONHECÍVEL', href = '#oferta') => `<div data-r><a class="btn btn-gold mag" href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${t}</a></div>`;
  const body = `
<section class="ph-hero" style="padding-bottom:80px">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span></div>
  <div class="wrap">
    <img src="assets/img/logo-maquina.png" alt="Máquina de Definição · Método ATP3" width="200" height="150" style="height:110px;width:auto" data-r>
    <h1 data-split>Assista agora à apresentação e <em>descubra:</em></h1>
    <p data-r><strong style="color:#fff">O motivo invisível que te mantém acumulando gordura</strong> (e como quebrar isso em tempo recorde, sem métodos malucos)</p>
    <div class="vsl" data-r="zoom" data-d="150" style="width:100%"><div class="vsl-box"><vturb-smartplayer id="vid-691e25e0d55a0071a20efacb" style="display:block;margin:0 auto;width:100%"></vturb-smartplayer></div></div>
    <p data-r style="font-size:15px">O mesmo método que Everton usou para treinar atletas de fisiculturismo a secar e definir em tempo recorde agora adaptado para pessoas comuns</p>
    ${cta()}
  </div>
</section>

<section class="sec">
  <div class="wrap center" data-stagger="120" style="max-width:820px;display:grid;gap:18px;justify-items:center">
    <h2 style="font-size:clamp(26px,4.2vw,40px);font-weight:800">Em apenas 90 dias você vai ativar seu metabolismo para <span class="grad">secar até 15kg de gordura</span>, ganhar definição e voltar irreconhecível</h2>
    <p class="old" style="color:var(--s600);font-weight:600">De R$ 397</p>
    <p style="font-size:22px;font-weight:800">12x R$ 10,03 <span style="font-weight:600;color:var(--s600);font-size:16px">ou R$ 97,00 à vista</span></p>
    ${cta()}
    <p style="font-size:14px;color:var(--s600)">Faça agora sua inscrição e aproveite garantia de 7 dias</p>
  </div>
</section>

<section class="sec sec-dark">
  <div class="wrap">
    <div class="head"><h2 data-split>Por que você precisa tomar essa decisão <em>agora</em>?</h2></div>
    <div class="stmt dk" data-stagger="110">
      <p><strong style="color:#fff">Porque cada dia que você adia é mais um dia tolerando o que você odeia.</strong></p>
      <p>Tolera a barriga que pesa, o fôlego que falta, a preguiça que te derruba no sofá.</p>
      <p>Tolera prometer e não cumprir.</p>
      <p>Tolera ser o cara que diz que vai mudar e não muda.</p>
      <p>Só que enquanto você adia, não é só o corpo que piora. É a sua confiança, autoestima, energia… É a forma como você é visto pela sua mulher, pelos seus amigos, por você mesmo.</p>
      <p>E se você não tomar a decisão agora, esse ciclo continua… Mas se você decidir hoje… em 90 dias você pode ser irreconhecível.</p>
    </div>
    <div class="center" style="margin-top:36px">${cta()}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="head"><span class="eyebrow" data-r>Depois do ATP3</span><h2 data-split>O que vai acontecer na sua vida depois do <span class="grad">ATP3</span>?</h2></div>
    <div class="grid g2" data-stagger="100" style="max-width:920px;margin:0 auto">
      ${['Você vai parar de ser o cara que desiste no meio.', 'Vai olhar no espelho e finalmente sentir orgulho do corpo que vê.', 'Vai recuperar o respeito da sua mulher… dentro e fora da cama.', 'Vai voltar a ter energia pra brincar com seus filhos, viajar, viver sem medo do cansaço.', 'Vai sentir na pele o que é ter disciplina, confiança e presença.', 'Vai se tornar o homem que cumpre a própria palavra e isso muda tudo na vida.'].map((t) => `<div class="card tilt" style="padding:24px"><span class="shine"></span><p style="color:var(--ink);font-weight:600;font-size:15.5px">✓ ${t}</p></div>`).join('')}
    </div>
    <p class="center" style="max-width:720px;margin:36px auto 0;color:var(--s600)" data-r>Não é só a sua aparência ou o peso na balança, quando você mudar o seu corpo, você tem disposição e disciplina pra mudar sua vida!</p>
    <div class="center" style="margin-top:28px">${cta()}</div>
  </div>
</section>

<section class="sec sec-black">
  <div class="wrap">
    <div class="head"><h2 data-split>Por que dessa vez vai ser <em>diferente</em>?</h2><p data-r>Porque vai funcionar?</p></div>
    <div class="stmt dk" data-stagger="110">
      <p>Vamos ser sinceros… se emagrecer fosse fácil, era só seguir qualquer dieta e entrar na academia.</p>
      <p>Mas você sabe que não é simples assim. A maioria desiste porque não vê resultado, tudo parece um sacrifício sem fim… um tédio que só desgasta.</p>
      <p>O Everton não ignora isso. Na verdade, ele criou o ATP3 justamente pra ser à prova de desistência… pra vencer a preguiça e o modo automático do seu corpo.</p>
      <p>Esse método transforma o seu corpo numa máquina de queimar gordura e ganhar músculo. E com essa transformação, vem o efeito colateral que ninguém te conta: você muda não só o shape, mas também a disciplina, a confiança e a forma como encara a vida…</p>
      <p><strong style="color:var(--gold-400)">Some por 90 dias e volta irreconhecível!</strong></p>
    </div>
    <div class="center" style="margin-top:36px">${cta('EU VOU ME DAR MAIS UMA CHANCE!')}</div>
  </div>
</section>

<section class="sec sec-dark">
  <div class="wrap">
    <div class="head"><span class="eyebrow dk" data-r>O método</span><h2 data-split>O que você vai <em>receber</em>?</h2><p data-r>O mesmo método que o Everton usa em sua consultoria individual, onde cobra R$ 4.000 ao ano… Você vai viver uma jornada em 3 fases:</p></div>
    <div class="phases" data-stagger="140">
      <div class="phase tilt"><span class="shine"></span><b>1</b><h3>Queima Máxima</h3><p>Aqui você desinflama, reduz retenção e faz o corpo começar a queimar gordura de forma acelerada. É o primeiro choque onde os resultados iniciais aparecem.</p></div>
      <div class="phase tilt"><span class="shine"></span><b>2</b><h3>Força Bruta</h3><p>Nesse estágio, você fortalece os músculos, aumenta energia e cria a base que impede o efeito sanfona. É aqui que você percebe o seu corpo definindo!</p></div>
      <div class="phase tilt"><span class="shine"></span><b>3</b><h3>Definição Total</h3><p>É quando você refina o shape, traça a linha que sempre quis ver no espelho e conquista a confiança de se sentir irreconhecível.</p></div>
    </div>
    <p class="center" style="margin:40px 0 20px;font-weight:700;color:#fff" data-r>E durante todo o processo, você não vai estar sozinho. Você ganha de bônus!</p>
    <div class="bonus" data-stagger="120">
      <div><small>Bônus 1</small><p>Encontros ao vivo todo mês comigo pra ajustar e tirar dúvidas.</p></div>
      <div><small>Bônus 2</small><p>Avaliação personalizada das suas medidas e evolução.</p></div>
      <div><small>Bônus 3</small><p>Um plano específico pra você… nada de protocolo genérico.</p></div>
    </div>
  </div>
</section>

<section class="sec" id="oferta">
  <div class="wrap">
    <div class="price" data-r="zoom">
      <span class="eyebrow dk">Método ATP 3</span>
      <p style="color:var(--s200);font-size:15px">O Método ATP 3 poderia valer muito mais… Durante muito tempo foi vendido por R$397. Mas, apenas nessa página, você tem acesso completo <strong style="color:#fff">COM R$300 DE DESCONTO</strong></p>
      <p class="old">De R$ 397</p>
      <p style="font-weight:700">Por apenas</p>
      <div class="big">12x R$ 10,03</div>
      <p style="font-weight:600">ou R$ 97,00 à vista</p>
      <small>(Oferta por tempo limitado – sem falsa urgência)</small>
      <a class="btn btn-gold mag" style="margin-top:8px" target="_blank" rel="noopener" href="${LINKS.kiwifyVsl}">QUERO APROVEITAR ESSE SUPER DESCONTO!</a>
      <small>Faça agora sua inscrição e aproveite garantia de 7 dias</small>
    </div>
    <div class="guar" style="margin-top:44px" data-r>
      <div style="display:flex;gap:18px;align-items:center"><b>7</b><div><h3 style="font-size:22px;font-weight:800">Garantia incondicional de 7 dias!</h3></div></div>
      <p style="color:var(--s700)">Eu sei que você não vai precisar… mas se quiser… Tem uma garantia incondicional de 7 dias! Você tem 7 dias para acessar todo o conteúdo e decidir se é pra você. Se não sentir que esse é o caminho, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.</p>
      <div>${cta('QUERO FICAR IRRECONHECÍVEL', LINKS.kiwifyVsl)}</div>
    </div>
  </div>
</section>

<section class="sec sec-black">
  <div class="wrap about">
    <div class="ph"><div class="frame" data-r="mask"><img src="assets/img/quem-e.png" alt="Éverton Bottega" loading="lazy" width="608" height="943"></div></div>
    <div class="txt" data-stagger="110">
      <span class="eyebrow">Quem é o Everton?</span>
      <h2>De ex-obeso a <em>campeão de fisiculturismo</em></h2>
      <p class="big">Everton não é apenas nutricionista e treinador que dá conselhos do outro lado da mesa… Ele já esteve do outro lado: um ex-obeso que virou o jogo e subiu no palco como campeão de fisiculturismo.</p>
      <p>Nos últimos 20 anos, ele ajudou desde atletas de alto nível a conquistarem definição em tempo recorde, até homens comuns que estavam cansados de falhar em todas as tentativas de dieta e treino.</p>
      <p>Foi nesse processo que nasceu o Método ATP3: um protocolo criado para ser à prova de desistência, quebrando a programação automática do corpo e ativando uma nova rotina de energia, disciplina e resultados. Everton sabe que cada corpo reage de forma diferente, e é por isso que desenvolveu um processo baseado em fases que garantem evolução contínua… sem efeito sanfona, sem promessas malucas.</p>
      <p>Hoje, ele atende em consultoria personalizada que custa R$4.000 por ano, com encontros mensais exclusivos. Mas decidiu abrir acesso ao mesmo método por um valor muito mais acessível, para que qualquer homem possa transformar sua vida em apenas 90 dias.</p>
      <a class="btn btn-gold mag" target="_blank" rel="noopener" href="${LINKS.kiwifyVsl}">EU VOU ME DAR MAIS UMA CHANCE!</a>
    </div>
  </div>
  <div class="wrap grid g2" style="margin-top:56px;max-width:960px" data-stagger="150">
    <div class="im" style="border-radius:24px;overflow:hidden"><img src="assets/img/antes-depois-everton.png" alt="Antes e depois do Éverton" loading="lazy"></div>
    <div class="im" style="border-radius:24px;overflow:hidden"><img src="assets/img/resultado-luiz.jpg" alt="Resultado do Luiz: menos 39kg" loading="lazy"></div>
  </div>
</section>
<script src="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/smartplayer.js" async></script>
<script>var s=document.createElement("script");s.src="https://scripts.converteai.net/89ae9049-d379-42aa-a047-ceae609ed4c9/players/690e7b189027e3855c00a2d7/v4/player.js";s.async=true;document.head.appendChild(s);</script>`;
  return layout({ file: 'maquina-de-definicao.html', title: 'Máquina de Definição · Método ATP3 | Éverton Bottega', desc: 'O Método ATP3 em 3 fases para perder gordura e ganhar definição em 90 dias, com encontros ao vivo todo mês, avaliação de medidas e plano específico.', body, active: 'produtos.html', og: 'assets/img/gym.jpg' });
}

/* ---------- CONTATO ---------- */
function contato() {
  const body = `
<section class="ph-hero">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span></div>
  <div class="wrap"><span class="eyebrow dk" data-r>Contato</span><h1 data-split>Vamos <em>conversar</em>?</h1><p data-r>Conte o seu objetivo e a equipe do Éverton retorna pelo WhatsApp.</p></div>
</section>
<section class="sec">
  <div class="wrap cgrid">
    <form class="c" data-stagger="90">
      <label>Nome<input name="nome" required autocomplete="name" placeholder="Seu nome"></label>
      <label>E-mail<input name="email" type="email" autocomplete="email" placeholder="voce@email.com"></label>
      <label>Telefone<input name="tel" type="tel" autocomplete="tel" placeholder="(51) 99999-9999"></label>
      <label>Mensagem<textarea name="msg" required placeholder="Conte o seu objetivo"></textarea></label>
      <button class="btn btn-wpp mag" type="submit">${WPP_SVG}<span>Enviar pelo WhatsApp</span></button>
    </form>
    <div class="info" data-stagger="100">
      <a href="${WA_DEFAULT}" target="_blank" rel="noopener"><div class="ic">💬</div><div><b>WhatsApp</b><span>+55 51 99282-8012</span></div></a>
      <div class="i"><div class="ic">📍</div><div><b>Endereço</b><span>R. Schiller, 40 - Rio Branco<br>Porto Alegre - RS, 90430-150</span></div></div>
      <div class="i"><div class="ic">🕘</div><div><b>Atendimento</b><span>Presencial com horário agendado, de segunda a sexta, e on-line.</span></div></div>
      <a href="${LINKS.ig}" target="_blank" rel="noopener"><div class="ic">📷</div><div><b>Instagram</b><span>@evertonbottega</span></div></a>
      <a href="${LINKS.yt}" target="_blank" rel="noopener"><div class="ic">▶</div><div><b>YouTube</b><span>@Evertonbottega</span></div></a>
    </div>
  </div>
</section>
${locHtml()}`;
  return layout({ file: 'contato.html', title: 'Contato | Éverton Bottega', desc: 'Fale com o Éverton Bottega pelo WhatsApp. Atendimento presencial em Porto Alegre e on-line.', body, active: 'contato.html' });
}

/* ---------- BLOG ---------- */
function blogIndex() {
  const cats = ['todos', ...new Set(posts.map((p) => p.cat))];
  const body = `
<section class="ph-hero">
  <div class="hero-bg" aria-hidden="true"><span class="orb o1"></span><span class="orb o2"></span></div>
  <div class="wrap"><span class="eyebrow dk" data-r>Blog</span><h1 data-split>Artigos e Blog do <em>Éverton Bottega</em></h1><p data-r>Assuntos sobre nutrição, exercícios, suplementação, neurociência e inteligência emocional.</p></div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="search" data-r><input id="q" type="search" placeholder="Buscar artigos" aria-label="Buscar artigos"></div>
    <div class="chips" data-r>${cats.map((c, i) => `<button data-c="${c}" class="${i === 0 ? 'on' : ''}">${c === 'todos' ? 'Todos' : c}</button>`).join('')}</div>
    <div class="posts">${posts.map((p) => postCard(p, '../'.replace('../', ''))).join('')}</div>
    <p class="empty">Nenhum artigo encontrado para essa busca.</p>
  </div>
</section>
${finalCta('Quer ir além da leitura?', 'Fale com o Éverton e receba um plano sob medida para o seu objetivo.')}`;
  // postCard usa base relativo ao root; o índice do blog fica em /blog/, então reescreve para links locais
  const fixed = body.replace(/href="blog\//g, 'href="').replace(/src="assets\//g, 'src="../assets/');
  return layout({ file: 'blog/index.html', title: 'Blog | Éverton Bottega', desc: 'Artigos do Éverton Bottega sobre nutrição, exercícios, suplementação, neurociência e inteligência emocional.', body: fixed, base: '../', active: 'blog/index.html', og: 'assets/img/youtube.jpg' });
}

function article(p, i) {
  const prev = posts[i + 1], next = posts[i - 1];
  const rel = posts.filter((x) => x.slug !== p.slug && x.cat === p.cat).concat(posts.filter((x) => x.slug !== p.slug && x.cat !== p.cat)).slice(0, 3);
  const blocks = [...p.blocks];
  let sign = '';
  const li = blocks.findIndex((b) => /CRN|CREF/.test(b.html));
  if (li >= 0) sign = `<div class="sign">${blocks.splice(li, 1)[0].html}</div>`;
  const prose = blocks.map((b) => (b.tag === 'ul' || b.tag === 'ol') ? `<${b.tag}>${b.html}</${b.tag}>` : `<${b.tag}>${b.html}</${b.tag}>`).join('\n');
  const img = '../' + p.img;
  const body = `
<section class="art-hero">
  <div class="bgi" style="background-image:url('${img}')"></div>
  <div class="wrap">
    <div class="crumbs"><a href="../index.html">Home</a> / <a href="index.html">Blog</a></div>
    <h1 data-split>${esc(p.title)}</h1>
    <div class="meta"><span class="cat">${p.cat}</span><span>${p.date}</span><span>${p.min} min de leitura</span><span>Por Éverton Bottega</span></div>
  </div>
</section>
<div class="art-cover" data-r="zoom"><img src="${img}" alt="${esc(p.title)}" width="900" height="600"></div>
<article class="art"><div class="prose">
${prose}
${sign}
</div></article>
<div style="padding:0 20px"><div class="cta-box" data-r="zoom"><h3>Quer aplicar isso na sua rotina?</h3><p>Fale com o Éverton e receba um plano de nutrição e treino sob medida para o seu objetivo.</p>${btnWpp('Agendar no WhatsApp', `Olá, li o artigo "${p.title}" no site do Éverton Bottega e gostaria de agendar minha avaliação.`, 'mag')}</div></div>
<nav class="pn" aria-label="Outros artigos">
  ${prev ? `<a href="${prev.slug}.html"><small>← Anterior</small><b>${esc(prev.title)}</b></a>` : '<span></span>'}
  ${next ? `<a class="nx" href="${next.slug}.html"><small>Próximo →</small><b>${esc(next.title)}</b></a>` : '<span></span>'}
</nav>
<section class="sec sec-cream">
  <div class="wrap">
    <div class="head"><h2 data-split>Continue <span class="grad">lendo</span></h2></div>
    <div class="posts" data-stagger="130">${rel.map((x) => postCard(x, '', false).replace(/href="blog\//, 'href="').replace(/src="assets\//, 'src="../assets/')).join('')}</div>
  </div>
</section>`;
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, image: `${SITE}/${p.img}`, author: { '@type': 'Person', name: 'Éverton Bottega' }, datePublished: p.d.toISOString().slice(0, 10), mainEntityOfPage: `${SITE}/blog/${p.slug}.html` });
  return layout({ file: `blog/${p.slug}.html`, title: `${p.title} | Éverton Bottega`, desc: p.ex, body, base: '../', active: 'blog/index.html', og: p.img, ld });
}

/* ---------- saída ---------- */
write('index.html', home());
write('everton.html', everton());
write('produtos.html', produtos());
write('maquina-de-definicao.html', maquina());
write('contato.html', contato());
write('blog/index.html', blogIndex());
posts.forEach((p, i) => write(`blog/${p.slug}.html`, article(p, i)));

const urls = ['', 'everton.html', 'produtos.html', 'maquina-de-definicao.html', 'contato.html', 'blog/index.html', ...posts.map((p) => `blog/${p.slug}.html`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`ok: ${urls.length} páginas, ${posts.length} artigos`);
