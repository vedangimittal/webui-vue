import api from '@/store/api';
import i18n from '@/i18n';
import { defineStore } from 'pinia';

export const SystemParametersStore = defineStore('systemParameters', {
  state: () => ({
    state: {
      rpdPolicyOptions: [],
      rpdFeatureOptions: [],
      aggressivePrefetch: false,
      frequencyCap: null,
      frequencyRequestCurrentToggle: false,
      lateralCastOutMode: null,
      immediateTestRequested: false,
      guardOnError: false,
      rpdPolicy: null,
      pvmRpdPolicy: null,
      rpdPolicyCurrent: null,
      rpdFeature: null,
      rpdScheduledRun: null,
      rpdScheduledRunDuration: null,
    },
  }),
  getters: {
    aggressivePrefetchGetter: (state) => state.aggressivePrefetch,
    frequencyMaxGetter: (state) => state.frequencyCap?.frequencyMax,
    frequencyMinGetter: (state) => state.frequencyCap?.frequencyMin,
    frequencyRequestGetter: (state) => state.frequencyCap?.frequencyRequest,
    frequencyRequestCurrentGetter: (state) =>
      state.frequencyCap?.frequencyRequestCurrent,
    frequencyRequestCurrentToggleGetter: (state) =>
      state.frequencyRequestCurrentToggle,
    lateralCastOutModeGetter: (state) => state.lateralCastOutMode,
    immediateTestRequestedGetter: (state) => state.immediateTestRequested,
    guardOnErrorGetter: (state) => state.guardOnError,
    rpdPolicyGetter: (state) => state.rpdPolicy,
    pvmRpdPolicyGetter: (state) => state.pvmRpdPolicy,
    rpdPolicyCurrentGetter: (state) => state.rpdPolicyCurrent,
    rpdFeatureGetter: (state) => state.rpdFeature,
    rpdPolicyOptionsGetter: (state) => state.rpdPolicyOptions,
    rpdFeatureOptionsGetter: (state) => state.rpdFeatureOptions,
    rpdScheduledRunGetter: (state) => state.rpdScheduledRun,
    rpdScheduledRunDurationGetter: (state) => state.rpdScheduledRunDuration,
  },
  actions: {
    async getAggressivePrefetch() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const aggressivePrefetch = RegistryEntries.Attributes.filter(
            (Attribute) =>
              Attribute.AttributeName == 'hb_proc_favor_aggressive_prefetch',
          );
          let aggressivePrefetchValue = aggressivePrefetch[0].CurrentValue;
          let modeValue = aggressivePrefetchValue == 'Enabled' ? true : false;
          this.aggressivePrefetch = modeValue;
        })
        .catch((error) => console.log(error));
    },
    async getRpdPolicy() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdPolicy = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_policy',
          );
          let rpdPolicyValue = rpdPolicy[0].CurrentValue;
          this.rpdPolicy = rpdPolicyValue;
          this.pvmRpdPolicy = rpdPolicyValue;
        })
        .catch((error) => console.log(error));
    },
    async getRpdPolicyCurrent() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdPolicyCurr = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_feature_current',
          );
          let rpdPolicyCurrValue = rpdPolicyCurr[0].CurrentValue;
          this.rpdPolicyCurrent = rpdPolicyCurrValue;
        })
        .catch((error) => console.log(error));
    },
    async getRpdFeature() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdFeature = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_feature',
          );
          let rpdFeatureValue = rpdFeature[0].CurrentValue;
          this.rpdFeature = rpdFeatureValue;
        })
        .catch((error) => console.log(error));
    },
    async getImmediateTestRequested() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const immediateTestRequested = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_immediate_test',
          );
          let immediateTestRequestedValue =
            immediateTestRequested[0].CurrentValue;
          let modeValue =
            immediateTestRequestedValue == 'Enabled' ? true : false;
          this.immediateTestRequested = modeValue;
        })
        .catch((error) => console.log(error));
    },
    async getGuardOnError() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const immediateTestRequested = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_guard_policy',
          );
          let immediateTestRequestedValue =
            immediateTestRequested[0].CurrentValue;
          let modeValue =
            immediateTestRequestedValue == 'Enabled' ? true : false;
          this.guardOnError = modeValue;
        })
        .catch((error) => console.log(error));
    },
    async getRpdPolicyOptions() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdPolicy = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_policy',
          );
          let rpdPolicyOptions = rpdPolicy[0].Value.map(
            ({ ValueName }) => ValueName,
          );
          this.rpdPolicyOptions = rpdPolicyOptions;
        })
        .catch((error) => console.log(error));
    },
    async getRpdFeatureOptions() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdPolicy = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_feature',
          );
          let rpdFeatureOptions = rpdPolicy[0].Value.map(
            ({ ValueName }) => ValueName,
          );
          this.rpdFeatureOptions = rpdFeatureOptions;
        })
        .catch((error) => console.log(error));
    },
    async getRpdScheduledRun() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdScheduledRun = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'pvm_rpd_scheduled_tod',
          );
          let RpdScheduledRunValue = rpdScheduledRun[0].CurrentValue;
          const hours = Math.floor(RpdScheduledRunValue / 3600);
          const minutes = Math.floor((RpdScheduledRunValue % 3600) / 60);
          const hourString = hours.toString().padStart(2, '0');
          const minuteString = minutes.toString().padStart(2, '0');
          this.rpdScheduledRun = `${hourString}:${minuteString}`;
        })
        .catch((error) => console.log(error));
    },
    async getRpdScheduledRunDuration() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const rpdScheduledRunDuration = RegistryEntries.Attributes.filter(
            (Attribute) =>
              Attribute.AttributeName == 'pvm_rpd_scheduled_duration',
          );
          let rpdScheduledRunValue = rpdScheduledRunDuration[0].CurrentValue;
          this.rpdScheduledRunDuration = rpdScheduledRunValue;
        })
        .catch((error) => console.log(error));
    },
    async saveAggressivePrefetch(updatedAggressivePrefetch) {
      let updatedModeValue = updatedAggressivePrefetch ? 'Enabled' : 'Disabled';
      this.aggressivePrefetch = updatedAggressivePrefetch;
      const updatedAggressivePrefetchValue = {
        Attributes: { hb_proc_favor_aggressive_prefetch: updatedModeValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedAggressivePrefetchValue,
        )
        .then(() => {
          return i18n.global.t(
            'pageSystemParameters.toast.successSavingAggressivePrefetch',
          );
        })
        .catch((error) => {
          console.log(error);
          this.aggressivePrefetch = !updatedAggressivePrefetch;
          throw new Error(
            i18n.global.t(
              'pageSystemParameters.toast.errorSavingAggressivePrefetch',
            ),
          );
        });
    },
    async saveRpdPolicy(rpdPolicyValue) {
      const updatedRpdPolicyValue = {
        Attributes: { pvm_rpd_policy: rpdPolicyValue },
      };
      return await api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedRpdPolicyValue,
        )
        .then(() => {
          this.rpdPolicy = updatedRpdPolicyValue.Attributes.pvm_rpd_policy;
          this.getRpdPolicy();
          return i18n.global.t(
            'pageSystemParameters.toast.successSavingRpdPolicy',
          );
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(
            i18n.global.t('pageSystemParameters.toast.errorSavingRpdPolicy'),
          );
        });
    },
    async saveRpdFeature(rpdFeatureValue) {
      const updatedRpdFeatureValue = {
        Attributes: { pvm_rpd_feature: rpdFeatureValue },
      };
      return await api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedRpdFeatureValue,
        )
        .then(() => {
          this.rpdFeature = updatedRpdFeatureValue.Attributes.pvm_rpd_feature;

          return i18n.global.t(
            'pageSystemParameters.toast.successSavingRpdFeature',
          );
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(
            i18n.global.t('pageSystemParameters.toast.errorSavingRpdFeature'),
          );
        });
    },
    async saveImmediateTestRequested({ value }) {
      if (value === 'Enabled') {
        this.immediateTestRequested = true;
      } else {
        this.immediateTestRequested = false;
      }
      const updatedImmediateTestRequestedValue = {
        Attributes: { pvm_rpd_immediate_test: value },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedImmediateTestRequestedValue,
        )
        .then(() => {
          if (value === 'Enabled') {
            return i18n.global.t(
              'pageSystemParameters.toast.successStartingDiagnosticTestRun',
            );
          } else {
            return i18n.global.t(
              'pageSystemParameters.toast.successStoppingDiagnosticTestRun',
            );
          }
        })
        .catch((error) => {
          console.log(error);
          if (value === 'Enabled') {
            this.immediateTestRequested = false;
            throw new Error(
              i18n.global.t(
                'pageSystemParameters.toast.errorStartingDiagnosticTestRun',
              ),
            );
          } else {
            this.immediateTestRequested = true;
            throw new Error(
              i18n.global.t(
                'pageSystemParameters.toast.errorStoppingDiagnosticTestRun',
              ),
            );
          }
        });
    },
    async saveGuardOnError(updatedImmediateTestRequested) {
      let updatedValue = updatedImmediateTestRequested ? 'Enabled' : 'Disabled';
      this.guardOnError = updatedImmediateTestRequested;
      const updatedImmediateTestRequestedValue = {
        Attributes: { pvm_rpd_guard_policy: updatedValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedImmediateTestRequestedValue,
        )
        .then(() => {
          return i18n.global.t(
            'pageSystemParameters.toast.successSavingGuardOnError',
          );
        })
        .catch((error) => {
          console.log(error);
          this.guardOnError = !updatedImmediateTestRequested;
          throw new Error(
            i18n.global.t('pageSystemParameters.toast.errorSavingGuardOnError'),
          );
        });
    },
    async saveRpdScheduledRun(payload) {
      const updatedIoEnlargedCapacity = {
        Attributes: {
          pvm_rpd_scheduled_tod: payload.totalSeconds,
          pvm_rpd_scheduled_duration: payload.duration,
        },
      };
      return await api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedIoEnlargedCapacity,
        )
        .then(() => {
          this.rpdScheduledRun = payload.startTime;
          return i18n.global.t(
            'pageSystemParameters.toast.successSavingRpdRun',
          );
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(
            i18n.global.t('pageSystemParameters.toast.errorSavingRpdRun'),
          );
        });
    },
    async getLateralCastOutMode() {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry',
        )
        .then(({ data: { RegistryEntries } }) => {
          const lateralCastOutMode = RegistryEntries.Attributes.filter(
            (Attribute) =>
              Attribute.AttributeName == 'hb_lateral_cast_out_mode',
          );
          let lateralCastOutModeValue = lateralCastOutMode[0].CurrentValue;
          let modeValue = lateralCastOutModeValue == 'Enabled' ? true : false;
          this.lateralCastOutMode = modeValue;
        })
        .catch((error) => console.log(error));
    },
    async saveLateralCastOutMode(lateralCastOutModeValue) {
      let updatedModeValue = lateralCastOutModeValue ? 'Enabled' : 'Disabled';
      this.lateralCastOutMode = lateralCastOutModeValue;
      const updatedLateralCastOutMode = {
        Attributes: { hb_lateral_cast_out_mode: updatedModeValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedLateralCastOutMode,
        )
        .then(() => {
          return i18n.global.t(
            'pageSystemParameters.toast.successSavingLateralCastOut',
          );
        })
        .catch((error) => {
          console.log(error);
          this.lateralCastOutMode = !lateralCastOutModeValue;
          throw new Error(
            i18n.global.t(
              'pageSystemParameters.toast.errorSavingLateralCastOut',
            ),
          );
        });
    },
    async getFrequencyCap() {
      return await api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Attributes } }) => {
          const frequencyCapData = {
            frequencyMax: Attributes.hb_cap_freq_mhz_max,
            frequencyMin: Attributes.hb_cap_freq_mhz_min,
            frequencyRequest: Attributes.hb_cap_freq_mhz_request,
            frequencyRequestCurrent: Attributes.hb_cap_freq_mhz_request_current,
          };

          this.frequencyCap = frequencyCapData;

          if (frequencyCapData.frequencyRequest == 0) {
            this.frequencyRequestCurrentToggle = false;
          } else {
            this.frequencyRequestCurrentToggle = true;
          }
        })
        .catch((error) => console.log(error));
    },
    async saveFrequencyCap({ frequency, state }) {
      if (state) {
        this.frequencyRequestCurrentToggle = true;
      } else {
        this.frequencyRequestCurrentToggle = false;
      }
      return this.newFrequencyCapRequest(frequency);
    },

    async newFrequencyCapRequest(frequency) {
      const newFrequencyRequest = {
        Attributes: { hb_cap_freq_mhz_request: Number(frequency) },
      };
      return api
        .patch('/redfish/v1/Systems/system/Bios/Settings', newFrequencyRequest)
        .then(() => {
          this.getFrequencyCap();
          return i18n.global.t(
            'pageSystemParameters.toast.successSavingFrequencyCap',
          );
        })
        .catch((error) => {
          if (frequency == 0) {
            this.frequencyRequestCurrentToggle = false;
          } else {
            this.frequencyRequestCurrentToggle = true;
          }
          console.log(error);
          throw new Error(
            i18n.global.t('pageSystemParameters.toast.errorSavingFrequencyCap'),
          );
        });
    },
  },
});

export default SystemParametersStore;
