<script setup lang="ts">
import { useConfirmationDialog } from '@/composables/useConfirmationDialog';

// Obtenemos todo lo que necesitamos, incluyendo la nueva configuración de selección
const {
  isVisible,
  title,
  message,
  confirm,
  cancel,
  confirmationText,
  userInput,
  isConfirmationMet,
  selectionConfig,
  selectedValue,
} = useConfirmationDialog();
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isVisible" class="dialog-overlay" @mousedown.self="cancel">
        <Transition name="pop" appear>
          <div v-if="isVisible" class="dialog-panel" role="alertdialog" aria-modal="true" :aria-labelledby="title">
            <h3 class="dialog-title" :id="title">{{ title }}</h3>
            <p class="dialog-message" v-html="message"></p>

            <div v-if="selectionConfig" class="selection-area">
              <label class="selection-label">{{ selectionConfig.label }}</label>
              <div class="selection-options">
                <div v-for="item in selectionConfig.items" :key="item[selectionConfig.valueField]" class="selection-option" @click="selectedValue = item[selectionConfig.valueField]">
                  <input
                    type="radio"
                    :id="item[selectionConfig.valueField]"
                    :value="item[selectionConfig.valueField]"
                    v-model="selectedValue"
                  >
                  <label :for="item[selectionConfig.valueField]">{{ item[selectionConfig.displayField] }}</label>
                </div>
              </div>
            </div>

            <div v-if="confirmationText" class="confirmation-input-area">
              <label :for="confirmationText">
                Para confirmar, escribe "<strong>{{ confirmationText }}</strong>":
              </label>
              <input
                :id="confirmationText"
                type="text"
                v-model="userInput"
                class="confirmation-input"
                autocomplete="off"
                autocapitalize="off"
              />
              <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>

            <div class="dialog-actions">
              <button @click="cancel" class="btn btn-secondary">Cancelar</button>
              <button
                @click="confirm"
                class="btn btn-primary"
                :disabled="!isConfirmationMet"
              >
                Confirmar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/styles/index.scss' as *;

.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  background-color: rgba($BAKANO-DARK, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dialog-panel {
  font-family: $font-secondary;
  background: $white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba($white, 0.2);
  width: 90%;
  max-width: 420px;
  text-align: center;
}

.dialog-title {
  font-family: $font-principal;
  font-weight: 700;
  font-size: 1.3rem;
  color: $BAKANO-DARK;
  margin: 0 0 0.75rem 0;
}

.dialog-message {
  color: rgba($BAKANO-DARK, 0.7);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0; // Se quita el margen inferior para dar espacio a las nuevas secciones
}

// ARREGLO 3: Estilos para la nueva área de selección
.selection-area {
  margin: 1.5rem 0;
  text-align: left;
}

.selection-label {
  font-size: 0.9rem;
  font-weight: 600;
  font-family: $font-principal;
  color: $BAKANO-DARK;
  display: block;
  margin-bottom: 0.75rem;
}

.selection-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 0.5rem; // Espacio para el scrollbar
}

.selection-option {
  display: flex;
  align-items: center;
  background-color: lighten($BAKANO-LIGHT, 3%);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid $BAKANO-LIGHT;
  cursor: pointer;
  transition: all 0.2s ease;

  &:has(input:checked) {
    border-color: $BAKANO-PURPLE;
    background-color: $overlay-purple;
  }

  input[type="radio"] {
    margin-right: 0.75rem;
    accent-color: $BAKANO-PURPLE;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  label {
    font-family: $font-secondary;
    cursor: pointer;
    flex-grow: 1;
  }
}

.confirmation-input-area {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: lighten($BAKANO-PINK, 42%);
  border-radius: 8px;
  text-align: center;

  label {
    font-size: 0.9rem;
    color: $BAKANO-DARK;
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
}

.confirmation-input {
  width: 90%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid lighten($BAKANO-PINK, 25%);
  font-size: 1rem;
  text-align: center;
  font-family: $font-secondary;
  background: $white;

  &:focus {
    outline: none;
    border-color: $BAKANO-PINK;
    box-shadow: 0 0 0 3px rgba($BAKANO-PINK, 0.2);
  }
}

.warning-text {
  font-weight: 600;
  text-align: center;
  font-size: 0.8rem;
  color: $BAKANO-PINK;
  margin-top: 0.75rem;
  margin-bottom: 0;
}

.dialog-actions {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.5rem;
}

.btn {
  font-family: $font-principal;
  font-weight: 600;
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background-color: $BAKANO-LIGHT;
    color: rgba($BAKANO-DARK, 0.4);
    cursor: not-allowed;
  }
}

.btn-primary {
  background-color: $BAKANO-PINK;
  color: $white;
}

.btn-secondary {
  background-color: transparent;
  color: $BAKANO-DARK;
  box-shadow: inset 0 0 0 1px $BAKANO-LIGHT;

  &:hover:not(:disabled) {
    background-color: $BAKANO-LIGHT;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.pop-leave-active {
  transition: all 0.2s ease-in-out;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@media (min-width: 500px) {
  .dialog-panel {
    padding: 2.5rem;
  }

  .dialog-actions {
    flex-direction: row;
    justify-content: center;

    .btn {
      width: auto;
      min-width: 120px;
    }
  }
}
</style>