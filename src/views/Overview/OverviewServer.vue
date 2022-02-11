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
          <dt>{{ $t('pageOverview.serviceLogin') }}</dt>
          <dd>
            <status-icon :status="serviceLoginStatusIcon" />
            {{ dataFormatter(serviceLogin) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapState } from 'vuex';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'Server',
  components: {
    OverviewCard,
    StatusIcon,
  },
  mixins: [DataFormatterMixin],
  data() {
    return {
      serviceLoginStatus: null,
    };
  },
  computed: {
    ...mapState({
      server: (state) => state.system.systems[0],
      serviceLoginInfo: (state) => state.global,
      biosAttributes: (state) => state.serverBootSettings.biosAttributes,
      serverModel() {
        return this.server?.model;
      },
      serverSerialNumber() {
        return this.server?.serialNumber;
      },
      serviceLogin() {
        const date = new Date(this.serviceLoginInfo?.bmcTime);
        const expirationDate = new Date(this.serviceLoginInfo?.expirationDate);
        if (this.serviceLoginInfo?.acfInstalled && expirationDate >= date) {
          this.serviceLoginStatus = this.$t('global.status.enabled');
        } else {
          this.serviceLoginStatus = this.$t('global.status.disabled');
        }
        return this.serviceLoginStatus;
      },
      operatingMode() {
        return this.biosAttributes?.pvm_system_operating_mode;
      },
    }),
    serviceLoginStatusIcon() {
      switch (this.serviceLoginStatus) {
        case this.$t('global.status.enabled'):
          return 'success';
        case this.$t('global.status.disabled'):
          return 'danger';
        default:
          return 'secondary';
      }
    },
  },
  created() {
    Promise.all([
      this.$store.dispatch('global/getServiceLogin'),
      this.$store.dispatch('serverBootSettings/getBiosAttributes'),
      this.$store.dispatch('system/getSystem'),
    ]).finally(() => {
      this.$root.$emit('overview-server-complete');
    });
  },
};
</script>
