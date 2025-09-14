<template>
  <div class="mainStyle" :style="mainStyle">
    <!-- 顶部导航栏 -->
    <el-menu mode="horizontal" :style="menuStyle" :ellipsis="false">
      <!-- 官方Logo -->
      <el-menu-item index="logo" @click="openMemberLink(0)">
        <img
            style="max-height: 100%; height: auto; width: auto;"
            src="/icon/学マス-logo.png"
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
            @keydown="keyDown"
        />
        <div class="search-underline"></div>
          </div>
    </div>
    <!-- 推文抽屉 -->
    <el-drawer
        v-model="memberDrawerVisible"
        title="成员动态"
        direction="rtl"
        size="30%"
        :header-style="{ padding: '4px 16px', fontSize: '16px', fontWeight: 'bold' }"
        :body-style="{ padding: '0' }"
    >
      <!-- 成员筛选器 -->
      <div style="padding: 0px 16px 4px 16px; border-bottom: 1px solid #eee;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <div
              v-for="member in members"
              :key="member.name"
              @click="toggleMemberFilter(member.name)"
              :style="{
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: selectedFilterMember === member.name ? '#409EFF' : '#ddd',
                backgroundColor: selectedFilterMember === member.name ? '#f0f8ff' : '#fff'
              }"
              :title="selectedFilterMember === member.name ? '点击显示全部推文' : `点击只显示 @${member.name} 的推文`"
          >
            <el-avatar
                :src="`/idol/headImg/${member.name}.png`"
                size="40"
                style="border: 1px solid #ddd;"
                @dragstart.prevent
            />
          </div>
        </div>
      </div>

      <div v-if="filteredTwitterContent.length === 0" style="text-align: center; padding: 20px; color: #666;">
        <div v-if="twitterContent.length === 0">暂无推文数据</div>
        <div v-else-if="selectedFilterMember">@{{ selectedFilterMember }} 暂无推文</div>
        <div v-else>暂无推文数据</div>
      </div>
      <div
          v-for="(tweet, index) in filteredTwitterContent"
          :key="index"
          :style="{
            marginBottom: '16px',
            marginTop: index === 0 ? '16px' : '0'
          }"
      >
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <el-avatar
              :src="`/idol/headImg/${getAvatarName(tweet.member)}.png`"
              draggable="false"
              @dragstart.prevent
              style="margin-right: 8px; cursor: pointer;"
              @click="openMemberTwitterPage(tweet.member)"
              :title="`点击访问 @${tweet.member} 的推特主页`"
          />
          <div>
            <div style="font-weight: bold; font-size: 14px; color: #333;">
              @{{ tweet.member }}
              <span v-if="tweet.source_user && tweet.source_user !== tweet.member"
                    style="font-size: 12px; color: #666; margin-left: 8px;">
                (来自 @{{ tweet.source_user }})
              </span>
            </div>
            <div style="color: gray; font-size: 13px;">
              {{ formatDate(tweet.created_at) }}
            </div>
          </div>
        </div>

        <p
            style="white-space: pre-line; margin-top: 8px"
            v-html="convertLinks(tweet.text)"
        ></p>

        <!-- 显示推文来源信息 -->
        <div v-if="tweet.source_user && tweet.source_user !== tweet.member"
             style="margin-top: 8px; padding: 8px; background-color: #f5f5f5; border-radius: 4px; font-size: 12px; color: #666;">
          📍 此推文来自 <strong style="cursor: pointer; color: #409EFF;" @click="openMemberTwitterPage(tweet.source_user)">@{{ tweet.source_user }}</strong> 的时间线
        </div>

        <!-- 图片显示 -->
        <div v-if="tweet.media && tweet.media.length > 0" style="margin-top: 8px">
          <div v-for="(img, i) in tweet.media" :key="i" style="margin-bottom: 8px;">
            <!-- 对于card_img格式的Nitter图片，使用img标签直接显示原始URL -->
            <img
                v-if="isCardImgUrl(img) && !imageLoadErrors[`${tweet.id}-${i}`]"
                :src="img"
                :alt="`图片 ${i + 1}`"
                loading="lazy"
                style="width: 100%; border-radius: 8px; cursor: pointer;"
                draggable="false"
                @click="openImageInNewTab(img)"
                @error="handleImageError(tweet.id, i)"
                @load="handleImageLoad(tweet.id, i)"
            />
            <!-- 对于其他图片URL，使用el-image组件 -->
          <el-image
                v-else-if="!isCardImgUrl(img) && !imageLoadErrors[`${tweet.id}-${i}`]"
              :src="img"
                style="width: 100%; border-radius: 8px; cursor: pointer;"
                :preview-src-list="tweet.media"
                :initial-index="i"
              fit="cover"
                :alt="`图片 ${i + 1}`"
                @error="handleImageError(tweet.id, i)"
                @load="handleImageLoad(tweet.id, i)"
          />
          </div>
        </div>

        <div style="text-align: right; margin-top: 4px;">
          <a
              :href="`https://x.com/${tweet.member}/status/${tweet.id}`"
              target="_blank"
              rel="noopener noreferrer"
              style="font-size: 13px; color: #409EFF;"
          >
            打开推文
          </a>
          <span v-if="tweet.source_user && tweet.source_user !== tweet.member"
                style="font-size: 12px; color: #999; margin-left: 12px;">
            原始推文
          </span>
        </div>

        <el-divider />
      </div>

      <!-- 筛选状态提示 -->
      <div v-if="selectedFilterMember && filteredTwitterContent.length > 0" style="padding: 16px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee;">
        当前显示：@{{ selectedFilterMember }} 的推文 (共 {{ filteredTwitterContent.length }} 条)
        <el-button
            type="text"
            size="small"
            @click="filterByMember(null)"
            style="margin-left: 8px;"
        >
          显示全部
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>
<!--*****************************************************************************************************************-->
<script>
import $axios from '/src/$axios.js'
import { members, searchEngines, OFFICIAL_ACCOUNT, OFFICIAL_AVATAR, DEFAULT_MEMBER, CLICK_EFFECT_TEXTS } from '/src/config/newTabConfig.js'

export default {
  name: "NewTab",
  data() {
    return {
      // 主题相关
      selectMember: localStorage.getItem('defaultMember') || DEFAULT_MEMBER,
      
      // 搜索相关
      searchValue: null,
      searchIconIndex: 0,
      searchFocused: false,
      
      // 时间相关
      currentTime: {
        time: '',
        date: ''
      },
      timeInterval: null,
      
      // 推文相关
      twitterContent: [],
      memberDrawerVisible: false,
      selectedFilterMember: null,
      filteredTwitterContent: [],
      imageLoadErrors: {} // 跟踪图片加载失败状态
    };
  },
  methods: {
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
      this.timeInterval = setInterval(this.updateTime, 1000);
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
    // 处理推文文本链接和标签
    convertLinks(text) {
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
    },
    
    // 格式化日期时间
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    // 获取成员头像名称
    getAvatarName(memberTwitter) {
      if (memberTwitter.toLowerCase() === OFFICIAL_ACCOUNT.toLowerCase()) {
        return OFFICIAL_AVATAR;
      }
      const member = this.members.find(m => m.twitter.toLowerCase() === memberTwitter.toLowerCase());
      return member ? member.name : 'default';
    },
    
    // 获取推文数据
    async getTwitterContent() {
      $axios.post('/TwitterController/getTwitterContent').then(res => {
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
        const member = this.members.find(m => m.name === memberName);
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
    // 判断是否为card_img格式的图片URL
    isCardImgUrl(url) {
      return url && url.includes('nitter.kuuro.net/pic/card_img');
    },
    
    // 在新标签页中打开图片
    openImageInNewTab(url) {
      window.open(url, '_blank');
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
        if (e.key === 'defaultMember' && e.newValue) {
          this.handleThemeChange(e.newValue);
        }
      };
      window.addEventListener('storage', localStorageListener);
      this.localStorageListener = localStorageListener;
    },
    
    // 处理主题变更
    handleThemeChange(memberName) {
      const member = this.members.find(m => m.name === memberName);
      if (!member) return;
      
      this.selectMember = memberName;
      localStorage.setItem('defaultMember', memberName);
      this.updateThemeStyles(memberName, member);
      this.$forceUpdate();
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
      
      // 更新导航栏颜色
      const menuElement = document.querySelector('.el-menu--horizontal');
      if (menuElement) {
        const hex = member.color;
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
        menuElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
      }
    }
  },
  mounted() {
    // 监听键盘事件
    window.addEventListener("keydown", this.keyDown);
    // 获取推文数据
    this.getTwitterContent();
    // 监听主题变更
    this.setupThemeChangeListener();
    // 启动时间更新
    this.startTimeUpdate();
  },
  
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener("keydown", this.keyDown);
    if (this.localStorageListener) {
      window.removeEventListener('storage', this.localStorageListener);
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
      const hex = this.members[this.selectMemberThemeIndex].color;
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return {
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.4)`
      };
    }
  }
};
</script>
<!--*****************************************************************************************************************-->
<style scoped>

::v-deep(.el-menu--horizontal) {    /*删除menu自带外边框*/
  border-bottom: none !important;
  box-shadow: none !important;
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
</style>
