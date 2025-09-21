// 应用配置常量
export const APP_CONFIG = {
  // 应用信息
  APP_NAME: '学マス主题浏览器扩展插件',
  VERSION: '1.0.0',
  CONTACT_EMAIL: 'yukijudai.sky@qq.com',
  
  // API配置
  API_BASE_URL: 'http://127.0.0.1:8115',
  TWITTER_API_ENDPOINT: '/TwitterController/getTwitterContent',
  
  // 存储键名
  STORAGE_KEYS: {
    DEFAULT_MEMBER: 'defaultMember',
    DEFAULT_SEARCH_ENGINE: 'defaultSearchEngine',
    CUSTOM_BG_URL: 'customBgUrl',
    SHOW_TIME_DISPLAY: 'showTimeDisplay',
    SHOW_SEARCH_BOX: 'showSearchBox',
    SEARCH_BOX_SIZE: 'searchBoxSize'
  },
  
  // 文件上传限制
  UPLOAD: {
    MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
    COMPRESS_THRESHOLD: 3 * 1024 * 1024, // 3MB
    COMPRESS_QUALITY: 0.8,
    MAX_IMAGE_WIDTH: 1920
  },
  
  // 时间更新间隔
  TIME_UPDATE_INTERVAL: 1000,
  
  // 默认值
  DEFAULTS: {
    MEMBER: 'TsukimuraTemari',
    SEARCH_ENGINE: 'google',
    SHOW_TIME_DISPLAY: true,
    SHOW_SEARCH_BOX: true,
    SEARCH_BOX_SIZE: 'small'
  }
};

// 成员配置
export const members = [
  { memberName: '花海 咲季', name: 'HanamiSaki', color: 'ff4f63', link: 'https://x.com/aoi___nagatsuki', twitter: 'aoi___nagatsuki' },
  { memberName: '月村 手毬', name: 'TsukimuraTemari', color: '26b4eb', link: 'https://x.com/ojikanao0809', twitter: 'ojikanao0809' },
  { memberName: '藤田 ことね', name: 'FujitaKotone', color: 'ffd200', link: 'https://x.com/Iida_Hikaru_828', twitter: 'Iida_Hikaru_828' },
  { memberName: '有村 麻央', name: 'ArimuraMao', color: 'c45dc8', link: 'https://x.com/tsumugi_nanase', twitter: 'tsumugi_nanase' },
  { memberName: '葛城 リーリヤ', name: 'KatsuragiLilja', color: 'd2e3e4', link: 'https://x.com/kana_hanaiwa', twitter: 'kana_hanaiwa' },
  { memberName: '紫雲 清夏', name: 'ShiunSumika', color: '92de5a', link: 'https://x.com/miya_minato1216', twitter: 'miya_minato1216' },
  { memberName: '倉本 千奈', name: 'KuramotoChina', color: 'fe8a22', link: 'https://x.com/mao_ito05', twitter: 'mao_ito05' },
  { memberName: '篠澤 広', name: 'ShinosawaHiro', color: '00bed8', link: 'https://x.com/reina_kawamura6', twitter: 'reina_kawamura6' },
  { memberName: '花海 佑芽', name: 'HanamiUme', color: 'f74b2a', link: 'https://x.com/Matsuda_Ayane7', twitter: 'Matsuda_Ayane7' },
  { memberName: '十王 星南', name: 'JuoSena', color: 'f7ad54', link: 'https://x.com/hitaka_mashiro', twitter: 'hitaka_mashiro' },
  { memberName: '姫崎 莉波', name: 'HimesakiRinami', color: 'fd7ec2', link: 'https://x.com/yuri_usui0515', twitter: 'yuri_usui0515' },
  { memberName: '秦谷 美鈴', name: 'HatayaMisuzu', color: 'A0B6DC', link: 'https://x.com/Harusaki_non', twitter: 'Harusaki_non' },
  { memberName: '雨夜 燕', name: 'AmayaTsubame', color: 'a396f3', link: 'https://x.com/yukari_amane_', twitter: 'yukari_amane_' },
];

// 搜索引擎配置
export const searchEngines = [
  { name: 'google', displayName: 'Google', urlTemplate: 'https://www.google.com/search?q=%keyword%' },
  { name: 'baidu', displayName: '百度', urlTemplate: 'https://www.baidu.com/s?wd=%keyword%' },
  { name: 'bilibili', displayName: '哔哩哔哩', urlTemplate: 'https://search.bilibili.com/all?keyword=%keyword%' },
  { name: 'biying', displayName: '必应', urlTemplate: 'https://www.bing.com/search?q=%keyword%' }
];

// 搜索框大小配置
export const searchBoxSizes = [
  { name: 'large', displayName: '大', description: '大号搜索框' },
  { name: 'medium', displayName: '中', description: '中号搜索框' },
  { name: 'small', displayName: '小', description: '小号搜索框' }
];
