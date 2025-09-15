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
export function getMemberByName(members, name) {
  return members.find(m => m.name === name);
}

// 通过 twitter 账号获取成员
export function getMemberByTwitter(members, twitter) {
  const t = String(twitter || '').toLowerCase();
  return members.find(m => m.twitter.toLowerCase() === t);
}


