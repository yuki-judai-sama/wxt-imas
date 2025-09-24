<template>
  <div class="mainStyle" :style="mainStyle">
    <!-- 顶部导航栏 -->
    <el-menu mode="horizontal" :style="menuStyle" :ellipsis="false">
      <!-- 官方Logo -->
      <el-menu-item index="logo" @click="openMemberLink(0)">
        <img
            style="max-height: 100%; height: auto; width: auto;"
            :src="`/${IMAGE_URL}${TITLE}`"
            draggable="false"
        />
      </el-menu-item>
      <!-- 成员头像列表 -->
      <el-menu-item
          v-for="(member, index) in members"
          :key="member.name"
          :index="String(index + 1)"
          @click="openMemberLink(index + 1)"
      >
        <el-avatar :src="`/${IMAGE_URL}${HEAD_IMAGE_PREFIX}${member.name}.png`" @dragstart.prevent/>
      </el-menu-item>
      <!-- 成员动态按钮 -->
      <el-menu-item index="memberTwitterContent" style="margin-left: auto" @click="openMemberDrawer">
        <el-button type="primary" plain round>
          成员动态
          <!-- 未读推文红点提醒 -->
          <span v-if="hasUnreadTweets" class="unread-badge"></span>
        </el-button>
      </el-menu-item>
    </el-menu>
    
    <!-- 时间显示区域 - 输入框上方 -->
    <div v-if="showTimeDisplay" class="time-container">
      <div class="time-display">
        <div class="time-main">{{ currentTime.time }}</div>
        <div class="time-date">{{ currentTime.date }}</div>
      </div>
    </div>
    
    <!-- 搜索输入框 -->
    <div v-if="showSearchBox" class="search-container" :class="[`search-${searchBoxSize}`]">
      <div class="search-wrapper" :class="{ 'focused': searchFocused }">
        <div class="search-icon">
          <img
              :src="`/utils/${searchEngines[searchIconIndex].name}.png`"
              :style="{ height: '20px', width: '20px' }"
              draggable="false"
          />
    </div>
        <input
            v-model="searchValue"
            class="search-input"
            placeholder="Enter键搜索,Tab键切换搜索引擎"
            ref="searchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
        />
        <div class="search-underline"></div>
          </div>
    </div>
    <!-- 推文抽屉 -->
    <el-drawer
        v-model="memberDrawerVisible"
        direction="rtl"
        size="600px"
        :append-to-body="true"
        :header-style="{ 
          padding: '20px 24px', 
          fontSize: '20px', 
          fontWeight: '600',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }"
        :body-style="{ 
          padding: '0',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh'
        }"
    >
      <!-- 顶部分割线 -->
      <div class="drawer-divider"></div>
      
      <!-- 成员筛选器 -->
      <div class="member-filter-container">
        <div class="member-filter-grid">
          <div
              v-for="member in members"
              :key="member.name"
              @click="toggleMemberFilter(member.name)"
              class="member-filter-item"
              :class="{ 'active': selectedFilterMember === member.name }"
              :title="selectedFilterMember === member.name ? '点击显示全部推文' : `点击只显示 @${member.memberName} 的推文`"
          >
            <el-avatar
                :src="`/${IMAGE_URL}${HEAD_IMAGE_PREFIX}${member.name}.png`"
                class="member-avatar"
                :style="{ width: '38px', height: '38px' }"
                @dragstart.prevent
            />
            <div class="member-name">{{ member.memberName }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态提示 -->
      <div v-if="filteredTwitterContent.length === 0" class="empty-state">
        <div class="empty-icon">📱</div>
        <div v-if="twitterContent.length === 0" class="empty-text">暂无推文数据</div>
        <div v-else-if="selectedFilterMember" class="empty-text">@{{ selectedFilterMember }} 暂无推文</div>
        <div v-else class="empty-text">暂无推文数据</div>
      </div>
      
      <!-- 推文列表 -->
      <div class="tweet-list">
      <div
            v-for="(tweet, index) in filteredTwitterContent"
            :key="index"
            class="tweet-card"
            :class="{ 'first-tweet': index === 0 }"
      >
          <!-- 推文头部 -->
          <div class="tweet-header">
          <el-avatar
              :src="`/${IMAGE_URL}${HEAD_IMAGE_PREFIX}${getAvatarName(tweet.member)}.png`"
              draggable="false"
              @dragstart.prevent
                class="tweet-avatar"
                @click="openMemberTwitterPage(tweet.member)"
                :title="`点击访问 @${tweet.member} 的推特主页`"
          />
            <div class="tweet-user-info">
              <div class="tweet-username">
              @{{ tweet.member }}
                <span v-if="tweet.source_user && tweet.source_user !== tweet.member"
                      class="tweet-source">
                  (来自 @{{ tweet.source_user }})
                </span>
            </div>
              <div class="tweet-time">
              {{ formatDate(tweet.created_at) }}
            </div>
          </div>
        </div>

          <!-- 推文内容 -->
          <div class="tweet-content" v-html="convertLinks(tweet.text)"></div>

          <!-- 推文来源信息 -->
          <div v-if="tweet.source_user && tweet.source_user !== tweet.member"
               class="tweet-source-info">
            此推文来自 
            <strong @click="openMemberTwitterPage(tweet.source_user)">@{{ tweet.source_user }}</strong> 
            的时间线
          </div>

          <!-- 图片显示 -->
          <div v-if="tweet.media && tweet.media.length > 0" class="tweet-media">
            <div v-for="(img, i) in tweet.media" :key="i" class="tweet-image-container">
              <img
                  v-if="!imageLoadErrors[`${tweet.id}-${i}`]"
              :src="getImageUrl(img)"
                  :alt="`图片 ${i + 1}`"
                  loading="lazy"
                  class="tweet-image"
                  draggable="false"
                  @error="handleImageError(tweet.id, i)"
                  @load="handleImageLoad(tweet.id, i)"
              />
            </div>
        </div>

          <!-- 推文操作 -->
          <div class="tweet-actions">
          <a
              :href="`https://x.com/${tweet.member}/status/${tweet.id}`"
              target="_blank"
              rel="noopener noreferrer"
                class="tweet-link"
          >
            打开推文
          </a>
            <span v-if="tweet.source_user && tweet.source_user !== tweet.member"
                  class="tweet-original">
              原始推文
            </span>
          </div>
        </div>
        </div>

      <!-- 筛选状态提示 -->
      <div v-if="selectedFilterMember && filteredTwitterContent.length > 0" class="filter-status">
        <div class="filter-info">
          当前显示：@{{ getTwitterByMemberName(selectedFilterMember) || selectedFilterMember }} 的推文 (共 {{ filteredTwitterContent.length }} 条)
        </div>
        <el-button
            type="primary"
            size="small"
            @click="filterByMember(null)"
            class="clear-filter-btn"
        >
          显示全部
        </el-button>
      </div>
    </el-drawer>
    
    <!-- 工具箱按钮 -->
    <div class="toolbar-button" @click="toolbarDialogVisible = true">
      <img :src="APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'ToolList.png'" alt="工具箱" class="toolbar-icon" draggable="false" />
    </div>
    
    <!-- 自定义工具栏模态框（提取为组件） -->
    <ToolbarModal
      :visible="toolbarDialogVisible"
      :background-style="toolbarBackgroundStyle"
      :items="toolbarItems"
      @close="closeToolbar"
      @item-click="handleToolbarClick"
    />

    <!-- 企划选择弹窗 -->
    <div v-if="projectDialogVisible" class="project-modal" @click="closeProjectDialog">
      <div class="project-modal-content" :style="toolbarBackgroundStyle" @click.stop>
        <div class="project-header">
          <button class="project-back-btn" @click.stop="goBackToToolbarFromProject" title="返回工具箱">
            <img :src="APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'back.png'" alt="返回" class="back-icon" draggable="false" />
          </button>
          选择企划
        </div>
        <div class="project-grid">
          <div class="project-item" :class="{ active: currentProject==='gakumasu' }" @click="chooseProject('gakumasu')">
            <img :src="'/gakumasu/学マス-logo.png'" alt="学マス" class="project-logo" draggable="false" />
            <div class="project-name">学マス</div>
              </div>
          <div class="project-item" :class="{ active: currentProject==='shinymasu' }" @click="chooseProject('shinymasu')">
            <img :src="'/shinymasu/シャニマス-logo.png'" alt="シャニマス" class="project-logo" draggable="false" />
            <div class="project-name">シャニマス</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 书签管理模态框（组件） -->
    <BookmarkManager
      :visible="bookmarkDialogVisible"
      :background-style="bookmarkBackgroundStyle"
      @bookmarks-updated="bookmarks = $event"
      @close="closeBookmarkDialog"
      @back="goBackToToolbar"
    />
    
    
    
    <!-- Live信息模态框（组件） -->
    <LiveModal
      :visible="liveDialogVisible"
      :background-style="liveBackgroundStyle"
      @close="closeLiveDialog"
      @back="goBackToToolbarFromLive"
    />
    
    <!-- 底部横向书签栏（组件） -->
    <BottomBookmarkBar
      v-if="showBottomBookmarkBar"
      :visible="showBottomBookmarkBar"
      :bookmarks="bookmarks"
    />
    
  </div>
</template>
<!--*****************************************************************************************************************-->
<script>
import $axios from '/src/utils/$axios.js'
import { APP_CONFIG, searchEngines } from '/src/utils/appConfig.js'
import { members as gakumasuMembers, DEFAULT_MEMBERS as gakumasuDefaultMembers, IMAGE_URL as gakumasuImageUrl, HEAD_IMAGE_PREFIX as gakumasuHeadImagePrefix, TITLE as gakumasuTitle, APP_NAME as gakumasuAppName, LOGO as gakumasuLogo, OFFICE_TWITTER as gakumasuOfficeTwitter } from '/src/utils/gakumasuConfig.js'
import { members as shinymasuMembers, DEFAULT_MEMBERS as shinymasuDefaultMembers, IMAGE_URL as shinymasuImageUrl, HEAD_IMAGE_PREFIX as shinymasuHeadImagePrefix, TITLE as shinymasuTitle, APP_NAME as shinymasuAppName, LOGO as shinymasuLogo, OFFICE_TWITTER as shinymasuOfficeTwitter } from '/src/utils/shinymasuConfig.js'
import ToolbarModal from '/components/ToolbarModal.vue'
import BookmarkManager from '/components/BookmarkManager.vue'
import LiveModal from '/components/LiveModal.vue'
import BottomBookmarkBar from '/components/BottomBookmarkBar.vue'
import { 
  hexToRgb, toRgba, getMemberDisplayName,
  formatDate, convertLinks, getImageUrl, isCardImgUrl, storage, notifyNewTab
} from '/src/utils/util.js'

export default {
  name: "NewTab",
  components: { ToolbarModal, BookmarkManager, LiveModal, BottomBookmarkBar },
  data() {
    return {
      // 当前企划
      currentProject: storage.get(APP_CONFIG.STORAGE_KEYS.CURRENT_PROJECT) || APP_CONFIG.DEFAULTS.CURRENT_PROJECT,
      // 主题相关
      selectMember: storage.get(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER) || this.getDefaultMember(),
      
      // 搜索相关
      searchValue: null,
      searchIconIndex: this.getInitialSearchEngineIndex(),
      searchFocused: false,
      
      // 时间相关
      currentTime: { time: '', date: '' },
      timeInterval: null,
      
      // 推文相关
      twitterContent: [],
      memberDrawerVisible: false,
      selectedFilterMember: null,
      filteredTwitterContent: [],
      imageLoadErrors: {},
      settingsListener: null,
      customBgUrl: storage.get(APP_CONFIG.STORAGE_KEYS.CUSTOM_BG_URL) || null,
      hasUnreadTweets: false, // 是否有未读推文
      
      // 界面显示控制
      showTimeDisplay: this.parseBooleanSetting(storage.get(APP_CONFIG.STORAGE_KEYS.SHOW_TIME_DISPLAY), APP_CONFIG.DEFAULTS.SHOW_TIME_DISPLAY),
      showSearchBox: this.parseBooleanSetting(storage.get(APP_CONFIG.STORAGE_KEYS.SHOW_SEARCH_BOX), APP_CONFIG.DEFAULTS.SHOW_SEARCH_BOX),
      searchBoxSize: storage.get(APP_CONFIG.STORAGE_KEYS.SEARCH_BOX_SIZE) || APP_CONFIG.DEFAULTS.SEARCH_BOX_SIZE,
      showBottomBookmarkBar: this.parseBooleanSetting(storage.get(APP_CONFIG.STORAGE_KEYS.SHOW_BOTTOM_BOOKMARK_BAR), APP_CONFIG.DEFAULTS.SHOW_BOTTOM_BOOKMARK_BAR),
      // 樱花特效
      showSakura: this.parseBooleanSetting(storage.get(APP_CONFIG.STORAGE_KEYS.SHOW_SAKURA), APP_CONFIG.DEFAULTS.SHOW_SAKURA),
      
      // 工具栏相关
      toolbarDialogVisible: false,
      // 书签管理相关
      bookmarkDialogVisible: false,
      bookmarks: [], // 存储用户的书签
      // Live信息相关
      liveDialogVisible: false,
      // 企划选择弹窗
      projectDialogVisible: false,
      toolbarItems: [
        { id: 1, title: '书签', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'collect.png' },
        { id: 2, title: 'イベント·ライブ', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'Live.png' },
        { id: 3, title: '切换企划', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'changeProject.png' },
        { id: 4, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 5, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 6, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 7, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 8, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 9, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 10, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 11, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 12, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 13, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 14, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' },
        { id: 15, title: '機能追加予定', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'pending.png' }
      ]
    };
  },
  methods: {
    // 工具函数封装
    hexToRgb,
    toRgba,
    getMemberDisplayName,
    formatDate,
    convertLinks,
    getImageUrl,
    isCardImgUrl,
    
    // 解析布尔设置
    parseBooleanSetting(value, defaultValue) {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        return value === 'true';
      }
      return defaultValue;
    },
    // 导航栏滚轮横向滚动
    onNavWheel(e) {
      const el = this.$refs.navScroll;
      if (!el) return;
      const amount = 120;
      if (e.deltaY > 0) el.scrollLeft += amount; else el.scrollLeft -= amount;
    },
    
    // 获取初始搜索引擎索引
    getInitialSearchEngineIndex() {
      const savedEngine = storage.get(APP_CONFIG.STORAGE_KEYS.DEFAULT_SEARCH_ENGINE) || APP_CONFIG.DEFAULTS.SEARCH_ENGINE;
      const engineIndex = searchEngines.findIndex(engine => engine.name === savedEngine);
      return engineIndex !== -1 ? engineIndex : 0;
    },
    // 处理搜索框聚焦
    handleSearchFocus() {
      this.searchFocused = true;
    },
    
    // 处理搜索框失焦
    handleSearchBlur() {
      this.searchFocused = false;
    },
    
    // 更新时间显示
    updateTime() {
      const now = new Date();
      this.currentTime.time = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      this.currentTime.date = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    },
    
    // 启动时间更新
    startTimeUpdate() {
      this.updateTime();
      this.timeInterval = setInterval(this.updateTime, APP_CONFIG.TIME_UPDATE_INTERVAL);
    },
    
    // 停止时间更新
    stopTimeUpdate() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
        this.timeInterval = null;
      }
    },
    
    // 键盘事件处理
    async keyDown(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        this.searchIconIndex = (this.searchIconIndex + 1) % this.searchEngines.length;
      } else if (e.key === "Enter") {
        const value = (this.searchValue ?? '').trim();
        if (!value) {
          // 空内容时不触发搜索
          return;
        }
        await this.searchContent(value);
      }
    },
    
    // 执行搜索
    async searchContent(value) {
      const urlTemplate = this.searchEngines[this.searchIconIndex].urlTemplate;
      const encodedValue = encodeURIComponent(value);
      const searchUrl = urlTemplate.replace('%keyword%', encodedValue);
      window.open(searchUrl, '_blank');
    },
    
    // 打开成员推特链接
    openMemberLink(index) {
      if (index === 0) {
        const url = this.currentProject === 'gakumasu' ? gakumasuOfficeTwitter : shinymasuOfficeTwitter;
        if (url) window.open(url, '_blank');
      } else {
        window.open(this.members[index - 1].link, '_blank');
      }
    },
    // 获取成员头像名称（仅当前企划）
    getAvatarName(memberTwitter) {
      const target = (this.members || []).find(m => (m.twitter || '').toLowerCase() === (memberTwitter || '').toLowerCase());
      return target ? target.name : 'default';
    },
    
    // 获取推文数据（按当前企划成员过滤）
    async getTwitterContent() {
      try {
        const payload = { members: (this.members || []).map(m => (m.twitter || '').toLowerCase()).filter(Boolean) };
        const res = await $axios.post(APP_CONFIG.TWITTER_API_ENDPOINT, payload);
        this.twitterContent = Array.isArray(res.data) ? res.data : [];
        // 先按企划过滤，再清除成员筛选
        this.filterTweetsByCurrentProject();
        this.selectedFilterMember = null;
        // 检查是否有未读推文
        this.checkUnreadTweets();
      } catch (err) {
        console.error('获取推文数据失败:', err);
        this.twitterContent = [];
        this.filteredTwitterContent = [];
      }
    },
    
    
    // 基于当前企划过滤推文
    filterTweetsByCurrentProject() {
      const currentTwSet = new Set((this.members || []).map(m => (m.twitter || '').toLowerCase()));
      this.filteredTwitterContent = (this.twitterContent || []).filter(t => currentTwSet.has((t.member || '').toLowerCase()));
    },

    // 按成员筛选推文（在当前企划集合内再筛选）
    filterByMember(memberName) {
      this.selectedFilterMember = memberName;
      // 先限定为当前企划
      this.filterTweetsByCurrentProject();
      if (memberName) {
        const target = (this.members || []).find(m => m.name === memberName);
        if (target && target.twitter) {
          const tw = (target.twitter || '').toLowerCase();
          this.filteredTwitterContent = this.filteredTwitterContent.filter(t => (t.member || '').toLowerCase() === tw);
        } else {
          this.filteredTwitterContent = [];
        }
      }
    },

    // 获取成员 name 对应的 twitter（仅当前企划）
    getTwitterByMemberName(memberName) {
      const target = (this.members || []).find(m => m.name === memberName);
      return target?.twitter || '';
    },
    
    // 切换成员筛选状态
    toggleMemberFilter(memberName) {
      if (this.selectedFilterMember === memberName) {
        this.filterByMember(null);
      } else {
        this.filterByMember(memberName);
      }
    },
    
    // 处理图片加载失败
    handleImageError(tweetId, index) {
      this.imageLoadErrors[`${tweetId}-${index}`] = true;
    },
    
    // 处理图片加载成功
    handleImageLoad(tweetId, index) {
      delete this.imageLoadErrors[`${tweetId}-${index}`];
    },
    
    // 打开成员推特主页
    openMemberTwitterPage(memberTwitter) {
      window.open(`https://x.com/${memberTwitter}`, '_blank');
    },
    // 设置主题变更监听器
    setupThemeChangeListener() {
      const localStorageListener = (e) => {
        if (e.key === APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER && e.newValue) {
          this.handleThemeChange(e.newValue);
        }
      };
      window.addEventListener('storage', localStorageListener);
      this.localStorageListener = localStorageListener;
    },
    
    // 设置设置变更监听器
    setupSettingsChangeListener() {
      const localStorageListener = (e) => {
        if (e.key === APP_CONFIG.STORAGE_KEYS.DEFAULT_SEARCH_ENGINE && e.newValue) {
          this.handleSearchEngineChange(e.newValue);
        } else if (e.key === APP_CONFIG.STORAGE_KEYS.CUSTOM_BG_URL) {
          this.handleCustomBgChange(e.newValue);
        } else if (e.key === APP_CONFIG.STORAGE_KEYS.SHOW_TIME_DISPLAY) {
          this.handleTimeDisplayChange(e.newValue);
        } else if (e.key === APP_CONFIG.STORAGE_KEYS.SHOW_SEARCH_BOX) {
          this.handleSearchBoxChange(e.newValue);
        } else if (e.key === APP_CONFIG.STORAGE_KEYS.SEARCH_BOX_SIZE) {
          this.handleSearchBoxSizeChange(e.newValue);
        } else if (e.key === APP_CONFIG.STORAGE_KEYS.SHOW_BOTTOM_BOOKMARK_BAR) {
          this.handleBottomBookmarkBarChange(e.newValue);
        } else if (e.key === APP_CONFIG.STORAGE_KEYS.SHOW_SAKURA) {
          this.handleSakuraChange(e.newValue);
        }
      };
      window.addEventListener('storage', localStorageListener);
      this.settingsListener = localStorageListener;
      
      // 监听 Chrome 扩展消息
      if (chrome?.runtime) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.type === 'SETTINGS_CHANGE') {
            this.handleSettingsChange(message.data);
          }
        });
      }
      
      // 监听 Chrome storage 变化
      if (chrome?.storage) {
        chrome.storage.onChanged.addListener((changes, namespace) => {
          if (namespace === 'local') {
            if (changes.settings_change) {
              this.handleSettingsChange(changes.settings_change.newValue);
            }
          }
        });
      }
    },
    
    // 处理自定义背景图变更
    handleCustomBgChange(customBgUrl) {
      this.customBgUrl = customBgUrl && customBgUrl.trim() !== '' ? customBgUrl : null;
      this.updateCustomBackground();
    },
    
    // 更新自定义背景图（独立于默认背景图）
    updateCustomBackground() {
      const mainElement = document.querySelector('.mainStyle');
      if (mainElement) {
        if (this.customBgUrl) {
          // 添加自定义背景图作为覆盖层
          mainElement.style.setProperty('--custom-bg', `url('${this.customBgUrl}')`);
          mainElement.classList.add('has-custom-bg');
        } else {
          // 移除自定义背景图
          mainElement.style.removeProperty('--custom-bg');
          mainElement.classList.remove('has-custom-bg');
        }
      }
      // 强制更新导航栏样式
      this.$forceUpdate();
    },
    
    // 处理主题变更
    handleThemeChange(memberName) {
      const member = this.members.find(m => m.name === memberName);
      if (!member) return;
      
      this.selectMember = memberName;
      storage.set(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER, memberName);
      this.updateThemeStyles(memberName, member);
      this.$forceUpdate();
    },
    
    // 处理搜索引擎变更
    handleSearchEngineChange(searchEngineName) {
      const engineIndex = this.searchEngines.findIndex(engine => engine.name === searchEngineName);
      if (engineIndex !== -1) {
        this.searchIconIndex = engineIndex;
      }
    },
    
    // 处理时间显示变更
    handleTimeDisplayChange(showTimeDisplay) {
      this.showTimeDisplay = this.parseBooleanSetting(showTimeDisplay, APP_CONFIG.DEFAULTS.SHOW_TIME_DISPLAY);
      if (this.showTimeDisplay) {
        this.startTimeUpdate();
      } else {
        this.stopTimeUpdate();
      }
    },
    
    // 处理搜索框变更
    handleSearchBoxChange(showSearchBox) {
      this.showSearchBox = this.parseBooleanSetting(showSearchBox, APP_CONFIG.DEFAULTS.SHOW_SEARCH_BOX);
    },
    
    // 处理搜索框大小变更
    handleSearchBoxSizeChange(searchBoxSize) {
      this.searchBoxSize = searchBoxSize || APP_CONFIG.DEFAULTS.SEARCH_BOX_SIZE;
    },
    
    // 处理底部书签栏显示变更
    handleBottomBookmarkBarChange(showBottomBookmarkBar) {
      this.showBottomBookmarkBar = this.parseBooleanSetting(showBottomBookmarkBar, APP_CONFIG.DEFAULTS.SHOW_BOTTOM_BOOKMARK_BAR);
    },
    
    // 处理设置变更（统一入口）
    handleSettingsChange(data) {
      if (!data) return;
      
      if (data.defaultSearchEngine) {
        this.handleSearchEngineChange(data.defaultSearchEngine);
      }
      if (data.customBgUrl !== undefined) {
        this.handleCustomBgChange(data.customBgUrl);
      }
      if (data.showTimeDisplay !== undefined) {
        this.handleTimeDisplayChange(data.showTimeDisplay);
      }
      if (data.showSearchBox !== undefined) {
        this.handleSearchBoxChange(data.showSearchBox);
      }
      if (data.searchBoxSize) {
        this.handleSearchBoxSizeChange(data.searchBoxSize);
      }
      if (data.showBottomBookmarkBar !== undefined) {
        this.handleBottomBookmarkBarChange(data.showBottomBookmarkBar);
      }
      if (data.showSakura !== undefined) {
        this.handleSakuraChange(data.showSakura);
      }
    },
    
    // 更新主题样式
    updateThemeStyles(memberName, member) {
      // 更新背景图片
      const mainElement = document.querySelector('.mainStyle');
      if (mainElement) {
        mainElement.style.backgroundImage = `url('/idol/${memberName}.png')`;
        mainElement.style.backgroundSize = 'cover';
        mainElement.style.backgroundRepeat = 'no-repeat';
      }
      
      // 只有在没有自定义背景图时才更新导航栏颜色
      if (!this.customBgUrl) {
        const menuElement = document.querySelector('.el-menu--horizontal');
        if (menuElement) {
          const rgb = this.hexToRgb(member.color);
          menuElement.style.backgroundColor = this.toRgba(rgb, 0.4);
        }
      }
    },
    
    // 处理文档点击事件，清除导航栏聚焦状态
    handleDocumentClick(event) {
      // 检查点击的是否是导航栏内的元素
      const menuElement = document.querySelector('.el-menu--horizontal');
      if (menuElement && !menuElement.contains(event.target)) {
        // 点击在导航栏外部，清除所有菜单项的聚焦状态
        this.clearMenuFocus();
      }
    },
    
    // 清除菜单聚焦状态
    clearMenuFocus() {
      const menuItems = document.querySelectorAll('.el-menu-item');
      menuItems.forEach(item => {
        // 移除 Element Plus 的聚焦类
        item.classList.remove('is-active');
        item.classList.remove('is-focus');
        // 移除自定义的聚焦状态
        item.blur();
      });
    },
    
    // 打开成员推文抽屉
    openMemberDrawer() {
      // 打开前先按当前企划过滤一次
      this.filterTweetsByCurrentProject();
      this.memberDrawerVisible = true;
      // 记录当前第一条推文ID（标记为已读）
      this.markTweetsAsRead();
    },
    
    // 检查是否有未读推文
    checkUnreadTweets() {
      if (this.twitterContent.length === 0) {
        this.hasUnreadTweets = false;
        return;
      }
      // 获取当前企划的存储键
      const key = this.getLastReadKey();
      // 获取当前第一条推文ID
      const currentFirstTweetId = this.twitterContent[0].id;
      // 获取本地存储的最后已读推文ID（按企划）
      const lastReadTweetId = storage.get(key);
      // 如果没有存储过或第一条推文ID不同，则显示未读
      this.hasUnreadTweets = !lastReadTweetId || currentFirstTweetId !== lastReadTweetId;
    },
    
    // 标记推文为已读
    markTweetsAsRead() {
      if (this.twitterContent.length > 0) {
        const firstTweetId = this.twitterContent[0].id;
        storage.set(this.getLastReadKey(), firstTweetId);
        this.hasUnreadTweets = false;
      }
    },

    // 获取当前企划的已读存储键
    getLastReadKey() {
      return `lastReadTweetId:${this.currentProject}`;
    },
    
    // 处理工具栏点击
    handleToolbarClick(item) {
      if (item.id === 1 && item.title === '书签') {
        // 点击书签，打开书签管理页面
        this.toolbarDialogVisible = false;
        this.bookmarkDialogVisible = true;
      } else if (item.id === 2 && item.title === 'イベント·ライブ') {
        // 点击Live，打开Live信息页面
        this.toolbarDialogVisible = false;
        this.liveDialogVisible = true;
      } else if (item.id === 3 && item.title === '切换企划') {
        // 点击切换企划 -> 打开企划选择弹窗
        this.toolbarDialogVisible = false;
        this.projectDialogVisible = true;
      } else {
        // TODO: 实现其他功能
      }
    },
    
    // 关闭工具栏
    closeToolbar() {
      this.toolbarDialogVisible = false;
    },
    
    // 关闭书签管理页面
    closeBookmarkDialog() {
      this.bookmarkDialogVisible = false;
    },
    
    // 关闭Live信息页面
    closeLiveDialog() {
      this.liveDialogVisible = false;
    },
    
    // 回到工具箱
    goBackToToolbar() {
      this.bookmarkDialogVisible = false;
      this.toolbarDialogVisible = true;
    },
    
    // 回到工具箱（从Live页面）
    goBackToToolbarFromLive() {
      this.liveDialogVisible = false;
      this.toolbarDialogVisible = true;
    },
    // 回到工具箱（从企划弹窗）
    goBackToToolbarFromProject() {
      this.projectDialogVisible = false;
      this.toolbarDialogVisible = true;
    },
    
    
    
    // 键盘事件处理（工具栏专用）
    handleToolbarKeydown(e) {
      if (e.key === 'Escape') {
        if (this.toolbarDialogVisible) {
        this.closeToolbar();
        } else if (this.bookmarkDialogVisible) {
          this.closeBookmarkDialog();
        } else if (this.addBookmarkDialogVisible) {
        this.closeAddBookmarkDialog();
        } else if (this.liveDialogVisible) {
          this.closeLiveDialog();
        }
      }
    },
    // 处理Live图片加载错误
    handleLiveImageError(event) {
      event.target.src = APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL+'Live.png';
    },
    
    // 获取Live标签的CSS类
    getLiveTagClass(tag) {
      if (tag === '受付は終了しました') {
        return 'live-tag-ended';
      }
      // 其他所有情况都是蓝色
      return 'live-tag-active';
    },

    // 处理樱花特效显示变更
    handleSakuraChange(showSakura) {
      this.showSakura = this.parseBooleanSetting(showSakura, APP_CONFIG.DEFAULTS.SHOW_SAKURA);
      if (this.showSakura) {
        this.enableSakura();
                  } else {
        this.disableSakura();
      }
    },

    enableSakura() {
      try {
        // 先移除隐藏样式，确保可见
        const hideStyle = document.getElementById('sakura-hide-style');
        if (hideStyle) hideStyle.parentNode.removeChild(hideStyle);
        const existing = document.getElementById('canvas_sakura');
        if (existing) return; // 已存在
        const scriptId = 'sakura-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          script.src = '/js/flower.js';
          script.onload = () => {
            if (typeof window.startSakura === 'function') {
              window.startSakura();
            }
          };
          document.body.appendChild(script);
        } else if (typeof window.startSakura === 'function') {
          window.startSakura();
        }
      } catch (e) { console.error('启用樱花失败', e); }
    },

    disableSakura() {
      try {
        if (!document.getElementById('sakura-hide-style')) {
          const style = document.createElement('style');
          style.id = 'sakura-hide-style';
          style.textContent = '#canvas_sakura{display:none!important;}';
          document.head.appendChild(style);
        }
      } catch (e) { console.error('关闭樱花失败', e); }
    },

    // 获取当前企划的默认成员
    getDefaultMember() {
      return this.currentProject === 'gakumasu' ? gakumasuDefaultMembers : shinymasuDefaultMembers;
    },

    // 切换企划
    switchProject() {
      const newProject = this.currentProject === 'gakumasu' ? 'shinymasu' : 'gakumasu';
      this.currentProject = newProject;
      storage.set(APP_CONFIG.STORAGE_KEYS.CURRENT_PROJECT, newProject);
      
      // 更新成员和默认成员
      const newDefaultMember = this.getDefaultMember();
      this.selectMember = newDefaultMember;
      storage.set(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER, newDefaultMember);
      
      // 更新主题样式
      this.updateThemeStyles(newDefaultMember, this.members.find(m => m.name === newDefaultMember));
      
      // 强制更新组件
      this.$forceUpdate();
      // 切换完成后，重新拉取该企划推文
      this.getTwitterContent();
    },

    // 关闭企划弹窗
    closeProjectDialog() {
      this.projectDialogVisible = false;
    },
    // 选择企划
    chooseProject(project) {
      if (project === this.currentProject) {
        this.closeProjectDialog();
        return; // 已是当前企划，不处理
      }
      this.currentProject = project;
      storage.set(APP_CONFIG.STORAGE_KEYS.CURRENT_PROJECT, project);
      const newDefaultMember = this.getDefaultMember();
      this.selectMember = newDefaultMember;
      storage.set(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER, newDefaultMember);
      this.updateThemeStyles(newDefaultMember, this.members.find(m => m.name === newDefaultMember));
      this.closeProjectDialog();
      this.$forceUpdate();
      // 切换完成后，重新拉取该企划推文
      this.getTwitterContent();
    }
  },
  mounted() {
    // 确保 selectMember 正确设置
    if (!this.members.find(m => m.name === this.selectMember)) {
      this.selectMember = this.getDefaultMember();
      storage.set(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER, this.selectMember);
    }
    
    // 监听键盘事件
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keydown", this.handleToolbarKeydown);
    // 监听点击事件，清除导航栏聚焦状态
    document.addEventListener("click", this.handleDocumentClick);
    // 获取推文数据
    this.getTwitterContent();
    
    // 监听主题变更
    this.setupThemeChangeListener();
    // 监听设置变更
    this.setupSettingsChangeListener();
    // 初始化自定义背景图
    this.updateCustomBackground();
    // 根据设置启动时间更新
    if (this.showTimeDisplay) {
    this.startTimeUpdate();
    }
    // 根据设置启用/禁用樱花
    if (this.showSakura) {
      this.enableSakura();
    } else {
      this.disableSakura();
    }
    
  },
  
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keydown", this.handleToolbarKeydown);
    document.removeEventListener("click", this.handleDocumentClick);
    if (this.localStorageListener) {
      window.removeEventListener('storage', this.localStorageListener);
    }
    if (this.settingsListener) {
      window.removeEventListener('storage', this.settingsListener);
    }
    // 清理防抖定时器
    if (this.urlInputTimer) {
      clearTimeout(this.urlInputTimer);
    }
    // 停止时间更新
    this.stopTimeUpdate();
    // 关闭樱花
    this.disableSakura();
  },
  computed: {
    IMAGE_URL() {
      return this.currentProject === 'gakumasu' ? gakumasuImageUrl : shinymasuImageUrl;
    },
    HEAD_IMAGE_PREFIX() {
      return this.currentProject === 'gakumasu' ? gakumasuHeadImagePrefix : shinymasuHeadImagePrefix;
    },
    TITLE() {
      return this.currentProject === 'gakumasu' ? gakumasuTitle : shinymasuTitle;
    },
    // 暴露 APP_CONFIG 到模板
    APP_CONFIG() {
      return APP_CONFIG;
    },
    // 成员列表
    members() {
      return this.currentProject === 'gakumasu' ? gakumasuMembers : shinymasuMembers;
    },
    
    // 搜索引擎列表
    searchEngines() {
      return searchEngines;
    },
    
    // 当前成员索引
    selectMemberThemeIndex() {
      return this.members.findIndex(m => m.name === this.selectMember);
    },
    
    // 主容器样式
    mainStyle() {
      if (!this.members || this.members.length === 0) {
        return {
          backgroundImage: 'none',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          height: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
        };
      }
      
      // 如果当前选择的成员不在列表中，使用默认成员
      let memberIndex = this.selectMemberThemeIndex;
      if (memberIndex === -1) {
        const defaultMember = this.getDefaultMember();
        memberIndex = this.members.findIndex(m => m.name === defaultMember);
        if (memberIndex === -1) {
          memberIndex = 0; // 使用第一个成员作为回退
        }
      }
      
      const bgImage = `/${this.IMAGE_URL}${this.members[memberIndex].name}.png`;
      return {
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
      };
    },
    
    // 导航栏样式
    menuStyle() {
      // 如果有自定义背景图，使用增强的玻璃透视效果
      if (this.customBgUrl) {
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(25px) saturate(1.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        };
      }
      
      // 安全检查：确保成员数据存在
      if (!this.members || this.members.length === 0 || this.selectMemberThemeIndex === -1) {
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
        };
      }
      
      // 默认主题背景图时，使用成员主题色
      const member = this.members[this.selectMemberThemeIndex];
      if (!member || !member.color) {
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
        };
      }
      
      const hex = member.color;
      const { r, g, b } = this.hexToRgb(hex);
      // 根据颜色亮度调整透明度，深色用更高透明度，浅色用更低透明度
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      const alpha = brightness > 128 ? 0.15 : 0.25;
      return {
        background: `linear-gradient(135deg, 
          rgba(${r}, ${g}, ${b}, ${alpha}), 
          rgba(${r}, ${g}, ${b}, ${alpha * 0.6}),
          rgba(0, 0, 0, 0.1)
        )`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid rgba(${r}, ${g}, ${b}, 0.2)`,
        boxShadow: `0 2px 20px rgba(${r}, ${g}, ${b}, 0.1)`
      };
    },
    
    // 工具栏背景样式
    toolbarBackgroundStyle() {
      if (!this.members || this.members.length === 0 || this.selectMemberThemeIndex === -1) {
        return {};
      }
      const member = this.members[this.selectMemberThemeIndex];
      const bgImage = `/${this.IMAGE_URL}${member.name}.png`;
      
      return {
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    },
    
    // 书签背景样式
    bookmarkBackgroundStyle() {
      if (!this.members || this.members.length === 0 || this.selectMemberThemeIndex === -1) {
        return {};
      }
      const member = this.members[this.selectMemberThemeIndex];
      const bgImage = `/${this.IMAGE_URL}${member.name}.png`;
      
      return {
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    },
    
    // Live背景样式
    liveBackgroundStyle() {
      if (!this.members || this.members.length === 0 || this.selectMemberThemeIndex === -1) {
        return {};
      }
      const member = this.members[this.selectMemberThemeIndex];
      const bgImage = `/${this.IMAGE_URL}${member.name}.png`;
      
      return {
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    },
    
  }
};
</script>
<!--*****************************************************************************************************************-->
<style scoped>

/* 恢复为默认导航样式，无额外自定义容器 */

::v-deep(.el-menu--horizontal) {
  border-bottom: none !important;
  box-shadow: none !important;
  padding: 0 20px;
  height: 70px;
  transition: all 0.3s ease;
  /* 容器交给 .nav-scroll 控制滚动，不再显示菜单本身滚动条 */
}

::v-deep(.el-menu-item) {
  height: 70px;
  line-height: 70px;
  padding: 0 15px;
  margin: 0 5px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: visible;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto; /* 防止菜单项换行，配合横向滚动 */
}

::v-deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  transform: translateY(-1px);
}

::v-deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.12) !important;
  transform: translateY(-1px);
}

/* 自定义背景图时的导航栏悬停效果 */
.mainStyle.has-custom-bg ::v-deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.mainStyle.has-custom-bg ::v-deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transform: translateY(-1px);
}

::v-deep(.el-menu-item img) {
  max-height: 45px;
  width: auto;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transform-origin: center;
  position: relative;
  z-index: 1;
}

::v-deep(.el-menu-item:hover img) {
  transform: scale(1.05);
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
  z-index: 2;
}

/* 自定义背景图时的图片悬停效果 - 确保不影响布局 */
.mainStyle.has-custom-bg ::v-deep(.el-menu-item img) {
  transform-origin: center;
  position: relative;
  z-index: 1;
}

.mainStyle.has-custom-bg ::v-deep(.el-menu-item:hover img) {
  transform: scale(1.05);
  z-index: 2;
}

::v-deep(.el-avatar) {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform-origin: center;
  position: relative;
  z-index: 1;
}

::v-deep(.el-menu-item:hover .el-avatar) {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

/* 自定义背景图时的头像悬停效果 - 确保不影响布局 */
.mainStyle.has-custom-bg ::v-deep(.el-avatar) {
  transform-origin: center;
  position: relative;
  z-index: 1;
}

.mainStyle.has-custom-bg ::v-deep(.el-menu-item:hover .el-avatar) {
  transform: scale(1.05);
  z-index: 2;
}

::v-deep(.el-button) {
  border-radius: 16px;
  padding: 8px 18px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 2px solid rgba(255, 255, 255, 0.4);
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.15), 
    rgba(255, 255, 255, 0.08)
  );
  color: #fff;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.5),
    0 0 6px rgba(0, 0, 0, 0.3);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* 自定义背景图时的按钮样式 */
.mainStyle.has-custom-bg ::v-deep(.el-button) {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px);
  color: #1f2937;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

::v-deep(.el-button:hover) {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25), 
    rgba(255, 255, 255, 0.15)
  );
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(0, 0, 0, 0.4);
}

/* 自定义背景图时的按钮悬停效果 */
.mainStyle.has-custom-bg ::v-deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-color: rgba(255, 255, 255, 0.35);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
}

/* 微妙的悬停效果 */
::v-deep(.el-menu-item:not(:hover)) {
  opacity: 0.9;
}

::v-deep(.el-menu-item:hover) {
  opacity: 1;
}

/* 成员动态按钮特殊效果 - 在浅色背景下更突出 */
::v-deep(.el-menu-item:last-child .el-button) {
  position: relative;
}

/* 添加微妙的发光效果 */
@keyframes buttonGlow {
  0%, 100% {
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 0 0 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 0 0 2px rgba(255, 255, 255, 0.1);
  }
}

::v-deep(.el-menu-item:last-child .el-button:not(:hover)) {
  animation: buttonGlow 3s ease-in-out infinite;
}

/* 未读推文红点提醒样式 */
.unread-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: visible;
}

/* 确保按钮有相对定位以支持红点 */
::v-deep(.el-menu-item:last-child .el-button) {
  position: relative;
  overflow: visible;
}

/* 确保菜单项不会截取红点 */
::v-deep(.el-menu-item:last-child) {
  overflow: visible;
}

/* 顶部分割线 */
.drawer-divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(0, 0, 0, 0.1), 
    transparent
  );
  margin: 0;
}

/* 成员动态抽屉样式 */
.member-filter-container {
  padding: 8px 24px 16px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}


.member-filter-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.member-filter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid transparent;
}

.member-filter-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.member-filter-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.member-avatar {
  margin-bottom: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.member-name {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  margin-top: 4px;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* 推文列表样式 */
.tweet-list {
  padding: 0 8px 20px;
}

.tweet-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(10px);
}

.tweet-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tweet-card.first-tweet {
  margin-top: 20px;
}

.tweet-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.tweet-avatar {
  margin-right: 12px;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.tweet-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tweet-user-info {
  flex: 1;
}

.tweet-username {
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 2px;
}

.tweet-source {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
  font-weight: 400;
}

.tweet-time {
  font-size: 12px;
  color: #999;
}

.tweet-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 10px;
  white-space: pre-line;
}

.tweet-source-info {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.tweet-source-info i {
  margin-right: 4px;
  color: #667eea;
}

.tweet-source-info strong {
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
}

.tweet-media {
  margin-bottom: 10px;
}

.tweet-image-container {
  margin-bottom: 8px;
}

.tweet-image {
  width: 100%;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tweet-image:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.tweet-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.tweet-link {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tweet-link:hover {
  color: #5a6fd8;
  transform: translateX(2px);
}


.tweet-original {
  font-size: 12px;
  color: #999;
}

/* 筛选状态样式 */
.filter-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.filter-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}


.clear-filter-btn {
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
}


/* 时间显示容器 - 输入框上方 */
.time-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.time-display {
  text-align: center;
  color: #fff;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.6),
    0 0 8px rgba(0, 0, 0, 0.3);
}

.time-main {
  font-size: 28px;
  font-weight: 300;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  letter-spacing: 1px;
  margin-bottom: 4px;
  opacity: 0.95;
}

.time-date {
  font-size: 12px;
  font-weight: 400;
  opacity: 0.8;
  letter-spacing: 0.5px;
}

/* 搜索容器样式 */
.search-container {
  position: absolute;
  top: 150px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}

/* 搜索框大小样式 */
.search-container.search-large .search-wrapper {
  height: 55px;
  max-width: 500px;
}

.search-container.search-medium .search-wrapper {
  height: 45px;
  max-width: 400px;
}

.search-container.search-small .search-wrapper {
  height: 35px;
  max-width: 300px;
}

/* 搜索框大小对应的图标和字体 */
.search-container.search-large .search-icon img {
  height: 20px;
  width: 20px;
}

.search-container.search-medium .search-icon img {
  height: 16px;
  width: 16px;
}

.search-container.search-small .search-icon img {
  height: 14px;
  width: 14px;
}

.search-container.search-large .search-input {
  font-size: 16px;
}

.search-container.search-medium .search-input {
  font-size: 14px;
}

.search-container.search-small .search-input {
  font-size: 12px;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 55px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.25), 
    rgba(255, 255, 255, 0.1),
    rgba(0, 0, 0, 0.1)
  );
  border-radius: 30px;
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  padding: 0 25px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    0 0 0 1px rgba(0, 0, 0, 0.1);
}

.search-wrapper:hover {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.35), 
    rgba(255, 255, 255, 0.2),
    rgba(0, 0, 0, 0.05)
  );
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 0 1px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px) scale(1.02);
}

.search-wrapper.focused {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.4), 
    rgba(255, 255, 255, 0.25),
    rgba(0, 0, 0, 0.1)
  ) !important;
  border-color: rgba(255, 255, 255, 0.7) !important;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 0 0 4px rgba(255, 255, 255, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.2) !important;
  transform: translateY(-4px) scale(1.05) !important;
}

.search-icon {
  margin-right: 15px;
  opacity: 0.7;
  transition: all 0.3s ease;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
}

.search-wrapper:hover .search-icon {
  opacity: 0.8;
  transform: scale(1.05);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.search-wrapper.focused .search-icon {
  opacity: 0.9;
  transform: scale(1.1);
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.5));
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  height: 100%;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 0 6px rgba(0, 0, 0, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.6),
    0 0 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.search-wrapper.focused .search-input::placeholder {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 0 5px rgba(0, 0, 0, 0.3);
}

.search-underline {
  position: absolute;
  bottom: 8px;
  left: 50%;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(102, 126, 234, 0.8), 
    rgba(118, 75, 162, 0.8),
    rgba(255, 107, 107, 0.8)
  );
  border-radius: 2px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.search-wrapper.focused .search-underline {
  width: 85%;
  box-shadow: 0 0 15px rgba(102, 126, 234, 0.5);
}

/* 小尺寸搜索框的横条特效调整 */
.search-container.search-small .search-underline {
  bottom: 6px;
  height: 2px;
}

.search-container.search-small .search-wrapper.focused .search-underline {
  width: 75%;
}

/* 中等尺寸搜索框的横条特效调整 */
.search-container.search-medium .search-underline {
  bottom: 7px;
  height: 2.5px;
}

.search-container.search-medium .search-wrapper.focused .search-underline {
  width: 80%;
}

/* 添加微妙的呼吸动画 */
@keyframes gentlePulse {
  0%, 100% {
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 
      0 6px 25px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
}

.search-wrapper:not(.focused):not(:hover) {
  animation: gentlePulse 4s ease-in-out infinite;
}

::v-deep(.el-avatar) {    /*全局avatar样式*/
  background-color: transparent !important;
}

::v-deep(.el-image) {    /*禁用el-image拖拽*/
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

::v-deep(.el-image img) {    /*禁用el-image内部img拖拽*/
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

/* 全局禁用所有图片拖拽 */
img {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}
</style>

<style>
html, body, #app {  /*清除自带外边框*/
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

/* 自定义背景图覆盖层 - 完全独立于默认背景图 */
.mainStyle.has-custom-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--custom-bg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  pointer-events: none;
}

/* 确保默认背景图在自定义背景图之上 */
.mainStyle {
  position: relative;
}

.mainStyle.has-custom-bg {
  background-image: none !important;
}

/* 工具箱按钮样式 */
.toolbar-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.toolbar-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 1);
}

.toolbar-icon {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 企划选择弹窗样式（与其它模态一致的毛玻璃风格，尺寸更大） */
.project-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(12px) saturate(1.5); -webkit-backdrop-filter: blur(12px) saturate(1.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.project-modal-content { width: 75vw; height: 70vh; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); overflow: hidden; display: flex; flex-direction: column; position: relative; }
.project-modal-content::before { content: ''; position: absolute; inset: 0; background: rgba(0, 0, 0, 0.35); z-index: 1; border-radius: 16px; pointer-events: none; }
.project-header { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px) saturate(1.8); -webkit-backdrop-filter: blur(20px) saturate(1.8); border-bottom: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); padding: 20px 24px; display: flex; align-items: center; justify-content: center; border-radius: 16px 16px 0 0; position: relative; z-index: 2; color: #fff; font-weight: 600; }
.project-back-btn { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; cursor: pointer; transition: all 0.3s ease; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; z-index: 3; }
.project-back-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-50%) scale(1.08); }
.project-back-btn .back-icon { width: 20px; height: 20px; filter: brightness(0) invert(1); }
.project-grid { flex: 1; position: relative; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 24px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px) saturate(1.5); -webkit-backdrop-filter: blur(15px) saturate(1.5); }
.project-item { background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 12px; padding: 30px 20px; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
.project-item:hover { transform: translateY(-3px) scale(1.02); background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(22px) saturate(1.8); -webkit-backdrop-filter: blur(22px) saturate(1.8); border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5); }
.project-item.active { box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35) inset; }
.project-logo { width: 260px; height: auto; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25)); }
.project-name { margin-top: 12px; color: #fff; font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.45); font-size: 16px; }

</style>
