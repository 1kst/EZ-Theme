<template>
  <transition name="slash-fade">
    <div v-if="visible" class="slash-overlay" @click.self="handleMaskClick">
      <div class="slash-container">
        <!-- 成功状态 -->
        <div v-if="isCompleted" class="success-content">
          <div class="congrats-icon">🎉</div>
          <h2 class="title">恭喜达成！</h2>
          <p class="desc">您已成功解锁 5 折优惠券</p>
          
          <div class="coupon-box" @click="copyCoupon">
            <div class="coupon-label">优惠码</div>
            <div class="coupon-code-row">
              <span class="code">{{ couponCode }}</span>
              <div class="copy-btn">
                <IconCopy :size="18" />
                <span>复制</span>
              </div>
            </div>
          </div>
          
          <p class="tip">请在支付时输入此代码使用</p>
          
          <button class="btn-primary" @click="handleClose">
            立即使用
          </button>
        </div>

        <!-- 砍刀状态 -->
        <div v-else class="slash-content">
          <div class="header-decoration">
            <div class="discount-badge">50% OFF</div>
          </div>
          
          <h2 class="title">{{ title }}</h2>
          <p class="subtitle" v-html="formattedSubtitle"></p>
          
          <div class="progress-wrapper">
            <div class="progress-info">
              <span>已砍 {{ currentCount }} 刀</span>
              <span>目标 {{ targetCount }} 刀</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar" :style="{ width: progressPercentage + '%' }">
                <div class="progress-glare"></div>
              </div>
            </div>
            <div v-if="timeDisplay" class="countdown-wrapper">
              <span class="countdown-label">任务倒计时</span>
              <span class="countdown-time">{{ timeDisplay }}</span>
            </div>
          </div>
          
          <div class="slash-action-area">
             <button 
              class="btn-slash" 
              @click="doSlash"
            >
              <span class="btn-icon">⚡</span>
              <span class="btn-text">{{ buttonText }}</span>
            </button>
            <p class="slash-tip">{{ footerTip }}</p>
          </div>
          
          <!-- 飘字动画容器 -->
          <div class="float-text-container">
            <transition-group name="float-up">
              <div v-for="item in floatItems" :key="item.id" class="float-item" :style="{ left: item.left + '%' }">
                {{ item.text }}
              </div>
            </transition-group>
          </div>
        </div>
        
        <button class="close-icon-btn" @click="handleClose">
          <IconX :size="20" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { IconCopy, IconX } from '@tabler/icons-vue';
import { useToast } from '@/composables/useToast';

export default {
  name: 'SlashPopup',
  components: {
    IconCopy,
    IconX
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    couponCode: {
      type: String,
      default: 'HAPPY50'
    },
    targetCount: {
      type: Number,
      default: 10
    },
    initialCount: {
      type: Number,
      default: 0
    },
    inviteLink: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '助力砍价赢折扣'
    },
    subtitle: {
      type: String,
      default: '仅需完成 {target} 刀，即可领取半价优惠！'
    },
    buttonText: {
      type: String,
      default: '邀请好友助力'
    },
        footerTip: {
          type: String,
          default: '每邀请一位好友注册（3天内），进度 +1'
        },
        countdownSeconds: {
          type: Number,
          default: 0
        }
      },
      emits: ['update:modelValue', 'completed'],
      setup(props, { emit }) {
        const { showToast } = useToast();
        const currentCount = ref(props.initialCount);
        const localRemainingSeconds = ref(props.countdownSeconds);
        let timer = null;
        
        // 格式化时间 HH:MM:SS
        const timeDisplay = computed(() => {
          if (localRemainingSeconds.value <= 0) return '';
          const h = Math.floor(localRemainingSeconds.value / 3600);
          const m = Math.floor((localRemainingSeconds.value % 3600) / 60);
          const s = localRemainingSeconds.value % 60;
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        });
    
        watch(() => props.countdownSeconds, (newVal) => {
          localRemainingSeconds.value = newVal;
          startCountdown();
        });
    
        const startCountdown = () => {
          if (timer) clearInterval(timer);
          if (localRemainingSeconds.value <= 0) return;
          
          timer = setInterval(() => {
            if (localRemainingSeconds.value > 0) {
              localRemainingSeconds.value--;
            } else {
              clearInterval(timer);
            }
          }, 1000);
        };
    
    const formattedSubtitle = computed(() => {
      return props.subtitle.replace('{target}', props.targetCount);
    });

    watch(() => props.initialCount, (newVal) => {
      currentCount.value = newVal;
    });
    
    const isSlashing = ref(false);
    const floatItems = ref([]);
    const floatIdCounter = ref(0);
    
    const visible = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    const isCompleted = computed(() => {
      return currentCount.value >= props.targetCount;
    });

    const progressPercentage = computed(() => {
      return Math.min((currentCount.value / props.targetCount) * 100, 100);
    });

    onMounted(() => {
      if (props.initialCount === 0) {
        const savedProgress = localStorage.getItem('slash_activity_progress');
        if (savedProgress) {
          currentCount.value = parseInt(savedProgress, 10);
        }
      } else {
        currentCount.value = props.initialCount;
      }
    });

    const doSlash = () => {
      if (isCompleted.value) return;
      
      if (!props.inviteLink) {
        showToast('邀请链接加载中，请稍后再试', 'warning');
        return;
      }

      // 执行复制
      navigator.clipboard.writeText(props.inviteLink)
        .then(() => {
          showToast('已复制邀请链接，快发送给您的好友吧！', 'success', 5000);
        })
        .catch(() => {
          // 后备方案
          const textarea = document.createElement('textarea');
          textarea.value = props.inviteLink;
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            showToast('已复制邀请链接，快发送给您的好友吧！', 'success', 5000);
          } catch (err) {
            showToast('复制失败，请手动前往邀请页面复制', 'error');
          }
          document.body.removeChild(textarea);
        });
    };

    const addFloatText = () => {
      const texts = ['手气真好！', '砍掉了！', '加油！', '离成功不远了！', '刀法精准！'];
      const text = texts[Math.floor(Math.random() * texts.length)];
      const id = floatIdCounter.value++;
      floatItems.value.push({ id, text, left: 20 + Math.random() * 60 });
      setTimeout(() => { floatItems.value = floatItems.value.filter(item => item.id !== id); }, 1500);
    };

    const copyCoupon = () => {
      navigator.clipboard.writeText(props.couponCode)
        .then(() => { showToast('优惠码已复制', 'success'); })
        .catch(() => { showToast('复制失败，请手动复制', 'error'); });
    };

    const handleClose = () => { visible.value = false; };
    const handleMaskClick = () => { visible.value = false; };

    return {
      visible, currentCount, isCompleted, progressPercentage, isSlashing, doSlash, copyCoupon, handleClose, handleMaskClick, floatItems,
      timeDisplay
    };
  }
};
</script>

<style lang="scss" scoped>
.countdown-wrapper {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  
  .countdown-label {
    color: var(--secondary-text-color);
  }
  
  .countdown-time {
    color: #ff4d4f;
    font-weight: bold;
    font-family: monospace;
    background: rgba(255, 77, 79, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
    letter-spacing: 1px;
  }
}

.slash-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
  background-color: rgba(0, 0, 0, 0.5); 
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.slash-container {
  width: 100%; max-width: 380px; 
  background: var(--card-background) !important;
  color: var(--text-color) !important;
  border-radius: 20px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); padding: 30px 20px; position: relative; text-align: center; overflow: hidden; animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid var(--border-color);
  &::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%); }
}

.close-icon-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--secondary-text-color); cursor: pointer; padding: 5px; border-radius: 50%; transition: all 0.2s; &:hover { background-color: rgba(var(--theme-color-rgb), 0.1); color: var(--text-color); } }
.title { margin: 10px 0 5px; color: var(--text-color); font-size: 24px; font-weight: 800; }
.subtitle { color: var(--secondary-text-color); font-size: 14px; margin-bottom: 25px; }

.success-content {
  .congrats-icon { font-size: 48px; margin-bottom: 10px; animation: bounce 1s infinite; }
  .desc { color: #4caf50; font-weight: 600; margin-bottom: 20px; }
  .coupon-box {
    background-color: rgba(var(--theme-color-rgb), 0.05); border: 2px dashed var(--theme-color); border-radius: 12px; padding: 15px; margin-bottom: 20px; cursor: pointer; transition: transform 0.2s;
    &:hover { transform: scale(1.02); background-color: rgba(var(--theme-color-rgb), 0.1); }
    .coupon-label { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 5px; text-align: left; }
    .coupon-code-row { display: flex; justify-content: space-between; align-items: center; .code { font-family: monospace; font-size: 24px; font-weight: bold; color: var(--theme-color); letter-spacing: 2px; } .copy-btn { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--theme-color); font-weight: 600; } }
  }
  .tip { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 20px; }
}

.btn-primary { width: 100%; padding: 12px; background: linear-gradient(90deg, var(--theme-color), var(--theme-hover-color)); color: white; border: none; border-radius: 25px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 15px rgba(var(--theme-color-rgb), 0.3); transition: all 0.2s; &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(var(--theme-color-rgb), 0.4); } }
.header-decoration { margin-bottom: 15px; .discount-badge { display: inline-block; background: #ff4d4f; color: white; padding: 5px 15px; border-radius: 20px 0 20px 0; font-weight: bold; font-size: 18px; box-shadow: 0 4px 10px rgba(255, 77, 79, 0.3); animation: pulse 2s infinite; } }
.progress-wrapper { margin-bottom: 30px; .progress-info { display: flex; justify-content: space-between; font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px; } }
.progress-container {
  height: 16px; background-color: var(--border-color); border-radius: 10px; overflow: hidden; position: relative;
  .progress-bar {
    height: 100%; background: linear-gradient(90deg, #ff9c6e, #ff4d4f); border-radius: 10px; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
    .progress-glare { position: absolute; top: 0; left: 0; bottom: 0; width: 100%; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); transform: translateX(-100%); animation: shimmer 1.5s infinite; }
  }
}
.slash-action-area {
  position: relative; z-index: 10;
  .btn-slash { width: 80%; height: 60px; border: none; border-radius: 30px; background: linear-gradient(to bottom, #ff7875, #ff4d4f); color: white; font-size: 20px; font-weight: bold; cursor: pointer; box-shadow: 0 6px 0 #cf1322, 0 15px 20px rgba(255, 77, 79, 0.3); transition: all 0.1s; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; position: relative; overflow: hidden; .btn-icon { margin-right: 8px; font-size: 24px; } &:active:not(:disabled) { transform: translateY(6px); box-shadow: 0 0 0 #cf1322, 0 5px 10px rgba(255, 77, 79, 0.3); } }
  .slash-tip { font-size: 12px; color: var(--secondary-text-color); }
}
.float-text-container { position: absolute; top: 50%; left: 0; width: 100%; height: 0; pointer-events: none; .float-item { position: absolute; bottom: 0; color: #ff4d4f; font-weight: bold; font-size: 16px; text-shadow: 0 1px 2px rgba(255,255,255,0.8); transform: translateX(-50%); } }
@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.float-up-enter-active { transition: all 1s ease-out; } .float-up-enter-from { opacity: 0; transform: translate(-50%, 20px) scale(0.5); } .float-up-enter-to { opacity: 1; transform: translate(-50%, 0) scale(1); } .float-up-leave-active { transition: all 0.5s ease-in; } .float-up-leave-to { opacity: 0; transform: translate(-50%, -50px); }
.slash-fade-enter-active, .slash-fade-leave-active { transition: opacity 0.3s ease; } .slash-fade-enter-from, .slash-fade-leave-to { opacity: 0; }
</style>