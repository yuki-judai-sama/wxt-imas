<template>
  <div class="options-container" :style="containerStyle">
    <!-- 头部区域 -->
    <div class="header" :style="headerStyle">
      <div class="logo-section">
        <img 
          src="/icon/学マス-logo.png" 
          alt="学マス" 
          class="logo"
          draggable="false"
        />
        <h1 class="title">学マス - 插件设置</h1>
      </div>
      <el-divider />
    </div>

    <!-- 主要内容区域 -->
    <div class="content">
      <!-- 主题设置区域 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>主题设置</span>
          </div>
        </template>
        
        <!-- 当前主题预览 -->
        <div class="current-theme-section">
          <div class="theme-preview" :style="themePreviewStyle">
            <div class="theme-overlay">
              <div class="content-wrapper">
                <img 
                  :src="`/idol/headImg/${selectedMember}.png`" 
                  class="theme-avatar"
                  draggable="false"
                />
                <h4 class="theme-name">{{ getMemberDisplayName(selectedMember) }}</h4>
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
                  draggable="false"
                />
                <span class="member-name">{{ member.memberName }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 功能设置区域 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><Tools /></el-icon>
            <span>功能设置</span>
          </div>
        </template>
        
        <div class="setting-item">
          <label class="setting-label">默认搜索引擎</label>
          <el-select v-model="defaultSearchEngine" placeholder="选择默认搜索引擎" style="width: 200px">
            <el-option
              v-for="engine in searchEngines"
              :key="engine.name"
              :label="engine.displayName"
              :value="engine.name"
            />
          </el-select>
        </div>

        <!-- 自定义背景图设置 -->
        <div class="setting-item">
          <label class="setting-label">自定义背景图</label>
          <div class="custom-bg-container">
            <!-- 上传区域或预览区域 -->
            <el-upload
              v-if="!customBgUrl"
              class="bg-uploader"
              :show-file-list="false"
              :before-upload="beforeBgUpload"
              :http-request="handleBgUpload"
              accept="image/*"
              drag
            >
              <div class="upload-content">
                <el-icon class="bg-uploader-icon"><Plus /></el-icon>
                <div class="upload-text">选择图片</div>
                <div class="upload-hint">支持 JPG、PNG 等格式，最大 4MB</div>
              </div>
            </el-upload>
            
            <!-- 当前背景图预览 -->
            <div v-else class="bg-preview">
              <img :src="customBgUrl" alt="自定义背景图" class="bg-preview-image" />
              <div class="bg-actions">
                <el-button size="small" @click="removeCustomBg">删除</el-button>
                <el-button size="small" @click="changeCustomBg">更换</el-button>
              </div>
            </div>
          </div>
        </div>

      </el-card>

      <!-- 关于信息区域 -->
      <el-card class="settings-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>关于</span>
          </div>
        </template>
        
        <div class="about-content">
          <p><strong>插件名称：</strong>学マス主题浏览器扩展插件</p>
          <p><strong>版本：</strong>1.0.0</p>
            <p>如有问题反馈或功能建议，欢迎发送邮件至：<a href="mailto:yukijudai.sky@qq.com" style="color: #409EFF; text-decoration: none;">yukijudai.sky@qq.com</a></p>
        </div>
      </el-card>
    </div>

    <!-- 底部操作区域 -->
    <div class="footer">
      <el-divider />
      <div class="footer-actions">
        <el-button @click="resetSettings">重置设置</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { members, DEFAULT_MEMBER, searchEngines } from '/src/config/appConfig.js'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: "Options",
  components: {
    Plus
  },
  data() {
    return {
      // 当前选中的成员
      selectedMember: localStorage.getItem('defaultMember') || DEFAULT_MEMBER,
      // 默认搜索引擎
      defaultSearchEngine: localStorage.getItem('defaultSearchEngine') || 'google',
      // 自定义背景图
      customBgUrl: localStorage.getItem('customBgUrl') || null
    };
  },
  methods: {
    // 切换成员主题
    changeMemberTheme(memberName) {
      // 验证成员是否存在
      const member = members.find(m => m.name === memberName);
      if (!member) {
        this.$message.error('无效的成员选择');
        return;
      }
      
      this.selectedMember = memberName;
      try {
        localStorage.setItem('defaultMember', memberName);
        this.notifyNewTabThemeChange(memberName);
      } catch (error) {
        console.error('保存主题设置失败:', error);
        this.$message.error('保存设置失败，请重试');
      }
    },
    
    // 通知新标签页主题变更
    notifyNewTabThemeChange(memberName) {
      this.notifyNewTab('THEME_CHANGE', { memberName });
    },
    
    // 保存设置
    saveSettings() {
      try {
        // 验证设置有效性
        const member = members.find(m => m.name === this.selectedMember);
        if (!member) {
          this.$message.error('无效的成员选择');
          return;
        }
        
        const validEngines = searchEngines.map(engine => engine.name);
        if (!validEngines.includes(this.defaultSearchEngine)) {
          this.$message.error('无效的搜索引擎选择');
          return;
        }
        
        // 保存设置
        localStorage.setItem('defaultMember', this.selectedMember);
        localStorage.setItem('defaultSearchEngine', this.defaultSearchEngine);
        
        // 保存自定义背景图
        if (this.customBgUrl) {
          localStorage.setItem('customBgUrl', this.customBgUrl);
        } else {
          localStorage.removeItem('customBgUrl');
        }
        
        // 通知新标签页设置变更
        this.notifyNewTabSettingsChange();
        
        this.$message.success('设置已保存');
      } catch (error) {
        console.error('保存设置失败:', error);
        this.$message.error('保存设置失败，请重试');
      }
    },
    
    // 重置设置
    resetSettings() {
      this.$confirm('确定要重置所有设置吗？', '确认重置', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        try {
          this.selectedMember = DEFAULT_MEMBER;
          this.defaultSearchEngine = 'google';
          this.customBgUrl = null;
          
          localStorage.clear();
          this.notifyNewTabSettingsChange();
          this.$message.success('设置已重置');
        } catch (error) {
          console.error('重置设置失败:', error);
          this.$message.error('重置设置失败，请重试');
        }
      }).catch(() => {
        this.$message.info('已取消重置');
      });
    },
    
    // 通知新标签页设置变更
    notifyNewTabSettingsChange() {
      this.notifyNewTab('SETTINGS_CHANGE', { 
        defaultSearchEngine: this.defaultSearchEngine,
        customBgUrl: this.customBgUrl
      });
    },
    
    // 通用通知新标签页方法
    notifyNewTab(type, data) {
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
    },
    
    // 获取成员显示名称
    getMemberDisplayName(memberName) {
      const member = members.find(m => m.name === memberName);
      return member ? member.memberName : memberName;
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
    },
    
    // 图片上传前验证
    beforeBgUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      
      // 检查文件大小（限制为4MB）
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > 4) {
        this.$message.error('图片大小不能超过 4MB!');
        return false;
      }
      
      return true;
    },
    
    // 处理图片上传
    handleBgUpload(options) {
      const file = options.file;
      const fileSizeMB = file.size / 1024 / 1024;
      
      if (fileSizeMB < 3) {
        // 小于3MB，不压缩
        this.processImage(file, 1.0);
      } else if (fileSizeMB < 4) {
        // 3-4MB，轻微压缩
        this.processImage(file, 0.8);
      } else {
        // 大于4MB，不允许上传（已在beforeBgUpload中处理）
        return;
      }
    },
    
    // 处理图片压缩
    processImage(file, quality) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 计算压缩后的尺寸
        let { width, height } = img;
        
        if (quality < 1.0) {
          // 轻微压缩：适当缩小尺寸
          const maxSize = 1920; // 最大宽度
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 生成压缩后的Data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // 检查压缩后的大小
        const compressedSizeMB = (compressedDataUrl.length * 0.75) / 1024 / 1024; // base64解码后的大小
        
        if (compressedSizeMB > 3) {
          // 如果压缩后仍然太大，进一步压缩
          this.processImage(file, quality * 0.7);
          return;
        }
        
        this.customBgUrl = compressedDataUrl;
        // 立即保存到localStorage
        localStorage.setItem('customBgUrl', this.customBgUrl);
        // 通知新标签页
        this.notifyNewTabSettingsChange();
      };
      
      img.src = URL.createObjectURL(file);
    },
    
    // 删除自定义背景图
    removeCustomBg() {
      this.customBgUrl = null;
      localStorage.removeItem('customBgUrl');
      this.notifyNewTabSettingsChange();
    },
    
    // 更换自定义背景图
    changeCustomBg() {
      // 触发文件选择
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file && this.beforeBgUpload(file)) {
          const fileSizeMB = file.size / 1024 / 1024;
          
          if (fileSizeMB < 3) {
            // 小于3MB，不压缩
            this.processImage(file, 1.0);
          } else if (fileSizeMB < 4) {
            // 3-4MB，轻微压缩
            this.processImage(file, 0.8);
          }
        }
      };
      input.click();
    }
  },
  mounted() {
    // 确保选中的成员在列表中
    if (!members.find(m => m.name === this.selectedMember)) {
      this.selectedMember = DEFAULT_MEMBER;
      localStorage.setItem('defaultMember', DEFAULT_MEMBER);
    }
    
    // 验证默认搜索引擎
    const validEngines = searchEngines.map(engine => engine.name);
    if (!validEngines.includes(this.defaultSearchEngine)) {
      this.defaultSearchEngine = 'google';
      localStorage.setItem('defaultSearchEngine', 'google');
    }
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
      // 使用与 PopPlugin.vue 相同的透明毛玻璃效果
      return {
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(25px) saturate(1.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
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
/* 设置页面容器 */
.options-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

/* 背景遮罩层 */
.options-container::before {
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
.options-container > * {
  position: relative;
  z-index: 2;
}

/* 头部样式 */
.header {
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 内容区域 */
.content {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 设置卡片 */
.settings-card {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

/* 当前主题预览区域 */
.current-theme-section {
  margin-bottom: 24px;
}

.current-theme-section h3 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.theme-preview {
  position: relative;
  height: 80px;
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
  gap: 12px;
}

.theme-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.theme-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* 成员选择器区域 */
.member-selector h3 {
  margin: 0 0 16px 0;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 12px;
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
  gap: 10px;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

/* 自定义背景图设置 */
.custom-bg-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bg-uploader {
  width: 200px;
  height: 120px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-uploader:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg-uploader-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
}

.upload-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.upload-hint {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  margin-top: 4px;
  text-align: center;
}

/* Element Plus 上传组件样式覆盖 */
:deep(.bg-uploader) {
  width: 200px;
  height: 120px;
  display: block;
}

:deep(.bg-uploader .el-upload) {
  width: 100%;
  height: 100%;
  display: block;
}

:deep(.bg-uploader .el-upload-dragger) {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}

:deep(.bg-uploader .el-upload-dragger:hover) {
  background: transparent;
}

.bg-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bg-preview-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.bg-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* 关于内容 */
.about-content p {
  margin: 8px 0;
  color: #fff;
  font-size: 14px;
}

/* 底部操作区域 */
.footer {
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-divider) {
  border-color: rgba(0, 0, 0, 0.1);
  margin: 16px 0;
}

:deep(.el-card__header) {
  background: rgba(255, 255, 255, 0.1) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-card__body) {
  background: transparent !important;
  color: #fff !important;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
}

:deep(.el-select .el-input__inner) {
  color: #fff !important;
}

:deep(.el-switch__core) {
  background: rgba(255, 255, 255, 0.2) !important;
}

:deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-input-number .el-input__inner) {
  color: #fff !important;
}

:deep(.el-button) {
  border-radius: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content {
    padding: 20px;
  }
  
  .header {
    padding: 16px 20px;
  }
  
  .footer {
    padding: 16px 20px;
  }
  
  .member-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
