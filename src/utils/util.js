import { members } from '/src/utils/gakumasuConfig.js';

// 通用 UI/数据工具函数

// 将十六进制颜色转换为 { r, g, b }
export function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

// 生成 rgba 字符串
export function toRgba(rgb, alpha) {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// 通过显示名获取成员
export function getMemberByName(name) {
  return members.find(m => m.name === name);
}

// 通过 twitter 账号获取成员
export function getMemberByTwitter(twitter) {
  const t = String(twitter || '').toLowerCase();
  return members.find(m => m.twitter.toLowerCase() === t);
}

// 获取成员显示名称
export function getMemberDisplayName(memberName) {
  const member = getMemberByName(memberName);
  return member ? member.memberName : memberName;
}

// 格式化日期时间
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 处理推文文本链接和标签
export function convertLinks(text) {
  if (!text) return '';

  // 移除引用推文链接
  const quoteLinkRegex = /(?:(?:https?:\/\/)?)(?:x\.com|twitter\.com|(?:[a-zA-Z0-9-]+\.)*nitter[^\s\/]*|(?:[a-zA-Z0-9-]+\.)*kuuro\.net)\/[A-Za-z0-9_]+\/status\/\d+[^\s]*/gi;
  const withoutQuoteLinks = text.replace(quoteLinkRegex, '');

  // 转义 HTML 并处理换行
  let processedText = withoutQuoteLinks
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>')
      .trim();
  
  // 高亮普通链接
  processedText = processedText.replace(/(https?:\/\/[a-zA-Z0-9\-._~:\/?#[\]@!$&'()*+,;=%]+)/g, (match, url) => {
    return `<a href="${url}" target="_blank" style="color: #409EFF;">${url}</a>`;
  });
  
  // 高亮话题标签
  processedText = processedText.replace(/#([a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)(?![^<]*<\/a>)/g, (match, hashtag) => {
    return `<a href="https://x.com/search?q=%23${hashtag}" target="_blank" style="color: #409EFF;">#${hashtag}</a>`;
  });
  
  return processedText;
}

// 获取图片URL（处理Nitter图片映射）
export function getImageUrl(url) {
  if (!url) return url;
  try {
    // 只处理 nitter 的 /pic/ 链接
    if (/^https?:\/\/[^\s]*nitter[^\s]*\/pic\//.test(url) || /^https?:\/\/nt\.kuuro\.net\/pic\//.test(url)) {
      const u = url.replace(/^https?:\/\/[^\s]*nitter[^\s]*/i, 'https://nt.kuuro.net')
                   .replace(/^https?:\/\/nt\.kuuro\.net/i, 'https://nt.kuuro.net');
      // 解码 path 后做规则转换
      const path = decodeURIComponent(u.split('/pic/')[1] || '');
      // 几种常见前缀
      // media/<filename> → pbs.twimg.com/media/<filename>
      if (path.startsWith('media/')) {
        return `https://pbs.twimg.com/${path}`;
      }
      // card_img/<id>/<rest>?format=jpg&name=800x419 → pbs.twimg.com/card_img/<id>/<rest>?format=jpg&name=orig
      if (path.startsWith('card_img/')) {
        const [p, query = ''] = path.split('?');
        const sp = new URLSearchParams(query);
        if (sp.has('name')) sp.set('name', 'orig');
        return `https://pbs.twimg.com/${p}?${sp.toString()}`;
      }
      // amplify_video_thumb/... → pbs.twimg.com/amplify_video_thumb/...
      if (path.startsWith('amplify_video_thumb/')) {
        return `https://pbs.twimg.com/${path}`;
      }
      // img/<...> → pbs 也可以直连
      if (path.startsWith('img/')) {
        return `https://pbs.twimg.com/${path}`;
      }
    }
  } catch (e) {
    // ignore
  }
  return url;
}

// 判断是否为card_img格式的图片URL
export function isCardImgUrl(url) {
  return url && url.includes('nitter.kuuro.net/pic/card_img');
}

// 存储工具函数
export const storage = {
  get(key) {
    return localStorage.getItem(key);
  },
  
  set(key, value) {
    localStorage.setItem(key, value);
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// 通知工具函数
export function notifyNewTab(type, data) {
  // Chrome storage 通知
  if (chrome?.storage) {
    try {
      chrome.storage.local.set({ 
        [type.toLowerCase()]: { ...data, timestamp: Date.now() }
      });
    } catch (error) {
      console.debug('Chrome storage 更新失败:', error);
    }
  }
  
  // Chrome tabs 消息通知
  if (chrome?.tabs) {
    try {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id && (tab.url?.includes('newtab.html') || tab.url?.includes('entrypoints/newtab/index.html'))) {
            chrome.tabs.sendMessage(tab.id, { type, ...data });
          }
        });
      });
    } catch (error) {
      console.debug('发送消息失败:', error);
    }
  }
}


