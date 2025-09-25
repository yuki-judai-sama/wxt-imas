/*************************************应用配置常量******************************************/
export const APP_CONFIG = {
  // 应用信息
  VERSION: '1.1.0',
  CONTACT_EMAIL: 'yukijudai.sky@qq.com',
  // API配置
  API_BASE_URL: 'http://103.109.23.45:8115',
  TWITTER_API_ENDPOINT: '/TwitterController/getTwitterContent',
  ASOBI_TICKET_BOOTS: '/AsobiTicketController/getLiveInfoList',
  VERSION_UPDATE_ENDPOINT: '/VersionUpdateController/getVersionUpdateInfo',
  // 存储键名
  STORAGE_KEYS: {
    DEFAULT_MEMBER: 'defaultMember',
    DEFAULT_SEARCH_ENGINE: 'defaultSearchEngine',
    CUSTOM_BG_URL: 'customBgUrl',
    LOCAL_GALLERY_BG_URL: 'localGalleryBgUrl',
    LOCAL_GALLERY_BG_FILE_INFO: 'localGalleryBgFileInfo',
    SHOW_TIME_DISPLAY: 'showTimeDisplay',
    SHOW_SEARCH_BOX: 'showSearchBox',
    SEARCH_BOX_SIZE: 'searchBoxSize',
    SHOW_BOTTOM_BOOKMARK_BAR: 'showBottomBookmarkBar',
    SHOW_TOOLBAR_BUTTON: 'showToolbarButton',
    SHOW_SAKURA: 'showSakura',
    CURRENT_PROJECT: 'currentProject'
  },
  // 文件上传限制
  UPLOAD: {
    MAX_FILE_SIZE: 4 * 1024 * 1024, // 4MB
    COMPRESS_THRESHOLD: 3 * 1024 * 1024, // 3MB
    COMPRESS_QUALITY: 0.8,
    MAX_IMAGE_WIDTH: 1920
  },
  // 时间更新间隔(用于时间计时)
  TIME_UPDATE_INTERVAL: 1000,
  // 默认值
  DEFAULTS: {
    UTILS_IMAGE_URL:'/utils/',
    SEARCH_ENGINE: 'google',
    SHOW_TIME_DISPLAY: true,
    SHOW_SEARCH_BOX: true,
    SEARCH_BOX_SIZE: 'small',
    SHOW_BOTTOM_BOOKMARK_BAR: true,
    SHOW_TOOLBAR_BUTTON: true,
    SHOW_SAKURA: true,
    CURRENT_PROJECT: 'gakumasu'
  }
};
/*************************************搜索引擎配置******************************************/
export const searchEngines = [
  { name: 'google', displayName: 'Google', urlTemplate: 'https://www.google.com/search?q=%keyword%' },
  { name: 'baidu', displayName: '百度', urlTemplate: 'https://www.baidu.com/s?wd=%keyword%' },
  { name: 'bilibili', displayName: '哔哩哔哩', urlTemplate: 'https://search.bilibili.com/all?keyword=%keyword%' },
  { name: 'biying', displayName: '必应', urlTemplate: 'https://www.bing.com/search?q=%keyword%' }
];
/*************************************搜索框大小配置******************************************/
export const searchBoxSizes = [
  { name: 'small', displayName: '小', description: '小型搜索框' },
  { name: 'medium', displayName: '中', description: '中型搜索框' },
  { name: 'large', displayName: '大', description: '大型搜索框' }
];