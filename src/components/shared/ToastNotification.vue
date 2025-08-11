<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { computed } from 'vue';

const { isVisible, message, toastType } = useToast()

const toastClasses = computed(() => [
  'toast-notification',
  `toast--${toastType.value}`
]);

const toastIcon = computed(() => {
  switch (toastType.value) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-times-circle';
    default: return 'fa-info-circle';
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div v-if="isVisible" :class="toastClasses">
        <i class="fas" :class="toastIcon"></i>
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.toast-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  color: $white;
  padding: 0.8rem 1.5rem;
  border-radius: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-family: $font-secondary;
  font-weight: 500;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  z-index: 5000;
  transition: all 0.4s ease;
}

.toast--success {
  background-color: rgba($BAKANO-GREEN, 0.9);

  i {
    color: $white;
  }
}

.toast--error {
  background-color: rgba($BAKANO-PINK, 0.9);

  i {
    color: $white;
  }
}

.toast--info {
  background-color: rgba($BAKANO-PURPLE, 0.9);

  i {
    color: $white;
  }
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px) scale(0.9);
}
</style>