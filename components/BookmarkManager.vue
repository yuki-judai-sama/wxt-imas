<template>
  <div v-if="visible" class="bookmark-modal" @click="emitClose">
    <div class="bookmark-modal-content" :style="backgroundStyle" @click.stop>
      <div class="bookmark-header">
        <button class="bookmark-back-btn" @click="emitBack" title="回到工具箱">
          <img :src="utils('back.png')" alt="返回" class="back-icon" draggable="false" />
        </button>
        <h2 class="bookmark-title-header">书签管理</h2>
        <button class="bookmark-close-btn" @click="emitClose">×</button>
      </div>
      <div class="bookmark-body">
        <div class="bookmark-grid">
          <div 
            v-for="item in bookmarkItems" 
            :key="item.id" 
            class="bookmark-item" 
            @click="handleBookmarkClick(item)"
          >
            <div 
              v-if="item.canDelete" 
              class="bookmark-delete-btn" 
              @click.stop="deleteBookmark(item.id.split('-')[1])"
              title="删除书签"
            >
              <img :src="utils('delete.png')" alt="删除" class="delete-icon" draggable="false" />
            </div>
            <div class="bookmark-icon-wrapper">
              <div class="bookmark-icon-circle">
                <img 
                  :src="item.icon" 
                  :alt="item.title" 
                  class="bookmark-icon-img" 
                  draggable="false"
                  @error="handleIconError"
                />
              </div>
            </div>
            <div class="bookmark-title">{{ item.title }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AddBookmarkForm
    :visible="addBookmarkDialogVisible"
    :background-style="backgroundStyle"
    :value="newBookmark"
    @close="closeAddBookmarkDialog"
    @save="saveNewBookmark"
    @url-input="handleUrlInputProxy"
  />
</template>

<script>
import { APP_CONFIG } from '/src/utils/appConfig.js'
import AddBookmarkForm from '/components/AddBookmarkForm.vue'

export default {
  name: 'BookmarkManager',
  props: {
    visible: { type: Boolean, default: false },
    backgroundStyle: { type: Object, default: () => ({}) }
  },
  emits: ['close', 'back', 'bookmarks-updated'],
  components: { AddBookmarkForm },
  data() {
    return {
      bookmarks: [],
      addBookmarkDialogVisible: false,
      newBookmark: { url: '', title: '', icon: APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL + 'collect.png' },
      urlInputTimer: null
    };
  },
  methods: {
    emitClose() { this.$emit('close'); },
    emitBack() { this.$emit('back'); },
    utils(name) { return APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL + name; },
    handleIconError(e) { e.target.src = this.utils('collect.png'); },
    openBookmarkUrl(url) { if (url) window.open(url, '_blank'); },
    deleteBookmark(bookmarkId) {
      this.bookmarks = this.bookmarks.filter(b => b.id !== parseInt(bookmarkId));
      this.saveBookmarksToStorage();
      this.$emit('bookmarks-updated', [...this.bookmarks]);
    },
    handleBookmarkClick(item) {
      if (item.id === 'add-bookmark') {
        this.openAddBookmarkDialog();
      } else {
        this.openBookmarkUrl(item.url);
      }
    },
    openAddBookmarkDialog() {
      this.addBookmarkDialogVisible = true;
      this.resetNewBookmarkForm();
    },
    closeAddBookmarkDialog() { this.addBookmarkDialogVisible = false; },
    resetNewBookmarkForm() {
      this.newBookmark = { url: '', title: '', icon: this.utils('collect.png') };
    },
    handleUrlInputProxy(url) {
      this.newBookmark.url = url || '';
      this.handleUrlInput();
    },
    handleUrlInput() {
      if (this.urlInputTimer) clearTimeout(this.urlInputTimer);
      this.urlInputTimer = setTimeout(async () => {
        if (this.newBookmark.url.trim()) {
          try {
            this.newBookmark.icon = await this.getWebsiteIcon(this.newBookmark.url);
          } catch (e) {
            this.newBookmark.icon = this.utils('collect.png');
          }
        }
      }, 500);
    },
    async saveNewBookmark(model) {
      const urlRaw = (model?.url || this.newBookmark.url || '').trim();
      if (!urlRaw) return;
      let normalizedUrl = urlRaw;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
      const icon = model?.icon || await this.getWebsiteIcon(normalizedUrl);
      const title = (model?.title || this.newBookmark.title || '').trim() || '新书签';
      if (this.bookmarks.length >= 15) return;
      const bookmark = { id: Date.now(), url: normalizedUrl, title, icon, createdAt: new Date().toISOString() };
      this.bookmarks.push(bookmark);
      this.saveBookmarksToStorage();
      this.$emit('bookmarks-updated', [...this.bookmarks]);
      this.closeAddBookmarkDialog();
    },
    saveBookmarksToStorage() { localStorage.setItem('userBookmarks', JSON.stringify(this.bookmarks)); },
    loadBookmarksFromStorage() {
      const savedBookmarksStr = localStorage.getItem('userBookmarks');
      if (!savedBookmarksStr) return;
      try {
        const savedBookmarks = JSON.parse(savedBookmarksStr);
        if (Array.isArray(savedBookmarks)) {
          this.bookmarks = savedBookmarks.map(bookmark => {
            try {
              if (bookmark.url) {
                const domain = new URL(bookmark.url).hostname;
                if (this.isValidDomain(domain)) {
                  bookmark.icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                } else {
                  bookmark.icon = this.utils('collect.png');
                }
              } else {
                bookmark.icon = this.utils('collect.png');
              }
            } catch (_) {
              bookmark.icon = this.utils('collect.png');
            }
            return bookmark;
          });
          // 初始加载后，同步父组件底部栏
          this.$emit('bookmarks-updated', [...this.bookmarks]);
        }
      } catch (e) {
        console.error('解析书签数据失败:', e);
      }
    },
    async getWebsiteIcon(url) {
      try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
        const domain = new URL(url).hostname;
        if (!this.isValidDomain(domain)) return this.utils('collect.png');
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
      } catch (_) {
        return this.utils('collect.png');
      }
    },
    isValidDomain(domain) {
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
      return domainRegex.test(domain) && domain.length > 3 && domain.length < 255;
    }
  },
  computed: {
    bookmarkItems() {
      const items = [];
      this.bookmarks.forEach((bookmark) => {
        items.push({
          id: `bookmark-${bookmark.id}`,
          title: bookmark.title || '未命名书签',
          icon: bookmark.icon || this.utils('collect.png'),
          url: bookmark.url,
          canDelete: true
        });
      });
      if (this.bookmarks.length < 15) {
        items.push({
          id: 'add-bookmark',
          title: '新增书签',
          icon: this.utils('add.png'),
          url: null,
          canDelete: false
        });
      }
      return items;
    }
  }
  ,mounted() {
    this.loadBookmarksFromStorage();
  }
}
</script>

<style scoped>
.bookmark-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px) saturate(1.5);
  -webkit-backdrop-filter: blur(12px) saturate(1.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.bookmark-modal-content {
  width: 75vw;
  height: 80vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.bookmark-modal-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
  border-radius: 16px;
}

.bookmark-header {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px 16px 0 0;
  position: relative;
  z-index: 2;
}

.bookmark-back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
  z-index: 10;
  position: relative;
}

.bookmark-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.back-icon {
    width: 20px;
    height: 20px;
  filter: brightness(0) invert(1);
}

.bookmark-title-header {
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin: 0;
  flex: 1;
  text-align: center;
}

.bookmark-close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.bookmark-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.bookmark-body {
  flex: 1;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px) saturate(1.5);
  -webkit-backdrop-filter: blur(15px) saturate(1.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.bookmark-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.bookmark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.bookmark-delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 0;
  transform: scale(0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.delete-icon {
  width: 12px;
  height: 12px;
  filter: brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
}

.bookmark-item:hover .bookmark-delete-btn {
  opacity: 1;
  transform: scale(1);
}

.bookmark-delete-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
}

.bookmark-item:hover {
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(22px) saturate(1.8);
  -webkit-backdrop-filter: blur(22px) saturate(1.8);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.25),
    0 0 20px rgba(255, 255, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.bookmark-icon-wrapper {
  margin-bottom: 8px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-icon-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.bookmark-item:hover .bookmark-icon-circle {
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(15px) saturate(1.5);
  -webkit-backdrop-filter: blur(15px) saturate(1.5);
  border-color: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.bookmark-icon-img {
  width: 28px;
  height: 28px;
  filter: none;
  transition: all 0.3s ease;
}

.bookmark-item:hover .bookmark-icon-img {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.bookmark-title {
  font-size: 13px;
  color: #fff;
  text-align: center;
  font-weight: 600;
  line-height: 1.2;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.bookmark-item:hover .bookmark-title {
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.bookmark-item:not(:hover) {
  animation: subtleGlow 3s ease-in-out infinite;
}
</style>


