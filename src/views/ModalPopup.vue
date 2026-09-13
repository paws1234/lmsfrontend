<template>
  <!--
    A confirmation dialog.  Before this it was three divs: no `role="dialog"`,
    no way out with the keyboard, and focus stayed wherever it was behind the
    overlay, so a screen reader never learned a question had been asked.

    `@click.self` on the backdrop is what makes "click outside to dismiss" work
    without also firing when the click started inside the panel.
  -->
  <div
    v-if="isVisible"
class="modal" @click.self="cancelAction" @keydown.esc="cancelAction"
  >
    <div ref="panel" class="modal__panel" role="dialog" aria-modal="true" :aria-labelledby="titleId"
      :aria-describedby="message ? messageId : null" tabindex="-1">
      <h2 :id="titleId" class="modal__title">{{ title }}</h2>

      <p v-if="message" :id="messageId" class="modal__body">{{ message }}</p>

      <!-- Lets a caller put richer content in the dialog (a form, a table)
           without this component knowing what it is. -->
      <div v-if="$slots.default" class="modal__body">
        <slot />
      </div>

      <div class="modal__actions">
        <button
ref="confirmButton" type="button" class="btn"
          :class="tone === 'danger' ? 'btn-secondary' : 'btn-primary'"
          @click="confirmAction"
        >
          {{ confirmLabel }}
        </button>
        <!-- Omitted for a dialog that only reports something: a "Cancel" next
             to a "Close" would be two ways to do the same thing. -->
        <button
v-if="cancelLabel" type="button" class="btn btn-ghost"
          @click="cancelAction"
        >
          {{ cancelLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
let uid = 0;

export default {
  name: "ModalPopup",
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Confirm",
    },
    message: {
      type: String,
      default: "",
    },
    /** Label for the confirming action, e.g. "Delete". */
    confirmLabel: {
      type: String,
      default: "Confirm",
    },
    cancelLabel: {
      type: String,
      // An empty string hides the cancelling button — see the template.
      default: "Cancel",
    },
    /**
     * `"danger"` colours the confirming button red — correct for a deletion,
     * which is what every caller does today.  Kept explicit rather than
     * inferred from the label, so a future non-destructive confirm is a
     * one-word change at the call site instead of a guess here.
     */
    tone: {
      type: String,
      default: "primary",
      validator: (value) => ["primary", "danger"].includes(value),
    },
  },
  emits: ["confirm", "cancel"],
  data() {
    return {
      // Ids must be unique per instance: two dialogs on one page would
      // otherwise both be "labelled by" the same heading.
      titleId: `modal-title-${(uid += 1)}`,
      messageId: `modal-message-${uid}`,
    };
  },
  watch: {
    isVisible(isOpen) {
      if (isOpen) {
        this.onOpen();
      } else {
        this.onClose();
      }
    },
  },
  beforeUnmount() {
    // A dialog can be unmounted while open (the parent re-renders on a failed
    // request); without this the page would stay scroll-locked forever.
    this.onClose();
  },
  methods: {
    onOpen() {
      // Remember what had focus so it can be given back on close.  Without
      // this, dismissing the dialog drops focus to the top of the document.
      this.previouslyFocused = document.activeElement;
      this.lockScroll(true);
      // Wait for the panel to exist before moving focus into it.
      this.$nextTick(() => {
        const target = this.$refs.confirmButton || this.$refs.panel;
        if (target) target.focus();
      });
    },
    onClose() {
      this.lockScroll(false);
      const previous = this.previouslyFocused;
      this.previouslyFocused = null;
      if (previous && typeof previous.focus === "function") previous.focus();
    },
    lockScroll(locked) {
      document.body.style.overflow = locked ? "hidden" : "";
    },
    confirmAction() {
      this.$emit("confirm");
    },
    cancelAction() {
      this.$emit("cancel");
    },
  },
};
</script>

<style scoped></style>
