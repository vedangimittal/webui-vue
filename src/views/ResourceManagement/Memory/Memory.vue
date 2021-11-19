<template>
  <b-container fluid="xl">
    <page-title />
    <b-row>
      <b-col md="8" xl="6">
        <alert variant="info" class="mb-4">
          <div class="font-weight-bold">
            {{ $t('pageMemory.alert.heading') }}
          </div>
          <div>
            {{ $t('pageMemory.alert.message') }}
          </div>
        </alert>
      </b-col>
    </b-row>
    <page-section
      :section-title="$t('pageMemory.logicalMemorySize')"
      class="mb-4"
    >
      <b-row>
        <b-col md="8" xl="6">
          <p>{{ $t('pageMemory.logicalMemorySizeHeading') }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="8" xl="6">
          <b-form novalidate @submit.prevent="handleSubmit">
            <b-form-group
              :label="$t('pageMemory.memoryBlockSize')"
              label-for="logical-memory-size-option"
              class="mb-3"
            >
              <b-form-select
                id="logical-memory-size-option"
                v-model="form.logicalMemorySizeOption"
                :options="logicalMemorySizeOptions"
              >
              </b-form-select>
            </b-form-group>
            <b-button variant="primary" type="submit" class="mt-3 mb-3">
              {{ $t('pageMemory.updateLogicalMemorySize') }}
            </b-button>
          </b-form>
        </b-col>
      </b-row>
    </page-section>
    <div class="section-divider mb-3 mt-3"></div>
    <page-section
      :section-title="$t('pageMemory.ioApdapterEnlargedCapacityTitle')"
    >
      <b-row>
        <b-col md="8" xl="6">
          <p>{{ $t('pageMemory.ioApdapterEnlargedCapacity') }}</p>
        </b-col>
      </b-row>
      <b-row>
        <b-col md="8" xl="6">
          <b-form @submit.prevent="updateAdapterCapacity()">
            <b-form-group
              :label="$t('pageMemory.slotCountForNode0')"
              label-for="io-adapter-enlarged-capacity"
              class="mb-3"
            >
              <b-form-input
                id="input-io-adapter-capacity"
                v-model.number="ioAdapterCapacity"
                data-test-id="io-adapter-capacity"
                type="number"
                :state="getValidationState($v.ioAdapterCapacity)"
              ></b-form-input>
              <b-form-invalid-feedback role="alert">
                <template
                  v-if="
                    !$v.ioAdapterCapacity.minLength ||
                    !$v.ioAdapterCapacity.maxLength
                  "
                >
                  {{
                    $t('global.form.valueMustBeBetween', {
                      min: 0,
                      max: 255,
                    })
                  }}
                </template>
              </b-form-invalid-feedback>
            </b-form-group>
            <b-button variant="primary" type="submit" class="mt-3 mb-3">
              {{ $t('pageMemory.updateIoAdapterEnlargedCapacity') }}
            </b-button>
          </b-form>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import { mapState } from 'vuex';
import Alert from '@/components/Global/Alert';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import { minValue, maxValue } from 'vuelidate/lib/validators';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';

export default {
  name: 'Memory',
  components: { Alert, PageSection, PageTitle },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  data() {
    return {
      form: {
        logicalMemorySizeOption: this.$store.getters[
          'resourceMemory/logicalMemorySize'
        ],
      },
    };
  },
  computed: {
    ...mapState('resourceMemory', [
      'logicalMemorySizeOptions',
      'logicalMemorySize',
    ]),
    ioAdapterCapacity: {
      get() {
        return this.$store.getters['resourceMemory/ioAdapterCapacity'];
      },
      set(value) {
        this.$v.$touch();
        this.$store.commit('resourceMemory/setIoAdapterCapacity', value);
      },
    },
  },
  watch: {
    logicalMemorySize: function (value) {
      this.form.logicalMemorySizeOption = value;
    },
  },
  validations: {
    // Empty validations to leverage vuelidate form states
    // to check for changed values
    form: {
      logicalMemorySizeOption: {},
    },
    ioAdapterCapacity: {
      minValue: minValue(0),
      maxValue: maxValue(255),
    },
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('resourceMemory/getMemorySizeOptions'),
      this.$store.dispatch('resourceMemory/getLogicalMemorySize'),
      this.$store.dispatch('resourceMemory/getIoAdapterCapacity'),
    ]).finally(() => this.endLoader());
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      let logicalMemorySize = this.form.logicalMemorySizeOption;
      this.$store
        .dispatch('resourceMemory/saveSettings', logicalMemorySize)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    updateAdapterCapacity() {
      this.startLoader();
      this.$store
        .dispatch('resourceMemory/saveEnlargedCapacity')
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
  },
};
</script>
