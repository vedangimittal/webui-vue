<template>
  <b-container fluid="xl">
    {{ postCodes }}
  </b-container>
</template>

<script>
export default {
  name: 'PostCodes',
  computed: {
    postCodeValue() {
      return this.$store.getters['global/postCodeValue'];
    },
    postCodes() {
      if (this.postCodeValue) {
        const { U64 } = require('n64');
        let big = U64(this.postCodeValue, 10);
        big.toString();
        let bytearray = big.toLE(Buffer);
        var finalConvertedCode = bytearray.toString();
        return finalConvertedCode;
      } else return '';
    },
  },
};
</script>
