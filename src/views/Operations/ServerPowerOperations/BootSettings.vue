<template>
  <b-form novalidate @submit.prevent="handleSubmit">
    <b-row>
      <b-col sm="6">
        <b-form-group
          :label="
            $t('pageServerPowerOperations.bootSettings.bootSettingsOverride')
          "
          label-for="boot-option"
          class="mb-3"
        >
          <b-form-select
            id="boot-option"
            v-model="form.bootOption"
            :disabled="bootSourceOptions.length === 0"
            :options="bootSourceOptions"
            @change="onChangeSelect"
          >
          </b-form-select>
        </b-form-group>
        <b-form-checkbox
          v-model="form.oneTimeBoot"
          class="mb-4"
          :disabled="form.bootOption === 'None'"
          @change="$v.form.oneTimeBoot.$touch()"
        >
          {{ $t('pageServerPowerOperations.bootSettings.enableOneTimeBoot') }}
        </b-form-checkbox>
      </b-col>
    </b-row>
    <bios-settings
      v-if="form.attributes && form.attributeValues"
      :key="componentKey"
      :attributes="form.attributes"
      :attribute-values="form.attributeValues"
      @updated-attributes="updateAttributeKeys"
    />
    <b-button variant="primary" type="submit" class="mb-3">
      {{ $t('global.action.save') }}
    </b-button>
  </b-form>
</template>
<script>
import { mapState } from 'vuex';
import BiosSettings from './BiosSettings';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
export default {
  name: 'BootSettings',
  components: { BiosSettings },
  mixins: [BVToastMixin, LoadingBarMixin],
  data() {
    return {
      componentKey: 0,
      form: {
        bootOption: this.$store.getters['serverBootSettings/bootSource'],
        oneTimeBoot: this.$store.getters['serverBootSettings/overrideEnabled'],
        attributes: this.$store.getters['serverBootSettings/biosAttributes'],
        attributeValues: this.$store.getters[
          'serverBootSettings/attributeValues'
        ],
      },
    };
  },
  computed: {
    ...mapState('serverBootSettings', [
      'attributeValues',
      'biosAttributes',
      'bootSourceOptions',
      'bootSource',
      'overrideEnabled',
    ]),
  },
  watch: {
    attributeValues: function (value) {
      this.form.attributeValues = value;
    },
    biosAttributes: function (value) {
      this.form.attributes = value;
    },
    bootSource: function (value) {
      this.form.bootOption = value;
    },
    overrideEnabled: function (value) {
      this.form.oneTimeBoot = value;
    },
  },
  validations: {
    // Empty validations to leverage vuelidate form states
    // to check for changed values
    form: {
      bootOption: {},
      oneTimeBoot: {},
    },
  },
  created() {
    Promise.all([
      this.$store.dispatch('serverBootSettings/getBiosAttributes'),
      this.$store.dispatch('serverBootSettings/getAttributeValues'),
    ]).finally(() =>
      this.$root.$emit('server-power-operations-boot-settings-complete')
    );
  },
  methods: {
    updateAttributeKeys(attributeKeys) {
      this.form.attributes = attributeKeys;
    },
    handleSubmit() {
      this.startLoader();
      const bootSettingsChanged =
        this.$v.form.bootOption.$dirty || this.$v.form.oneTimeBoot.$dirty;
      let settings;
      let bootSource = null;
      let overrideEnabled = null;
      let biosSettings = this.form.attributes;
      if (bootSettingsChanged) {
        // If bootSource or overrideEnabled changed get
        // both current values to send with request
        bootSource = this.form.bootOption;
        overrideEnabled = this.form.oneTimeBoot;
      }
      settings = { bootSource, overrideEnabled, biosSettings };
      this.$store
        .dispatch('serverBootSettings/saveSettings', settings)
        .then((message) => {
          this.componentKey += 1;
          this.successToast(message);
        })
        .catch(({ message }) => this.errorToast(message))
        .finally(() => {
          this.$v.form.$reset();
          this.endLoader();
        });
    },
    onChangeSelect(selectedOption) {
      this.$v.form.bootOption.$touch();
      // Disable one time boot if selected boot option is 'None'
      if (selectedOption === 'None') this.form.oneTimeBoot = false;
    },
  },
};
</script>
