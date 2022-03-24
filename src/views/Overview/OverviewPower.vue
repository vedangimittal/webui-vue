<template>
  <overview-card
    :title="$t('pageOverview.powerInformation')"
    :to="`/resource-management/power`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.powerConsumption') }}</dt>
          <dd v-if="!powerConsumptionValue">
            {{ $t('global.status.notAvailable') }}
          </dd>
          <dd v-else>{{ powerConsumptionValue }} W</dd>
          <dt>{{ $t('pageOverview.powerCap') }}</dt>
          <dd v-if="!powerCapValue">
            {{ $t('global.status.disabled') }}
          </dd>
          <dd v-else>{{ powerCapValue }} W</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pagePower.idlePower') }}</dt>
          <dd v-if="idlePowerSaverData">
            {{ $t('global.status.enabled') }}
          </dd>
          <dd v-else>{{ $t('global.status.disabled') }}</dd>
          <dt>{{ $t('pageOverview.powerMode') }}</dt>
          <dd>
            {{ dataFormatter(powerPerformanceMode) }}
          </dd>
        </dl>
      </b-col>
    </b-row>
  </overview-card>
</template>

<script>
import OverviewCard from './OverviewCard';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import { mapGetters } from 'vuex';

export default {
  name: 'Power',
  components: {
    OverviewCard,
  },
  mixins: [DataFormatterMixin],
  computed: {
    ...mapGetters({
      powerCapValue: 'powerControl/powerCap',
      powerConsumptionValue: 'powerControl/powerConsumption',
      powerPerformanceMode: 'powerControl/powerPerformanceMode',
      idlePowerSaverData: 'powerControl/idlePowerSaverData',
    }),
    isIdlePowerSaverDataEnabled() {
      return this.idlePowerSaverData?.Enabled;
    },
  },
  created() {
    Promise.all([
      this.$store.dispatch('powerControl/getPowerControl'),
      this.$store.dispatch('powerControl/getPowerPerformanceMode'),
      this.$store.dispatch('powerControl/getIdlePowerSaverData'),
    ]).finally(() => {
      this.$root.$emit('overview-power-complete');
    });
  },
};
</script>
