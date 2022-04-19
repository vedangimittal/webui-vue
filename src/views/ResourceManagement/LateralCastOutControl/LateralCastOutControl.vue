<template>
  <b-container fluid="xl">
    <b-row>
      <b-col md="8" xl="6">
        <page-title
          :description="
            $t('pageLateralCastOutControl.lateralCastOutControlDescription')
          "
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col md="8" xl="6">
        <alert v-if="!isServerOff" variant="info" class="mb-4">
          <div class="font-weight-bold">
            {{ $t('pageLateralCastOutControl.alert.title') }}
          </div>
          <div>
            {{ $t('pageLateralCastOutControl.alert.message') }}
          </div>
        </alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col md="8" class="d-flex align-items-center justify-content-between">
        <dl class="mr-3">
          <dt>
            {{ $t('pageLateralCastOutControl.lateralCastOut') }}
          </dt>
          <dd>
            <b-form-checkbox
              id="lateralCastOutModeSwitch"
              v-model="lateralCastOutModeState"
              switch
              @change="changeLateralCastOutState"
            >
              <span v-if="lateralCastOutModeState">
                {{ $t('global.status.enabled') }}
              </span>
              <span v-else>{{ $t('global.status.disabled') }}</span>
            </b-form-checkbox>
          </dd>
        </dl>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import Alert from '@/components/Global/Alert';

export default {
  name: 'LateralCastOutControl',
  components: { PageTitle, Alert },
  mixins: [LoadingBarMixin, BVToastMixin],
  computed: {
    lateralCastOutModeState: {
      get() {
        return this.$store.getters['lateralCastOutControl/lateralCastOutMode'];
      },
      set(newValue) {
        return newValue;
      },
    },
    serverStatus() {
      return this.$store.getters['global/serverStatus'];
    },
    isServerOff() {
      return this.serverStatus === 'off' ? true : false;
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('lateralCastOutControl/getLateralCastOutMode')
      .finally(() => this.endLoader());
  },
  methods: {
    changeLateralCastOutState(state) {
      this.$store
        .dispatch('lateralCastOutControl/saveLateralCastOutMode', state)
        .then((message) => this.successToast(message))
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
