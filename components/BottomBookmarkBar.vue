<template>
  <div v-if="visible" class="bottom-bookmark-bar" @wheel.prevent="onWheel">
    <div class="bookmark-bar-container">
      <div class="bookmark-bar-scroll" ref="scroll">
        <div 
          v-for="bookmark in bookmarks" 
          :key="bookmark.id" 
          class="bottom-bookmark-item"
          @click="openBookmarkUrl(bookmark.url)"
          :title="bookmark.title"
        >
          <img 
            :src="bookmark.icon" 
            :alt="bookmark.title" 
            class="bottom-bookmark-icon"
            draggable="false"
            @error="handleIconError"
          />
        </div>
        <div v-if="bookmarks.length === 0" class="bookmark-empty-hint">
          <span>暂无书签，请前往工具箱添加</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomBookmarkBar',
  props: {
    visible: { type: Boolean, default: true },
    bookmarks: { type: Array, default: () => [] }
  },
  methods: {
    onWheel(e) {
      const el = this.$refs.scroll;
      if (!el) return;
      const scrollAmount = 120;
      if (e.deltaY > 0) el.scrollLeft += scrollAmount; else el.scrollLeft -= scrollAmount;
    },
    handleIconError(event) { event.target.src = '/utils/collect.png'; },
    openBookmarkUrl(url) { if (url) window.open(url, '_blank'); }
  }
}
</script>

<style scoped>
.bottom-bookmark-bar {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  height: 60px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-sizing: border-box;
  width: 420px;
}

.bookmark-bar-container { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.bookmark-bar-scroll {
  display: flex; align-items: center; gap: 12px; height: 100%; overflow-x: auto; overflow-y: hidden; scroll-behavior: smooth; padding: 0 10px; box-sizing: border-box;
  scrollbar-width: none; -ms-overflow-style: none;
}
.bookmark-bar-scroll::-webkit-scrollbar { display: none; }
.bottom-bookmark-item {
  flex-shrink: 0; width: 40px; height: 40px; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.bottom-bookmark-item:hover { background: rgba(255, 255, 255, 0.3); transform: translateY(-3px) scale(1.08); border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4); }
.bottom-bookmark-icon { width: 24px; height: 24px; border-radius: 4px; filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3)); transition: all 0.3s ease; }
.bottom-bookmark-item:hover .bottom-bookmark-icon { transform: scale(1.1); filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)); }
.bookmark-empty-hint { display: flex; align-items: center; justify-content: center; color: rgba(255, 255, 255, 0.6); font-size: 14px; font-weight: 500; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); white-space: nowrap; }
</style>


