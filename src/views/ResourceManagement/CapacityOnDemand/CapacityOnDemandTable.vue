<template>
  <b-row>
    <b-col xl="10">
      <page-section :section-title="$t('pageCapacityOnDemand.vetCapabilities')">
        <b-table
          show-empty
          hover
          :no-border-collapse="true"
          :items="items"
          :fields="fields"
          :empty-text="$t('global.table.emptyMessage')"
        >
          <!-- Status column -->
          <template #cell(status)="{ value }">
            <status-icon v-if="value" :status="statusIcon(value)" />
            {{ value }}
          </template>
        </b-table>
      </page-section>
    </b-col>
  </b-row>
</template>

<script>
import { forOwn } from 'lodash';
import PageSection from '@/components/Global/PageSection';
import StatusIcon from '@/components/Global/StatusIcon';

export default {
  name: 'CapacityOnDemandTable',
  components: { PageSection, StatusIcon },
  data() {
    return {
      fields: [
        {
          key: 'settings',
          label: this.$t('pageCapacityOnDemand.table.setting'),
        },
        {
          key: 'status',
          label: this.$t('pageCapacityOnDemand.table.bitCapabilityStatus'),
        },
      ],
    };
  },
  computed: {
    items() {
      const licenses = this.$store.getters['licenses/licenses'];
      const items = [];

      forOwn(licenses, (license) => {
        items.push({
          settings: license.Name,
          status: license.Status?.State,
        });
      });

      return items;
    },
  },
  methods: {
    statusIcon(value) {
      if (value === 'Enabled') {
        return 'success';
      } else if (value === 'Disabled') {
        return 'danger';
      } else {
        return 'secondary';
      }
    },
  },
};
</script>
