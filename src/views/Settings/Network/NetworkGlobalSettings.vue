<template>
  <page-section :section-title="$t('pageNetwork.networkSettings')">
    <b-row>
      <b-col md="3">
        <dl>
          <dt>
            {{ $t('pageNetwork.hostname') }}
            <b-button variant="link" class="p-1" @click="initSettingsModal()">
              <icon-edit :title="$t('pageNetwork.modal.editHostnameTitle')" />
            </b-button>
          </dt>
          <dd>{{ dataFormatter(hostname) }}</dd>
        </dl>
      </b-col>
    </b-row>
  </page-section>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import IconEdit from '@carbon/icons-vue/es/edit/16';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import PageSection from '@/components/Global/PageSection';

export default {
  name: 'GlobalNetworkSettings',
  components: { IconEdit, PageSection },
  mixins: [BVToastMixin, DataFormatterMixin],

  data() {
    return {
      hostname: '',
    };
  },
  computed: {
    network() {
      return this.$store.getters['network/networkSettings'];
    },
  },
  watch: {
    network() {
      this.getHostname();
    },
  },
  methods: {
    getHostname() {
      this.hostname = this.network[0].hostname;
    },
    initSettingsModal() {
      this.$bvModal.show('modal-hostname');
    },
  },
};
</script>
