<template>
  <div class="mainStyle" :style="mainStyle">
    <!-- 顶部导航栏 -->
    <el-menu mode="horizontal" :style="menuStyle" :ellipsis="false">
      <!-- 官方Logo -->
      <el-menu-item index="logo" @click="openMemberLink(0)">
        <img
            style="max-height: 100%; height: auto; width: auto;"
            src="/icon/学マス-title.png"
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
        <el-avatar :src="`/idol/headImg/${member.name}.png`" @dragstart.prevent/>
      </el-menu-item>
      <!-- 成员动态按钮 -->
      <el-menu-item index="memberTwitterContent" style="margin-left: auto" @click="memberDrawerVisible=true">
        <el-button type="primary" plain round>成员动态</el-button>
      </el-menu-item>
    </el-menu>
    
    <!-- 时间显示区域 - 输入框上方 -->
    <div class="time-container">
      <div class="time-display">
        <div class="time-main">{{ currentTime.time }}</div>
        <div class="time-date">{{ currentTime.date }}</div>
      </div>
    </div>
    
    <!-- 搜索输入框 -->
    <div class="search-container">
      <div class="search-wrapper" :class="{ 'focused': searchFocused }">
        <div class="search-icon">
          <img
              :src="`/icon/${searchEngines[searchIconIndex].name}.png`"
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
                :src="`/idol/headImg/${member.name}.png`"
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
              :src="`/idol/headImg/${getAvatarName(tweet.member)}.png`"
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
            <i class="el-icon-location"></i>
            此推文来自 
            <strong @click="openMemberTwitterPage(tweet.source_user)">@{{ tweet.source_user }}</strong> 
            的时间线
          </div>

          <!-- 图片显示 -->
          <div v-if="tweet.media && tweet.media.length > 0" class="tweet-media">
            <div v-for="(img, i) in tweet.media" :key="i" class="tweet-image-container">
              <img
                  v-if="isCardImgUrl(img) && !imageLoadErrors[`${tweet.id}-${i}`]"
                  :src="getImageUrl(img)"
                  :alt="`图片 ${i + 1}`"
                  loading="lazy"
                  class="tweet-image"
                  draggable="false"
                  @error="handleImageError(tweet.id, i)"
                  @load="handleImageLoad(tweet.id, i)"
              />
              <img
                  v-else-if="!isCardImgUrl(img) && !imageLoadErrors[`${tweet.id}-${i}`]"
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
              <i class="el-icon-link"></i>
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
          <i class="el-icon-filter"></i>
          当前显示：@{{ getMemberByName(selectedFilterMember)?.twitter || selectedFilterMember }} 的推文 (共 {{ filteredTwitterContent.length }} 条)
        </div>
        <el-button
            type="primary"
            size="small"
            @click="filterByMember(null)"
            class="clear-filter-btn"
        >
          <i class="el-icon-refresh"></i>
          显示全部
        </el-button>
      </div>
    </el-drawer>
    
  </div>
</template>
<!--*****************************************************************************************************************-->
<script>
import $axios from '/src/utils/$axios.js'
import { APP_CONFIG, members, searchEngines } from '/src/utils/appConfig.js'
import { 
  hexToRgb, toRgba, getMemberByName, getMemberByTwitter, getMemberDisplayName,
  formatDate, convertLinks, getImageUrl, isCardImgUrl, storage, notifyNewTab
} from '/src/utils/util.js'

export default {
  name: "NewTab",
  data() {
    return {
      // 主题相关
      selectMember: storage.get(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER) || APP_CONFIG.DEFAULTS.MEMBER,
      
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
      customBgUrl: storage.get(APP_CONFIG.STORAGE_KEYS.CUSTOM_BG_URL) || null
    };
  },
  methods: {
    // 工具函数封装
    hexToRgb,
    toRgba,
    getMemberByName,
    getMemberByTwitter,
    getMemberDisplayName,
    formatDate,
    convertLinks,
    getImageUrl,
    isCardImgUrl,
    
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
        await this.searchContent(this.searchValue);
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
        window.open('https://x.com/gkmas_official', '_blank');
      } else {
        window.open(this.members[index - 1].link, '_blank');
      }
    },
    // 获取成员头像名称
    getAvatarName(memberTwitter) {
      const member = this.getMemberByTwitter(memberTwitter);
      return member ? member.name : 'default';
    },
    
    // 获取推文数据
    async getTwitterContent() {
      $axios.post(APP_CONFIG.TWITTER_API_ENDPOINT).then(res => {
        this.twitterContent = res.data;
        this.filterByMember(null);
      }).catch(err => {
        console.error('获取推文数据失败:', err);
      });
    },
    
    // 按成员筛选推文
    filterByMember(memberName) {
      this.selectedFilterMember = memberName;
      if (memberName) {
        const member = this.getMemberByName(memberName);
        if (member) {
          this.filteredTwitterContent = this.twitterContent.filter(tweet =>
              tweet.member.toLowerCase() === member.twitter.toLowerCase()
          );
        } else {
          this.filteredTwitterContent = [];
        }
      } else {
        this.filteredTwitterContent = this.twitterContent;
      }
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
        }
      };
      window.addEventListener('storage', localStorageListener);
      this.settingsListener = localStorageListener;
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
    }
  },
  mounted() {
    // 监听键盘事件
    window.addEventListener("keydown", this.keyDown);
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
    // 启动时间更新
    this.startTimeUpdate();
  },
  
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener("keydown", this.keyDown);
    document.removeEventListener("click", this.handleDocumentClick);
    if (this.localStorageListener) {
      window.removeEventListener('storage', this.localStorageListener);
    }
    if (this.settingsListener) {
      window.removeEventListener('storage', this.settingsListener);
    }
    // 停止时间更新
    this.stopTimeUpdate();
  },
  computed: {
    // 成员列表
    members() {
      return members;
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
      const bgImage = `/idol/${this.members[this.selectMemberThemeIndex].name}.png`;
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
      
      // 默认主题背景图时，使用成员主题色
      const hex = this.members[this.selectMemberThemeIndex].color;
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
    }
  }
};
</script>
<!--*****************************************************************************************************************-->
<style scoped>

::v-deep(.el-menu--horizontal) {
  border-bottom: none !important;
  box-shadow: none !important;
  padding: 0 20px;
  height: 70px;
  transition: all 0.3s ease;
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
  overflow: hidden;
}

::v-deep(.el-menu-item:last-child .el-button::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent
  );
  transition: left 0.5s ease;
}

::v-deep(.el-menu-item:last-child .el-button:hover::before) {
  left: 100%;
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

.tweet-link i {
  margin-right: 4px;
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

.filter-info i {
  margin-right: 6px;
  color: #667eea;
}

.clear-filter-btn {
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
}

.clear-filter-btn i {
  margin-right: 4px;
}

/* 时间显示容器 - 输入框上方 */
.time-container {
  display: flex;
  justify-content: center;
  margin-top: 0px;
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
  display: flex;
  justify-content: center;
  margin-top: 0;
  padding: 0 20px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .time-container {
    margin-top: 80px;
    margin-bottom: 15px;
  }
  
  .time-main {
    font-size: 24px;
    letter-spacing: 0.5px;
  }
  
  .time-date {
    font-size: 11px;
  }
  
  .search-container {
    margin-top: 0;
    padding: 0 15px;
  }
  
  .search-wrapper {
    height: 50px;
    max-width: 100%;
    padding: 0 20px;
  }
  
  .search-input {
    font-size: 15px;
  }
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
</style>
