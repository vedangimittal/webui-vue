<template>
  <b-modal
    id="modal-power-performance-modes"
    ref="modal"
    :title="$t(`pagePower.modalEnablePowerPerformanceMode.title${title}`)"
    @hidden="resetForm"
  >
    <p>
      <strong>
        {{ $t('pagePower.modalEnablePowerPerformanceMode.subTitle') }}
      </strong>
    </p>
    <p>{{ $t('pagePower.modalEnablePowerPerformanceMode.content') }}</p>
    <template #modal-footer="{ cancel }">
      <b-button variant="secondary" @click="cancel()">
        {{ $t('pagePower.modalEnablePowerPerformanceMode.cancelButton') }}
      </b-button>
      <b-button variant="primary" @click="handleSubmit">
        {{ $t(`pagePower.modalEnablePowerPerformanceMode.title${title}`) }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
export default {
  components: {},
  mixins: [VuelidateMixin, BVToastMixin],
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      confirmed: false,
    };
  },
  validations: {
    confirmed: {
      mustBeTrue: (value) => value === true,
    },
  },
  methods: {
    closeModal() {
      this.$nextTick(() => {
        this.$refs.modal.hide();
      });
    },
    handleSubmit() {
      this.$v.$touch();
      this.$emit('ok');
      this.closeModal();
    },
    resetForm() {
      this.confirmed = false;
      this.$v.$reset();
    },
  },
};
</script>
