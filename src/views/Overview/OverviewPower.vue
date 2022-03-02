<template>
  <overview-card
    :title="$t('pageOverview.powerInformation')"
    :to="`/resource-management/power`"
  >
    <b-row class="mt-3">
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pageOverview.powerConsumption') }}</dt>
          <dd v-if="powerConsumptionValue == null">
            {{ $t('global.status.notAvailable') }}
          </dd>
          <dd v-else>{{ powerConsumptionValue }} W</dd>
          <dt>{{ $t('pageOverview.powerCap') }}</dt>
          <dd v-if="powerCapValue == null">
            {{ $t('global.status.disabled') }}
          </dd>
          <dd v-else>{{ powerCapValue }} W</dd>
        </dl>
      </b-col>
      <b-col sm="6">
        <dl>
          <dt>{{ $t('pagePower.idlePower') }}</dt>
          <dd v-if="idlePowerData.Enabled">
            {{ $t('global.status.enabled') }}
          </dd>
          <dd v-else>{{ $t('global.status.disabled') }}</dd>
          <dt>{{ $t('pageOverview.powerMode') }}</dt>
          <dd>
            {{ dataFormatter(powerModeValue) }}
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
      powerCapValue: 'powerControl/powerCapValue',
      powerConsumptionValue: 'powerControl/powerConsumptionValue',
      powerModeValue: 'powerControl/powerSaverMode',
      idlePowerData: 'powerControl/idlePower',
    }),
  },
  created() {
    Promise.all(
      this.$store.dispatch('powerControl/getPowerSaverModeData'),
      this.$store.dispatch('powerControl/getPowerControl')
    ).finally(() => {
      this.$root.$emit('overview-power-complete');
    });
  },
};
</script>
