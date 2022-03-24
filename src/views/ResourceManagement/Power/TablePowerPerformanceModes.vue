<template>
  <b-table stacked="sm" hover :items="items"> </b-table>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      items: [
        {
          setting: 'Static',
          description: this.$t('pagePower.tableRoles.descStatic'),
        },
        {
          setting: 'Power saving',
          description: this.$t('pagePower.tableRoles.descPowerSaving'),
        },
        {
          setting: 'Maximum performance',
          description: this.$t('pagePower.tableRoles.descMaximumPerformance'),
        },
      ],
    };
  },
};
</script>
