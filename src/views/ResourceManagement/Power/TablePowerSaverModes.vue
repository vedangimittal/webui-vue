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
          setting: 'Power saver',
          description: this.$t('pagePower.tableRoles.descPowerSaver'),
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
