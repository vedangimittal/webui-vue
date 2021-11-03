<template>
  <b-row>
    <b-col sm="6" xl="5">
      <page-section
        :section-title="$t('pageCapacityOnDemand.activation.sectionTitle')"
      >
        <b-form class="d-flex align-items-center" @submit.prevent="submitForm">
          <b-form-group
            :label="$t('pageCapacityOnDemand.activation.srLabel')"
            label-for="input-license-key"
            :label-sr-only="true"
            class="mb-0 mr-3 form-group-activation"
          >
            <b-form-text>
              {{ $t('pageCapacityOnDemand.activation.helperText') }}
            </b-form-text>
            <b-input-group class="input-group-activation">
              <b-form-input
                id="input-license-key"
                v-model="licenseKey"
                :state="getValidationState($v.licenseKey)"
                :placeholder="$t('pageCapacityOnDemand.activation.placeholder')"
                @blur="$v.licenseKey.$touch()"
              />
              <b-form-invalid-feedback role="alert">
                {{ $t('global.form.invalidCharacterLength') }}
              </b-form-invalid-feedback>
            </b-input-group>
          </b-form-group>
          <b-button variant="primary" type="submit">
            {{ $t('global.action.activate') }}
          </b-button>
        </b-form>
      </page-section>
    </b-col>
  </b-row>
</template>

<script>
import { maxLength, minLength, required } from 'vuelidate/lib/validators';

import PageSection from '@/components/Global/PageSection';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';

export default {
  name: 'CapacityOnDemandAcvitation',
  components: { PageSection },
  mixins: [VuelidateMixin, BVToastMixin],
  data() {
    return {
      licenseKey: '',
    };
  },
  validations() {
    return {
      licenseKey: {
        required,
        minLength: minLength(34),
        maxLength: maxLength(34),
      },
    };
  },
  methods: {
    submitForm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$store
          .dispatch('licenses/activateLicense')
          .then((success) => this.successToast(success))
          .catch(({ message }) => this.errorToast(message));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.input-group-activation {
  // this is needed to maintain button aligment
  // when there is an error message
  height: 3.75rem;
}
.form-group-activation {
  width: 100%;
}
</style>
