<template>
  <div ref="selectRef" class="custom-select" :class="{ 'is-open': isOpen, 'is-disabled': disabled }">
    <div class="select-trigger" @click="toggleDropdown">
      <span class="select-value">{{ displayValue }}</span>
      <el-icon class="select-arrow" :class="{ 'is-reverse': isOpen }">
        <ArrowDown />
      </el-icon>
    </div>
    
    <Transition name="dropdown">
      <div 
        v-if="isOpen" 
        ref="dropdownRef"
        class="select-dropdown" 
        :class="{ 'is-upward': isUpward }"
        @click.stop
      >
        <div
          v-for="option in options"
          :key="option.value"
          class="select-option"
          :class="{ 'is-selected': modelValue === option.value }"
          @click="selectOption(option)"
        >
          <span class="option-label">{{ option.label }}</span>
          <el-icon v-if="modelValue === option.value" class="option-check">
            <Check />
          </el-icon>
        </div>
      </div>
    </Transition>
    
    <!-- 点击外部关闭下拉框 -->
    <div v-if="isOpen" class="select-overlay" @click="closeDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'

interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const isOpen = ref(false)
const isUpward = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const selectRef = ref<HTMLElement | null>(null)

const displayValue = computed(() => {
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option ? option.label : props.placeholder
})

const calculatePosition = () => {
  if (!selectRef.value || !dropdownRef.value) return
  
  nextTick(() => {
    const rect = selectRef.value!.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom - 10 // 留10px边距
    const spaceAbove = rect.top - 10
    
    // 优先向下展开，只有在下方空间严重不足（小于150px）且上方空间明显更大时才向上展开
    if (spaceBelow < 150 && spaceAbove > spaceBelow + 100) {
      isUpward.value = true
    } else {
      // 默认向下展开
      isUpward.value = false
    }
  })
}

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    calculatePosition()
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  closeDropdown()
}

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.custom-select')) {
    closeDropdown()
  }
}

// 监听窗口大小变化，重新计算位置
watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      calculatePosition()
    })
  }
})

// 监听窗口滚动和大小变化
const handleResize = () => {
  if (isOpen.value) {
    calculatePosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize, true)
})
</script>

<style lang="scss" scoped>
.custom-select {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(30, 30, 60, 0.9) 0%, rgba(20, 20, 40, 0.9) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  min-height: 40px;
  
  &:hover {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, rgba(40, 40, 80, 0.95) 0%, rgba(30, 30, 60, 0.95) 100%);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  
  .select-value {
    color: var(--text-primary);
    font-size: var(--text-sm);
    font-weight: 500;
    flex: 1;
    text-align: left;
  }
  
  .select-arrow {
    color: var(--text-secondary);
    font-size: 16px;
    transition: transform var(--transition-fast);
    margin-left: 8px;
    flex-shrink: 0;
    
    &.is-reverse {
      transform: rotate(180deg);
    }
  }
}

.custom-select.is-open {
  .select-trigger {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(59, 130, 246, 0.15);
    background: linear-gradient(135deg, rgba(50, 50, 100, 0.98) 0%, rgba(40, 40, 80, 0.98) 100%);
    
    .select-arrow {
      color: var(--color-primary);
    }
  }
}

.custom-select.is-disabled {
  .select-trigger {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      border-color: var(--border-color);
      box-shadow: none;
    }
  }
}

.select-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
}

.select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  bottom: auto;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(20px);
  padding: 6px;
  z-index: 999;
  max-height: 300px;
  overflow-y: auto;
  
  &.is-upward {
    top: auto;
    bottom: calc(100% + 4px);
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(59, 130, 246, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(59, 130, 246, 0.5);
    }
  }
}

.select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin: 2px 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    background: var(--color-primary);
    border-radius: 0 2px 2px 0;
    transition: height var(--transition-fast);
  }
  
  &:hover {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%);
    padding-left: 18px;
    
    &::before {
      height: 60%;
    }
    
    .option-label {
      color: var(--text-primary);
    }
  }
  
  &.is-selected {
    background: linear-gradient(90deg, rgba(59, 130, 246, 0.25) 0%, rgba(59, 130, 246, 0.1) 100%);
    padding-left: 18px;
    
    &::before {
      height: 80%;
      background: var(--color-primary);
    }
    
    .option-label {
      color: var(--color-primary);
      font-weight: 600;
    }
    
    .option-check {
      color: var(--color-primary);
    }
  }
  
  .option-label {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    transition: color var(--transition-fast);
    flex: 1;
  }
  
  .option-check {
    color: var(--color-primary);
    font-size: 16px;
    margin-left: 8px;
    flex-shrink: 0;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all var(--transition-normal);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>

