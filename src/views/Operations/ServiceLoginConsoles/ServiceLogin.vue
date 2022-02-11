<template>
  <b-container fluid="xl">
    <page-title />

    <page-section class="mb-0">
      <service-login-consoles :is-full-window="false" />
    </page-section>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
import ServiceLoginConsoles from './ServiceLoginConsoles';

export default {
  name: 'ServiceLogin',
  components: {
    PageSection,
    PageTitle,
    ServiceLoginConsoles,
  },
};
</script>
