<template>
  <div>
    <page-section :section-title="$t('pageNetwork.interfaceSection')">
      <b-row>
        <b-col md="3">
          <dl class="text-nowrap">
            <dt>
              {{ $t('pageNetwork.macAddress') }}
            </dt>
            <dd>
              {{ dataFormatter(macAddress) }}
            </dd>
          </dl>
        </b-col>
      </b-row>
    </page-section>
  </div>
</template>

<script>
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'Ipv4Table',
  components: {
    PageSection,
  },
  mixins: [BVToastMixin, DataFormatterMixin],
  props: {
    tabIndex: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      selectedInterface: '',
      macAddress: '',
    };
  },
  computed: {
    network() {
      return this.$store.getters['network/networkSettings'];
    },
  },
  watch: {
    // Watch for change in tab index
    tabIndex() {
      this.getSettings();
    },
  },
  created() {
    this.getSettings();
  },
  methods: {
    getSettings() {
      this.selectedInterface = this.tabIndex;
      this.macAddress = this.network[this.selectedInterface].macAddress;
    },
  },
};
</script>
