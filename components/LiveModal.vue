<template>
  <div v-if="visible" class="live-modal" @click="emitClose">
    <div class="live-modal-content" :style="backgroundStyle" @click.stop>
      <div class="live-header">
        <button class="live-back-btn" @click="emitBack" title="回到工具箱">
          <img :src="utils('back.png')" alt="返回" class="back-icon" draggable="false" />
        </button>
        <h2 class="live-title-header">イベント·ライブ</h2>
        <button class="live-close-btn" @click="emitClose">×</button>
      </div>
      <div class="live-body">
        <div v-if="items.length === 0" class="live-empty-state">
          <div class="live-empty-icon">🎤</div>
          <div class="live-empty-text">暂无Live信息</div>
        </div>
        <div v-else class="live-grid">
          <div v-for="(live, index) in items" :key="index" class="live-item">
            <div class="live-image-container">
              <img :src="live.imageUrl" :alt="live.title" class="live-image" draggable="false" @error="onLiveImageError" />
            </div>
            <div class="live-info">
              <div class="live-title">{{ live.title }}</div>
              <div class="live-tag" :class="getLiveTagClass(live.tag)">
                {{ live.tag || '受付は終了しました' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { APP_CONFIG } from '/src/utils/appConfig.js'

export default {
  name: 'LiveModal',
  props: {
    visible: { type: Boolean, default: false },
    backgroundStyle: { type: Object, default: () => ({}) }
  },
  emits: ['close', 'back'],
  data() {
    return { items: [] };
  },
  methods: {
    emitClose() { this.$emit('close'); },
    emitBack() { this.$emit('back'); },
    onLiveImageError(e) { e.target.src = this.utils('Live.png'); },
    utils(name) { return APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL + name; },
    async fetchLive() {
      try {
        const res = await fetch(APP_CONFIG.API_BASE_URL + (APP_CONFIG.ASOBI_TICKET_BOOTS || '/AsobiTicketBootsController/getLiveInfoList'), { method: 'POST' });
        const data = await res.json();
        if (data?.success && data?.data) this.items = data.data; else this.items = [];
      } catch (_) {
        this.items = [];
      }
    },
    getLiveTagClass(tag) {
      if (tag === '受付は終了しました') return 'live-tag-ended';
      return 'live-tag-active';
    }
  },
  watch: {
    visible(val) {
      if (val) this.fetchLive();
    }
  },
  mounted() {
    if (this.visible) this.fetchLive();
  }
}
</script>

<style scoped>
.live-modal {
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

.live-modal-content {
  width: 80vw;
  height: 85vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.live-modal-content::before {
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

.live-header {
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

.live-back-btn {
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

.live-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.back-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.live-title-header {
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin: 0;
  flex: 1;
  text-align: center;
}

.live-close-btn {
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

.live-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.live-body {
  flex: 1;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(15px) saturate(1.5);
  -webkit-backdrop-filter: blur(15px) saturate(1.5);
  overflow-y: auto;
  position: relative;
  z-index: 2;
}

.live-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 100%;
  padding: 20px 0;
  box-sizing: border-box;
}

.live-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.live-item:hover {
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.live-image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
}

.live-item:hover .live-image { transform: scale(1.05); }

.live-info { padding: 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.live-title { font-size: 16px; color: #333; font-weight: 600; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
.live-tag { font-size: 12px; font-weight: 500; padding: 4px 8px; border-radius: 12px; text-align: center; align-self: flex-start; transition: all 0.3s ease; }
.live-tag-active { background: rgba(147, 197, 253, 0.3); color: #3b82f6; border: 1px solid rgba(147, 197, 253, 0.5); }
.live-tag-ended { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
.live-tag-default { background: rgba(156, 163, 175, 0.2); color: #9ca3af; border: 1px solid rgba(156, 163, 175, 0.3); }
.live-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; }
.live-empty-icon { font-size: 64px; margin-bottom: 16px; opacity: 0.6; }
.live-empty-text { font-size: 18px; color: rgba(255, 255, 255, 0.7); font-weight: 500; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); }
.live-item:not(:hover) { animation: subtleGlow 3s ease-in-out infinite; }
</style>


