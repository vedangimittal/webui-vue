<template>
  <overview-card
    :title="$t('pageOverview.serverInformation')"
    :to="`/hardware-status/inventory`"
  >
    <b-row class="mt-3">
      <b-col sm="6" lg="6">
        <dl>
          <dt>{{ $t('pageOverview.model') }}</dt>
          <dd>{{ dataFormatter(serverModel) }}</dd>
          <dt>{{ $t('pageOverview.serialNumber') }}</dt>
          <dd>{{ dataFormatter(serverSerialNumber) }}</dd>
        </dl>
      </b-col>
      <b-col sm="6" lg="6">
        <dl>
          <dt>{{ $t('pageOverview.operatingMode') }}</dt>
          <dd>{{ dataFormatter(operatingMode) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';

export default {
  name: 'Server',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      biosAttributes: (state) => state.serverBootSettings.biosAttributes,
      serverModel() {
        return this.server?.model;
      },
      serverSerialNumber() {
        return this.server?.serialNumber;
      },
      operatingMode() {
        return this.biosAttributes?.pvm_system_operating_mode;
      },
    }),
  },
  created() {
    this.$store.dispatch('serverBootSettings/getBiosAttributes'),
      this.$store.dispatch('system/getSystem').finally(() => {
        this.$root.$emit('overview-server-complete');
      });
  },
};
</script>
