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
        <b-btn v-b-modal.modal-firmware-access-key variant="link" class="py-0">
          <icon-edit :title="$t('pageFirmware.modal.enterNewAccessKey')" />
        </b-btn>
      </dd>
    </dl>
    <firmware-modal-access-key @ok="submitForm" />
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import FirmwareModalAccessKey from './FirmwareModalAccessKey.vue';
import IconEdit from '@carbon/icons-vue/es/edit/20';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import { mapGetters } from 'vuex';
export default {
  name: 'FirmwareAccessKey',
  components: {
    FirmwareModalAccessKey,
    IconEdit,
  },
  mixins: [LoadingBarMixin, BVToastMixin],
  computed: {
    ...mapGetters('licenses', ['firmwareAccessKeyInfo']),

    hasLicenses() {
      return !Object.keys(this.$store.getters['licenses/licenses']).length;
    },
  },
  methods: {
    submitForm(key) {
      this.startLoader();
      this.$store
        .dispatch('licenses/activateLicense', key)
        .then((success) => {
          this.successToast(success);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>
