const RANK_LABELS = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const SUITS = ['♠', '♥', '♣', '♦'];
const CARD_SUITS = ['Spade', 'Heart', 'Club', 'Diamond'];

// 图片缓存:首次加载后把每张牌的图片转成 blob 对象 URL 缓存在内存中,
// 之后渲染牌面直接复用缓存,不再走网络,避免每次加载都很慢。
const imageCache = new Map();

function allCardFiles() {
  const files = ['Background.png', 'JOKER-A.png', 'JOKER-B.png'];
  for (const suit of CARD_SUITS) {
    for (const rank of RANK_LABELS) files.push(`${suit}${rank}.png`);
  }
  return files;
}

// 返回某张牌图片的可用地址:命中缓存则用缓存的对象 URL,否则退回原始路径。
function cardSrc(file) {
  return imageCache.get(file) || `/card_picture/PNG/${file}`;
}

// 预加载全部牌面图片到缓存。应在应用启动时调用(无需 await,缓存未就绪时会回退到原始路径)。
export async function preloadCardImages() {
  await Promise.all(allCardFiles().map(async (file) => {
    if (imageCache.has(file)) return;
    try {
      const res = await fetch(`/card_picture/PNG/${file}`);
      if (!res.ok) return;
      imageCache.set(file, URL.createObjectURL(await res.blob()));
    } catch {
      // 加载失败时忽略,渲染时会回退到原始路径
    }
  }));
}

function cardInfo(id) {
  if (id === 52) return { rank: '小', suit: 'JOKER', red: false, joker: true, file: 'JOKER-B.png' };
  if (id === 53) return { rank: '大', suit: 'JOKER', red: true, joker: true, file: 'JOKER-A.png' };
  const ri = Math.floor(id / 4);
  const s = id % 4;
  return {
    rank: RANK_LABELS[ri],
    suit: SUITS[s],
    red: s === 1 || s === 3,
    joker: false,
    file: `${CARD_SUITS[s]}${RANK_LABELS[ri]}.png`,
  };
}

export function cardEl(id, { cls = '', selectable = false, selected, onToggle } = {}) {
  const info = cardInfo(id);
  const el = document.createElement('div');
  el.className = 'card ' + cls + (info.red ? ' red' : '');
  const img = document.createElement('img');
  img.alt = info.joker ? info.rank : `${info.suit}${info.rank}`;
  img.draggable = false;
  img.src = cls.includes('back') ? cardSrc('Background.png') : cardSrc(info.file);
  el.appendChild(img);
  if (selectable) {
    el.dataset.id = id;
    if (selected?.has(id)) el.classList.add('selected');
    el.onclick = () => onToggle?.(id, el);
  }
  return el;
}
