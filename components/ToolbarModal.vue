<template>
  <div v-if="visible" class="toolbar-modal" @click="onClose">
    <div class="toolbar-modal-content" :style="backgroundStyle" @click.stop>
      <div class="toolbar-header">
        <h2 class="toolbar-title-header">工具箱</h2>
        <button class="toolbar-close-btn" @click="onClose">×</button>
      </div>
      <div class="toolbar-body">
        <div class="toolbar-grid">
          <div class="toolbar-row">
            <div class="toolbar-item" v-for="item in items.slice(0, 5)" :key="item.id" @click="onItemClick(item)">
              <div class="toolbar-icon-wrapper">
                <div class="toolbar-icon-circle">
                  <img :src="item.icon" :alt="item.title" class="toolbar-icon-img" draggable="false" />
                </div>
              </div>
              <div class="toolbar-title">{{ item.title }}</div>
            </div>
          </div>

          <div class="toolbar-row">
            <div class="toolbar-item" v-for="item in items.slice(5, 10)" :key="item.id" @click="onItemClick(item)">
              <div class="toolbar-icon-wrapper">
                <div class="toolbar-icon-circle">
                  <img :src="item.icon" :alt="item.title" class="toolbar-icon-img" draggable="false" />
                </div>
              </div>
              <div class="toolbar-title">{{ item.title }}</div>
            </div>
          </div>

          <div class="toolbar-row">
            <div class="toolbar-item" v-for="item in items.slice(10, 15)" :key="item.id" @click="onItemClick(item)">
              <div class="toolbar-icon-wrapper">
                <div class="toolbar-icon-circle">
                  <img :src="item.icon" :alt="item.title" class="toolbar-icon-img" draggable="false" />
                </div>
              </div>
              <div class="toolbar-title">{{ item.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolbarModal',
  props: {
    visible: { type: Boolean, default: false },
    backgroundStyle: { type: Object, default: () => ({}) },
    items: { type: Array, default: () => [] }
  },
  emits: ['close', 'item-click'],
  methods: {
    onClose() {
      this.$emit('close');
    },
    onItemClick(item) {
      this.$emit('item-click', item);
    }
  }
}
</script>

<style scoped>
.toolbar-modal {
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

.toolbar-modal-content {
  width: 75vw;
  height: 80vh;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.toolbar-modal-content::before {
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

.toolbar-header {
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

.toolbar-title-header {
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  margin: 0;
}

.toolbar-close-btn {
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

.toolbar-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.toolbar-body {
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

.toolbar-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 100%;
}

.toolbar-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.toolbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  aspect-ratio: 1.5;
  min-height: 45px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.toolbar-item:hover {
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(22px) saturate(1.8);
  -webkit-backdrop-filter: blur(22px) saturate(1.8);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25), 0 0 20px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.toolbar-icon-wrapper {
  margin-bottom: 4px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-icon-circle {
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.toolbar-item:hover .toolbar-icon-circle {
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(15px) saturate(1.5);
  -webkit-backdrop-filter: blur(15px) saturate(1.5);
  border-color: rgba(255, 255, 255, 1);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.toolbar-icon-img {
  width: 28px;
  height: 28px;
  filter: none;
  transition: all 0.3s ease;
}

.toolbar-item:hover .toolbar-icon-img {
  transform: scale(1.1) rotate(5deg);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.toolbar-title {
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

@keyframes subtleGlow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 8px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
}

.toolbar-item:not(:hover) {
  animation: subtleGlow 3s ease-in-out infinite;
}
</style>


