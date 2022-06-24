<template>
  <div>
    <dl>
      <dt>
        {{ $t('pageFirmware.form.updateFirmware.accessKeyExpiration') }}
      </dt>
      <dd>
        <span v-if="hasLicenses">--</span>
        <span v-else>
          {{ firmwareAccessKeyInfo.expirationDate | formatDate }}
        </span>
      </dd>
      <b-link
        class="d-inline-block mb-4 m-md-0"
        to="/resource-management/capacity-on-demand"
        :disabled="isPageDisabled"
      >
        {{ $t('pageFirmware.form.updateFirmware.manageAccessKeys') }}
      </b-link>
    </dl>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import { mapGetters } from 'vuex';
export default {
  name: 'FirmwareAccessKey',
  mixins: [LoadingBarMixin, BVToastMixin],
  props: {
    isPageDisabled: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters('licenses', ['firmwareAccessKeyInfo']),

    hasLicenses() {
      return !Object.keys(this.$store.getters['licenses/licenses']).length;
    },
  },
};
</script>
