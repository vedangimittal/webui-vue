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
    <page-section :section-title="$t('pageMemory.logicalMemorySize')">
      <b-row>
        <b-col md="8" xl="6">
          <b-form novalidate @submit.prevent="handleSubmit">
            <b-form-group
              :label="$t('pageMemory.logicalMemorySizeHeading')"
              label-for="logical-memory-size-option"
              class="mb-3 w-75"
            >
              <b-form-select
                id="logical-memory-size-option"
                v-model="form.logicalMemorySizeOption"
                class="w-75"
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
  </b-container>
</template>

<script>
import { mapState } from 'vuex';
import Alert from '@/components/Global/Alert';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';

export default {
  name: 'Memory',
  components: { Alert, PageSection, PageTitle },
  mixins: [BVToastMixin, LoadingBarMixin],
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
  },
  created() {
    this.startLoader();
    Promise.all([
      this.$store.dispatch('resourceMemory/getMemorySizeOptions'),
      this.$store.dispatch('resourceMemory/getLogicalMemorySize'),
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
  },
};
</script>
