import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    background: {
      service_worker: 'background.js'
    },
    // 覆盖新标签页地址
    chrome_url_overrides: {
      newtab: 'entrypoints/newtab/index.html',
    },
    // 注册自定义后台设置页面（options）
    options_ui: {
      page: 'entrypoints/options/index.html',
      open_in_tab: true,
    }
  }
});
