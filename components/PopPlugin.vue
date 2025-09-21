
<template>
  <div class="popup-container" :style="containerStyle">
    <!-- 头部区域 -->
<!--    <div class="header" :style="headerStyle">-->
<!--      <div class="logo-section">-->
<!--        <img-->
<!--          src="/utils/学マス-logo.png"-->
<!--          alt="学マス"-->
<!--          class="logo"-->
<!--          draggable="false"-->
<!--        />-->
<!--        <h2 class="title">学マス</h2>-->
<!--      </div>-->
<!--      <el-divider />-->
<!--    </div>-->

    <!-- 主要内容区域 -->
    <div class="content">
      <!-- 当前主题预览 -->
      <div class="current-theme-section">
        <div class="theme-preview" :style="themePreviewStyle">
          <div class="theme-overlay">
            <div class="content-wrapper">
              <img 
                :src="`/idol/headImg/${selectedMember}.png`" 
                class="theme-avatar"
                style="width: 50px; height: 50px; border-radius: 50%;"
                draggable="false"
              />
              <h3 class="theme-name">{{ getMemberDisplayName(selectedMember) }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- 成员主题选择器 -->
      <div class="member-selector">
        <div class="member-grid">
           <div
             v-for="member in members"
             :key="member.name"
             class="member-item"
             :class="{ active: selectedMember === member.name }"
             :style="getMemberItemStyle(member)"
             @click="changeMemberTheme(member.name)"
             :title="`切换到 ${member.memberName} 主题`"
           >
             <div class="member-content">
               <img 
                 :src="`/idol/headImg/${member.name}.png`" 
                 class="member-avatar"
                 style="width: 24px; height: 24px; border-radius: 50%;"
                 draggable="false"
               />
               <span class="member-name">{{ member.memberName }}</span>
             </div>
           </div>
         </div>
      </div>

      <!-- 功能按钮区域 -->
      <div class="actions">
        <el-button 
          type="primary" 
          size="large" 
          class="main-action-btn"
          @click="goToSettings"
        >
          <el-icon><Setting /></el-icon>
          插件设置
        </el-button>

      </div>
    </div>

    <!-- 底部区域 -->
    <div class="footer">
      <el-divider />
      <div class="footer-content">
        <span class="copyright">©学マス</span>
        <span class="copyright">Version 1.0.0</span>
      </div>
    </div>
  </div>
</template>

<script>
import { APP_CONFIG, members } from '/src/utils/appConfig.js'
import { hexToRgb, toRgba, getMemberDisplayName, storage, notifyNewTab } from '/src/utils/util.js'

export default {
  name: "PopPlugin",
  data() {
    return {
      selectedMember: storage.get(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER) || APP_CONFIG.DEFAULTS.MEMBER
    };
  },
  methods: {
    hexToRgb,
    toRgba,
    getMemberDisplayName,
    
    // 切换成员主题
    changeMemberTheme(memberName) {
      this.selectedMember = memberName;
      storage.set(APP_CONFIG.STORAGE_KEYS.DEFAULT_MEMBER, memberName);
      notifyNewTab('THEME_CHANGE', { memberName });
    },
    
    // 跳转到设置页面
    goToSettings() {
      const url = chrome?.runtime?.getURL ? chrome.runtime.getURL('options.html') : 'options.html';
      
      if (chrome?.tabs?.create) {
        try {
          chrome.tabs.create({ url });
        } catch (_) {
          window.open(url, '_blank');
        }
      } else {
        window.open(url, '_blank');
      }
      
      if (window?.close) window.close();
    },
    
    // 获取成员项样式
    getMemberItemStyle(member) {
      const rgb = this.hexToRgb(member.color);
      return {
        borderColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        backgroundColor: this.selectedMember === member.name 
          ? this.toRgba(rgb, 0.2)
          : 'rgba(255, 255, 255, 0.1)'
      };
    }
  },
  mounted() {
    // 确保选中的成员在列表中
    if (!members.find(m => m.name === this.selectedMember)) {
      this.selectedMember = APP_CONFIG.DEFAULTS.MEMBER;
    }
  },
  computed: {
    members() {
      return members;
    },
    
    currentMemberTheme() {
      const member = members.find(m => m.name === this.selectedMember);
      if (!member) return { color: '#667eea', bgImage: '' };
      
      const { r, g, b } = this.hexToRgb(member.color);
      return {
        color: `rgb(${r}, ${g}, ${b})`,
        bgImage: `/idol/${member.name}.png`
      };
    },
    
    containerStyle() {
      return {
        backgroundImage: `url('${this.currentMemberTheme.bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    },
    
    headerStyle() {
      return {
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(25px) saturate(1.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      };
    },
    
    themePreviewStyle() {
      return {
        borderColor: this.currentMemberTheme.color
      };
    }
  }
};
</script>

<style scoped>
/* 标准浏览器插件弹窗尺寸 */
.popup-container {
  width: 380px;
  min-height: 600px;
  max-height: 700px;
  background: var(--gradient-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 背景遮罩层 */
.popup-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

/* 确保内容在遮罩层之上 */
.popup-container > * {
  position: relative;
  z-index: 2;
}

/* 头部样式 */
.header {
  padding: 16px 20px 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 当前主题预览区域 */
.current-theme-section {
  margin-bottom: 8px;
}

.theme-preview {
  position: relative;
  height: 70px;
  border-radius: 12px;
  border: 2px solid;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}


.theme-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.content-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: block;
  flex-shrink: 0;
}

.theme-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  line-height: 1;
  white-space: nowrap;
}

/* 成员选择器区域 */
.member-selector {
  margin-bottom: 8px;
}



.member-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  justify-items: stretch;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.member-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.member-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.member-item.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.member-avatar {
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.member-name {
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 按钮区域 */
.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.main-action-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  user-select: none;
}

.main-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8 0%, #6b4c93 100%);
}



/* 底部样式 */
.footer {
  padding: 8px 20px 12px 20px;
  background: rgba(0, 0, 0, 0.1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}


.copyright {
  opacity: 0.7;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-divider) {
  border-color: rgba(0, 0, 0, 0.1);
  margin: 12px 0;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-button .el-icon) {
  margin-right: 6px;
}

/* 确保按钮内容垂直居中 */
:deep(.main-action-btn) {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  user-select: none !important;
}

:deep(.main-action-btn .el-icon) {
  margin-right: 6px;
  vertical-align: middle;
  cursor: pointer !important;
  user-select: none !important;
}

:deep(.main-action-btn span) {
  cursor: pointer !important;
  user-select: none !important;
}

:deep(.el-card__body) {
  padding: 16px;
}


/* 解决Edge浏览器插件弹窗背景黑色问题 */
:global(html, body) {
  margin: 0 !important;
  padding: 0 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

:global(#app) {
  margin: 0 !important;
  padding: 0 !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
</style>
