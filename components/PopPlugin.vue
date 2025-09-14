
<template>
  <div class="popup-container" :style="containerStyle">
    <!-- 头部区域 -->
    <div class="header" :style="headerStyle">
      <div class="logo-section">
        <img 
          src="/icon/学マス-logo.png" 
          alt="学マス" 
          class="logo"
        />
        <h2 class="title">学マス小插件</h2>
      </div>
      <el-divider />
    </div>

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
              />
              <h3 class="theme-name">{{ selectedMember }}</h3>
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
             :title="`切换到 ${member.name} 主题`"
           >
             <div class="member-content">
               <img 
                 :src="`/idol/headImg/${member.name}.png`" 
                 class="member-avatar"
                 style="width: 24px; height: 24px; border-radius: 50%;"
               />
               <span class="member-name">{{ member.name }}</span>
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
          打开设置页面
        </el-button>

      </div>
    </div>

    <!-- 底部区域 -->
    <div class="footer">
      <el-divider />
      <div class="footer-content">
        <span class="copyright">©学マス小插件</span>
        <span class="copyright">Version 1.0.0</span>
      </div>
    </div>
  </div>
</template>

<script>
import { members, DEFAULT_MEMBER } from '/src/config/newTabConfig.js'

export default {
  name: "PopPlugin",
  data() {
    return {
      // 当前选中的成员
      selectedMember: localStorage.getItem('defaultMember') || DEFAULT_MEMBER
    };
  },
  methods: {
    // 切换成员主题
    changeMemberTheme(memberName) {
      this.selectedMember = memberName;
      localStorage.setItem('defaultMember', memberName);
      this.notifyNewTabThemeChange(memberName);
    },
    
    // 通知新标签页主题变更
    notifyNewTabThemeChange(memberName) {
      // Chrome storage 通知
      if (chrome?.storage) {
        try {
          chrome.storage.local.set({ 
            themeChange: { memberName, timestamp: Date.now() }
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
              if (tab.id && tab.url?.includes('entrypoints/newtab/index.html')) {
                chrome.tabs.sendMessage(tab.id, {
                  type: 'THEME_CHANGE',
                  memberName
                });
              }
            });
          });
        } catch (error) {
          console.debug('发送消息失败:', error);
        }
      }
    },
    
    // 跳转到设置页面
    goToSettings() {
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('entrypoints/newtab/index.html') 
      });
      window.close();
    },
    
    // 获取成员项样式
    getMemberItemStyle(member) {
      const hex = member.color;
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return {
        borderColor: `rgb(${r}, ${g}, ${b})`,
        backgroundColor: this.selectedMember === member.name 
          ? `rgba(${r}, ${g}, ${b}, 0.2)` 
          : 'rgba(255, 255, 255, 0.1)'
      };
    }
  },
  mounted() {
    // 确保选中的成员在列表中
    if (!members.find(m => m.name === this.selectedMember)) {
      this.selectedMember = DEFAULT_MEMBER;
    }
  },
  computed: {
    // 成员列表
    members() {
      return members;
    },
    
    // 当前成员主题样式
    currentMemberTheme() {
      const member = members.find(m => m.name === this.selectedMember);
      if (!member) return { color: '#667eea', bgImage: '' };
      
      const hex = member.color;
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return {
        color: `rgb(${r}, ${g}, ${b})`,
        bgImage: `/idol/${member.name}.png`
      };
    },
    
    // 容器背景样式
    containerStyle() {
      return {
        backgroundImage: `url('${this.currentMemberTheme.bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    },
    
    // 头部样式
    headerStyle() {
      return {
        backgroundColor: `rgba(${this.currentMemberTheme.color.replace('rgb(', '').replace(')', '')}, 0.2)`,
        backdropFilter: 'blur(10px)'
      };
    },
    
    // 主题预览边框样式
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #fff;
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
  grid-template-columns: repeat(3, 1fr);
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
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.main-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
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
  border-color: rgba(255, 255, 255, 0.2);
  margin: 12px 0;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-button .el-icon) {
  margin-right: 6px;
}

:deep(.el-card__body) {
  padding: 16px;
}

/* 响应式调整 */
@media (max-width: 400px) {
  .popup-container {
    width: 320px;
    min-height: 550px;
  }
  
  .content {
    padding: 16px;
  }
  
  .theme-preview {
    height: 70px;
  }
  
  .theme-name {
    font-size: 16px;
  }
  
  .member-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .main-action-btn {
    height: 40px;
    font-size: 14px;
  }
}
</style>
