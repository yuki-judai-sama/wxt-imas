<template>
  <div v-if="visible" class="add-bookmark-modal" @click="emitClose">
    <div class="add-bookmark-modal-content" :style="backgroundStyle" @click.stop>
      <div class="add-bookmark-header">
        <button class="add-bookmark-back-btn" @click="emitClose" title="返回书签管理">
          <img :src="utils('back.png')" alt="返回" class="back-icon" draggable="false" />
        </button>
        <h2 class="add-bookmark-title-header">新增书签</h2>
      </div>
      <div class="add-bookmark-body">
        <div class="add-bookmark-form">
          <div class="form-group">
            <label class="form-label">网址地址</label>
            <input v-model="model.url" type="url" class="form-input" placeholder="请输入网址，如：https://www.bilibili.com" @input="onUrlInput" @keydown.enter.stop.prevent="emitSave" @keydown.tab.stop.prevent="focusNext" ref="urlInput" />
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <input v-model="model.title" type="text" class="form-input" placeholder="请输入备注，如：哔哩哔哩" maxlength="20" @keydown.enter.stop.prevent="emitSave" @keydown.tab.stop.prevent="focusNext" ref="titleInput" />
          </div>
          <div class="form-group">
            <label class="form-label">图标预览</label>
            <div class="icon-preview">
              <img :src="model.icon" alt="图标预览" class="preview-icon" draggable="false" @error="onIconError" />
            </div>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" @click="emitClose">取消</button>
            <button class="save-btn" @click="emitSave">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { APP_CONFIG } from '/src/utils/appConfig.js'

export default {
  name: 'AddBookmarkForm',
  props: {
    visible: { type: Boolean, default: false },
    backgroundStyle: { type: Object, default: () => ({}) },
    value: { type: Object, default: () => ({ url: '', title: '', icon: '' }) }
  },
  emits: ['close', 'save', 'url-input'],
  data() {
    return { model: { ...this.value } };
  },
  watch: {
    value: { deep: true, handler(v) { this.model = { ...v }; } }
  },
  methods: {
    emitClose() { this.$emit('close'); },
    emitSave() { this.$emit('save', { ...this.model }); },
    onUrlInput() { this.$emit('url-input', this.model.url); },
    onIconError(e) { e.target.src = this.utils('collect.png'); },
    utils(name) { return APP_CONFIG.DEFAULTS.UTILS_IMAGE_URL + name; },
    focusNext(event) {
      // 阻止默认的 Tab 行为
      event.preventDefault();
      event.stopPropagation();
      
      // 根据当前聚焦的输入框，切换到下一个
      if (event.target === this.$refs.urlInput) {
        this.$refs.titleInput.focus();
      } else if (event.target === this.$refs.titleInput) {
        this.$refs.urlInput.focus();
      }
    }
  }
}
</script>

<style scoped>
.add-bookmark-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(12px) saturate(1.5); -webkit-backdrop-filter: blur(12px) saturate(1.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.add-bookmark-modal-content { width: 400px; height: 500px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4); overflow: hidden; display: flex; flex-direction: column; position: relative; }
.add-bookmark-modal-content::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.3); z-index: 1; border-radius: 16px; }
.add-bookmark-header { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px) saturate(1.8); -webkit-backdrop-filter: blur(20px) saturate(1.8); border-bottom: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); padding: 20px 24px; display: flex; align-items: center; border-radius: 16px 16px 0 0; position: relative; z-index: 2; }
.add-bookmark-back-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; cursor: pointer; transition: all 0.3s ease; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 12px; z-index: 10; position: relative; }
.add-bookmark-back-btn:hover { background: rgba(255, 255, 255, 0.2); transform: scale(1.1); }
.add-bookmark-back-btn .back-icon { width: 20px; height: 20px; filter: brightness(0) invert(1); }
.add-bookmark-title-header { color: #fff; font-weight: 600; font-size: 18px; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5); margin: 0; flex: 1; text-align: center; }
.add-bookmark-body { flex: 1; padding: 30px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(15px) saturate(1.5); -webkit-backdrop-filter: blur(15px) saturate(1.5); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; }
.add-bookmark-form { width: 100%; display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { color: #fff; font-size: 14px; font-weight: 500; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); }
.form-input { padding: 12px 16px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: #fff; font-size: 14px; backdrop-filter: blur(10px); transition: all 0.3s ease; }
.form-input:focus { outline: none; border-color: rgba(255, 255, 255, 0.4); background: rgba(255, 255, 255, 0.15); box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1); }
.form-input::placeholder { color: rgba(255, 255, 255, 0.6); }
.icon-preview { display: flex; justify-content: center; align-items: center; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.2); }
.preview-icon { width: 32px; height: 32px; border-radius: 4px; }
.form-actions { display: flex; gap: 12px; margin-top: 20px; }
.cancel-btn, .save-btn { flex: 1; padding: 12px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); }
.cancel-btn { background: rgba(255, 255, 255, 0.1); color: #fff; border: 1px solid rgba(255, 255, 255, 0.2); }
.cancel-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-1px); }
.save-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); }
.save-btn:hover { background: linear-gradient(135deg, #5a6fd8 0%, #6b4c93 100%); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
</style>


