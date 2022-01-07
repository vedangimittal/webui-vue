<template>
  <div>
    <b-modal
      id="modal-firmware-access-key"
      :ok-title="$t('pageFirmware.modal.saveAccessKey')"
      :cancel-title="$t('global.action.cancel')"
      :title="$t('pageFirmware.modal.enterNewAccessKey')"
      @ok.prevent="handleSubmit"
      @cancel="closeModal"
    >
      <p>
        {{ $t('pageFirmware.modal.enterNewAccessKeyInfo') }}
        <a href="www.ibm.com/servers/esserver/ess">
          www.ibm.com/servers/esserver/ess
        </a>
      </p>

      <b-form>
        <b-form-group
          id="firmware-access-key"
          :label="$t('pageFirmware.form.updateFirmware.newAccessKey')"
          label-for="firmware-access-key-input"
        >
          <b-form-text>
            {{ $t('pageCapacityOnDemand.activation.helperText') }}
          </b-form-text>
          <b-form-input
            id="firmware-access-key-input"
            v-model="form.firmwareAccessKey"
            :maxlength="form.maxLength"
            :state="getValidationState($v.form.firmwareAccessKey)"
            :placeholder="$t('pageFirmware.modal.enterNewAccessKey')"
            @blur="$v.form.firmwareAccessKey.$touch()"
          />
          <b-form-invalid-feedback role="alert">
            {{
              !$v.form.firmwareAccessKey.invalidSpaces
                ? $t('global.form.invalidFormat')
                : $t('global.form.invalidCharacterLength')
            }}
          </b-form-invalid-feedback>
        </b-form-group>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { maxLength, minLength, required } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

// Vuelidate custom validator
const invalidSpaces = (value) => !value.includes(' ');

export default {
  name: 'FirmwareModalAccessKey',
  mixins: [VuelidateMixin],
  data() {
    return {
      form: {
        firmwareAccessKey: '',
        minLength: 34,
        maxLength: 34,
      },
    };
  },
  validations() {
    return {
      form: {
        firmwareAccessKey: {
          required,
          minLength: minLength(this.form.minLength),
          maxLength: maxLength(this.form.maxLength),
          invalidSpaces: invalidSpaces,
        },
      },
    };
  },
  methods: {
    handleSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;
      this.$emit('ok', [this.form.firmwareAccessKey]);
      this.closeModal();
    },
    closeModal() {
      this.$nextTick(() => {
        this.form.firmwareAccessKey = '';
        this.$v.$reset();
        this.$bvModal.hide('modal-firmware-access-key');
      });
    },
  },
};
</script>
