<template>
  <b-container fluid="xl">
    <page-title
      :description="$t('pageDeconfigurationHardware.description')"
      :link="$t('pageDeconfigurationHardware.link')"
      to="/logs/deconfiguration-records"
    />
    <page-section>
      <b-row>
        <b-col>
          <b-card no-body>
            <b-tabs content-class="mt-3" fill>
              <b-tab :title="$t('pageDeconfigurationHardware.memoryDimms')">
                <memory-dimms />
              </b-tab>
              <b-tab :title="$t('pageDeconfigurationHardware.processorCores')">
                <processor-cores />
              </b-tab>
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
  created() {
    this.startLoader();
  },
};
</script>
