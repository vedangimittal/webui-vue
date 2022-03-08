<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageHardwareDeconfiguration.description')" />
    <page-section>
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs content-class="mt-3" fill>
              <b-tab :title="$t('pageHardwareDeconfiguration.memoryDimms')"
                ><memory-dimms
              /></b-tab>
              <b-tab :title="$t('pageHardwareDeconfiguration.processorCores')"
                ><processor-cores
              /></b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import VuelidateMixin from '@/components/Mixins/VuelidateMixin.js';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import ProcessorCores from './ProcessorCores.vue';
import MemoryDimms from './MemoryDimms.vue';

export default {
  name: 'HardwareDeconfiguration',
  components: { PageTitle, MemoryDimms, ProcessorCores, PageSection },
  mixins: [VuelidateMixin, BVToastMixin, LoadingBarMixin],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      policyValue: null,
      options: [],
    };
  },
  computed: {
    powerRestorePolicies() {
      return this.$store.getters['powerPolicy/powerRestorePolicies'];
    },
    currentPowerRestorePolicy: {
      get() {
        return this.$store.getters['powerPolicy/powerRestoreCurrentPolicy'];
      },
      set(policy) {
        this.policyValue = policy;
      },
    },
  },
  created() {
    this.startLoader();
    this.renderPowerRestoreSettings();
  },
  methods: {
    renderPowerRestoreSettings() {
      Promise.all([
        this.$store.dispatch('powerPolicy/getPowerRestorePolicies'),
        this.$store.dispatch('powerPolicy/getPowerRestoreCurrentPolicy'),
      ]).finally(() => {
        this.options.length = 0;
        this.powerRestorePolicies.map((item) => {
          this.options.push({
            text: this.$t(`pagePowerRestorePolicy.policiesDesc.${item.state}`),
            value: `${item.state}`,
          });
        });
        this.endLoader();
      });
    },
    submitForm() {
      this.startLoader();
      this.$store
        .dispatch(
          'powerPolicy/setPowerRestorePolicy',
          this.policyValue || this.currentPowerRestorePolicy
        )
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.renderPowerRestoreSettings();
        });
    },
  },
};
</script>
