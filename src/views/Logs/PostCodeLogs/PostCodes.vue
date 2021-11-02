<template>
  <b-container fluid="xl">
    <!-- <page-title />
     -->
    {{ postCodeValue[0] }}
  </b-container>
</template>

<script>
export default {
  name: 'PostCodes',
  computed: {
    postCodeValue() {
      return this.$store.getters['global/postCodeValue'];
    },
  },
};
</script>
