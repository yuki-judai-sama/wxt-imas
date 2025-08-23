<template>
  <div class="mainStyle" :style="mainStyle">
    <!--********************************************************************************************************************************-->
    <!--导航条-->
    <el-menu mode="horizontal" :style="menuStyle" :ellipsis="false">
      <!--默认Logo-->
      <el-menu-item index="logo" @click="openMemberLink(0)">
        <img
            style="max-height: 100%; height: auto; width: auto;"
            src="/icon/学マス-logo.png"
            draggable="false"
        />
      </el-menu-item>
      <!--循环头像-->
      <el-menu-item
          v-for="(member, index) in members"
          :key="member.name"
          :index="String(index + 1)"
          @click="openMemberLink(index + 1)"
      >
        <el-avatar :src="`/idol/headImg/${member.name}.png`" @dragstart.prevent/>
      </el-menu-item>
      <el-menu-item index="memberTwitterContent" style="margin-left: auto" @click="this.memberDrawerVisible=true">
        <el-button type="primary" plain round>成员动态</el-button>
      </el-menu-item>
    </el-menu>
    <!--********************************************************************************************************************************-->
    <!--搜索输入框-->
    <div class="inputStyle">
      <el-input
          v-model="searchValue"
          style="width: 400px; --el-input-height: 35px;"
          size="large"
          placeholder="Enter键搜索,Tab键切换搜索引擎"
          ref="searchInput"
      >
        <!--输入框图标-->
        <template #prefix>
          <img
              :src="`/icon/${searchEngines[searchIconIndex].name}.png`"
              :style="{ height: '25px', width: '25px' }"
              draggable="false"
          />
        </template>
      </el-input>
    </div>
    <!--********************************************************************************************************************************-->
    <!--主题选择器-->
    <div class="memberSelectStyle">
      <el-select v-model="selectMember" style="width: 150px;" @change="changeMemberTheme" placeholder="选择成员">
        <el-option
            v-for="item in members"
            :key="item.name"
            :label="item.name"
            :value="item.name"
        >
          <div style="display: flex; align-items: center;">
            <img
                :src="`/idol/headImg/${item.name}.png`"
                alt="avatar"
                style="height: 25px; width: 25px; border-radius: 50%; margin-right: 8px;"
                draggable="false"
            />
            <span>{{ item.name }}</span>
          </div>
        </el-option>
      </el-select>
    </div>
    <!--********************************************************************************************************************************-->
    <!-- 推文抽屉 -->
    <el-drawer
        v-model="memberDrawerVisible"
        title="成员动态"
        direction="rtl"
        size="30%"
        :header-style="{ padding: '4px 16px', fontSize: '16px', fontWeight: 'bold' }"
        :body-style="{ padding: '0' }"
    >
      <!-- 成员头像筛选器 -->
      <div style="padding: 0px 16px 4px 16px; border-bottom: 1px solid #eee;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          <!-- 循环显示所有成员头像 -->
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
      thisWebWidth: 0,                          //当前页面宽度
      thisWebHeight: 0,                         //当前页面高度

      selectMember: localStorage.getItem('defaultMember') || DEFAULT_MEMBER,  //默认选择成员

      searchValue: null,                        //搜索框输入内容
      searchIconIndex: 0,                       //搜索框默认图标下标

      twitterContent: [],                       //推文内容
      memberDrawerVisible: false,                //推文抽屉
      selectedFilterMember: null,               //当前筛选的成员
      filteredTwitterContent: [],               //筛选后的推文内容
      imageLoadErrors: {}                       // 用于跟踪图片加载失败
    };
  },
  methods: {
    //键盘监听
    async keyDown(e) {
      //tab键切换搜索图标
      if (e.key === "Tab") {
        e.preventDefault(); //阻止默认切换焦点行为
        this.searchIconIndex = (this.searchIconIndex + 1) % this.searchEngines.length;
      }
      //回车键触发搜索
      else if (e.key === "Enter") {
        await this.searchContent(this.searchValue);
      }
    },
    //搜索内容
    async searchContent(value){
      //获取对应的搜索引擎URL模板
      const urlTemplate = this.searchEngines[this.searchIconIndex].urlTemplate;
      //用 encodeURIComponent 对搜索内容编码，防止特殊字符导致URL错误
      const encodedValue = encodeURIComponent(value);
      //替换 %keyword% 为编码后的搜索内容
      const searchUrl = urlTemplate.replace('%keyword%', encodedValue);

      window.open(searchUrl, '_blank');
    },
    //打开成员推特链接
    openMemberLink(index) {
      if (index === 0) {
        window.open('https://x.com/gkmas_official', '_blank');
      } else {
        window.open(this.members[index - 1].link, '_blank');
      }
    },
    //变更成员主题
    async changeMemberTheme(selected) {
      this.selectMember = selected;
      this.selectMemberThemeIndex = this.members.findIndex(m => m.name === selected);

      // 保存用户选择到localStorage
      localStorage.setItem('defaultMember', selected);
    },
    //推文转换链接
    convertLinks(text) {
      // 先转义HTML字符
      let processedText = text
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');

      // 先处理链接，避免与话题标签冲突
      processedText = processedText.replace(/(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)/g, (match, url) => {
        return `<a href="${url}" target="_blank" style="color: #409EFF;">${url}</a>`;
      });

      // 再处理话题标签，但排除已经是链接的部分
      processedText = processedText.replace(/#([a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+)(?![^<]*<\/a>)/g, (match, hashtag) => {
        return `<a href="https://x.com/search?q=%23${hashtag}" target="_blank" style="color: #409EFF;">#${hashtag}</a>`;
      });

      return processedText;
    },
    //推文转换时间
    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    //鼠标点击特效
    async clickBubbling(){
      (function () {
        //初始第一次点击的下标
        let a_idx = 0;
        window.onclick = function (event) {
          //使用配置文件中的文字数组
          let array = CLICK_EFFECT_TEXTS;

          //创建b元素
          let heart = document.createElement("b");

          //防止拖动
          heart.onselectstart = function (event) {
            event.preventDefault();
          };

          //将b元素添加到页面上
          document.body.appendChild(heart).innerHTML = array[a_idx];

          //根据数组长度生成随机数
          let randomNum=Math.floor(Math.random()*array.length)

          //选中需要渲染的文字
          a_idx = (a_idx + randomNum) % array.length;

          //给p元素设置样式
          heart.style.cssText = "position: fixed;left:-100%;";
          let f = 16,                      // 字体大小
              x = event.clientX - f / 2,   // 横坐标
              y = event.clientY - f,       // 纵坐标
              c = randomColor(),           // 随机颜色
              a = 0.75,                    // 透明度
              s = 1.2;                     // 放大缩小

          //添加定时器
          let timer = setInterval(function () {
            if (a <= 0) {
              document.body.removeChild(heart);
              clearInterval(timer);
            } else {
              heart.style.cssText = "font-size:16px;cursor: default;position: fixed;color:" +
                  c + ";left:" + x + "px;top:" + y + "px;opacity:" + a + ";transform:scale(" +
                  s + ");";
              y--;
              a -= 0.016;
              s += 0.002;
            }
          }, 15)
        }
        // 随机成员颜色
        function randomColor() {
          const randomIndex = Math.floor(Math.random() * members.length);
          const hex = members[randomIndex].color;
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          return `rgb(${r}, ${g}, ${b})`;
        }
      }());
    },
    // 获取头像名称
    getAvatarName(memberTwitter) {
      // 如果是官方账号，返回官方头像
      if (memberTwitter.toLowerCase() === OFFICIAL_ACCOUNT.toLowerCase()) {
        return OFFICIAL_AVATAR;
      }
      // 否则查找成员头像
      const member = this.members.find(m => m.twitter.toLowerCase() === memberTwitter.toLowerCase());
      if (member) {
        return member.name;
      }
      // 如果找不到对应的成员，返回默认头像
      return 'default';
    },
    // 自动拉取推文
    async getTwitterContent(){
      $axios.post('/TwitterController/getTwitterContent').then(res=>{
        this.twitterContent = res.data
        this.filterByMember(null) // 初始化筛选为全部
      }).catch(err=>{
        console.error('获取推文数据失败:', err)
      })
    },
    //筛选推文
    filterByMember(memberName) {
      this.selectedFilterMember = memberName;
      if (memberName) {
        // 根据成员名字找到对应的twitter用户名
        const member = this.members.find(m => m.name === memberName);
        if (member) {
          // 使用twitter字段来筛选推文
          this.filteredTwitterContent = this.twitterContent.filter(tweet =>
              tweet.member.toLowerCase() === member.twitter.toLowerCase()
          );
        } else {
          this.filteredTwitterContent = [];
        }
      } else {
        // 显示所有成员推文
        this.filteredTwitterContent = this.twitterContent;
      }
    },
    //切换成员筛选
    toggleMemberFilter(memberName) {
      if (this.selectedFilterMember === memberName) {
        this.filterByMember(null); // 点击同一成员头像，显示全部推文
      } else {
        this.filterByMember(memberName); // 点击不同成员头像，显示该成员推文
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
    }
  },
  mounted() {
    this.thisWebWidth = document.documentElement.clientWidth;
    this.thisWebHeight = document.documentElement.clientHeight;

    //监听全局键盘事件
    window.addEventListener("keydown", this.keyDown);
    //鼠标点击特效
    this.clickBubbling();
    //自动拉取推文
    this.getTwitterContent();
  },
  //销毁全局监听事件
  beforeUnmount() {
    window.removeEventListener("keydown", this.keyDown);
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
    //实时计算当前成员所处下标
    selectMemberThemeIndex() {
      return this.members.findIndex(m => m.name === this.selectMember);
    },
    //动态主题样式
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
    //动态导航样式
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

.memberSelectStyle {                /*选择成员主题级联选择器样式*/
  position: fixed;
  bottom: 20px;        /* 距离底部20px */
  left: 20px;          /* 距离左边20px */
  transform: none;     /* 取消水平居中 */
}
::v-deep(.el-menu--horizontal) {    /*删除menu自带外边框*/
  border-bottom: none !important;
  box-shadow: none !important;
}
.inputStyle {   /*输入框样式*/
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
::v-deep(.el-avatar) {    /*全局avatar样式*/
  background-color: transparent !important;
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
