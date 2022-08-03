import api from '@/store/api';
import i18n from '@/i18n';

const addedOptimizationStore = {
  namespaced: true,
  state: {
    aggressivePrefetch: false,
    frequencyCap: null,
    frequencyRequestCurrentToggle: false,
    lateralCastOutMode: null,
  },
  getters: {
    aggressivePrefetch: (state) => state.aggressivePrefetch,
    frequencyMax: (state) => state.frequencyCap?.frequencyMax,
    frequencyMin: (state) => state.frequencyCap?.frequencyMin,
    frequencyRequest: (state) => state.frequencyCap?.frequencyRequest,
    frequencyRequestCurrent: (state) =>
      state.frequencyCap?.frequencyRequestCurrent,
    frequencyRequestCurrentToggle: (state) =>
      state.frequencyRequestCurrentToggle,
    lateralCastOutMode: (state) => state.lateralCastOutMode,
  },
  mutations: {
    setFrequencyRequestCurrentToggle: (state, frequencyRequestCurrentToggle) =>
      (state.frequencyRequestCurrentToggle = frequencyRequestCurrentToggle),
    setAggressivePrefetch: (state, aggressivePrefetch) =>
      (state.aggressivePrefetch = aggressivePrefetch),
    setFrequencyCap: (state, frequencyCap) =>
      (state.frequencyCap = frequencyCap),
    setLateralCastOutMode: (state, lateralCastOutMode) =>
      (state.lateralCastOutMode = lateralCastOutMode),
  },
  actions: {
    async getAggressivePrefetch({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const aggressivePrefetch = RegistryEntries.Attributes.filter(
            (Attribute) =>
              Attribute.AttributeName == 'hb_proc_favor_aggressive_prefetch'
          );
          let aggressivePrefetchValue = aggressivePrefetch[0].CurrentValue;
          let modeValue = aggressivePrefetchValue == 'Enabled' ? true : false;
          commit('setAggressivePrefetch', modeValue);
        })
        .catch((error) => console.log(error));
    },
    async saveAggressivePrefetch({ commit }, updatedAggressivePrefetch) {
      let updatedModeValue = updatedAggressivePrefetch ? 'Enabled' : 'Disabled';
      commit('setAggressivePrefetch', updatedAggressivePrefetch);
      const updatedAggressivePrefetchValue = {
        Attributes: { hb_proc_favor_aggressive_prefetch: updatedModeValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedAggressivePrefetchValue
        )
        .then(() => {
          return i18n.t(
            'pageAddedOptimization.toast.successSavingAggressivePrefetch'
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setAggressivePrefetch', !updatedAggressivePrefetch);
          throw new Error(
            i18n.t('pageAddedOptimization.toast.errorSavingAggressivePrefetch')
          );
        });
    },
    async getLateralCastOutMode({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const lateralCastOutMode = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'hb_lateral_cast_out_mode'
          );
          let lateralCastOutModeValue = lateralCastOutMode[0].CurrentValue;
          let modeValue = lateralCastOutModeValue == 'Enabled' ? true : false;
          commit('setLateralCastOutMode', modeValue);
        })
        .catch((error) => console.log(error));
    },
    async saveLateralCastOutMode({ commit }, lateralCastOutModeValue) {
      let updatedModeValue = lateralCastOutModeValue ? 'Enabled' : 'Disabled';
      commit('setLateralCastOutMode', lateralCastOutModeValue);
      const updatedLateralCastOutMode = {
        Attributes: { hb_lateral_cast_out_mode: updatedModeValue },
      };
      return api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedLateralCastOutMode
        )
        .then(() => {
          return i18n.t(
            'pageAddedOptimization.toast.successSavingLateralCastOut'
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setLateralCastOutMode', !lateralCastOutModeValue);
          throw new Error(
            i18n.t('pageAddedOptimization.toast.errorSavingLateralCastOut')
          );
        });
    },
    async getFrequencyCap({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Bios')
        .then(({ data: { Attributes } }) => {
          const frequencyCapData = {
            frequencyMax: Attributes.hb_cap_freq_mhz_max,
            frequencyMin: Attributes.hb_cap_freq_mhz_min,
            frequencyRequest: Attributes.hb_cap_freq_mhz_request,
            frequencyRequestCurrent: Attributes.hb_cap_freq_mhz_request_current,
          };

          commit('setFrequencyCap', frequencyCapData);

          if (frequencyCapData.frequencyRequest == 0) {
            commit('setFrequencyRequestCurrentToggle', false);
          } else {
            commit('setFrequencyRequestCurrentToggle', true);
          }
        })
        .catch((error) => console.log(error));
    },
    async saveFrequencyCap({ commit, dispatch }, { frequency, state }) {
      if (state) {
        commit('setFrequencyRequestCurrentToggle', true);
      } else {
        commit('setFrequencyRequestCurrentToggle', false);
      }
      return dispatch('newFrequencyCapRequest', frequency);
    },

    async newFrequencyCapRequest({ commit, dispatch }, frequency) {
      const newFrequencyRequest = {
        Attributes: { hb_cap_freq_mhz_request: frequency },
      };
      return api
        .patch('/redfish/v1/Systems/system/Bios/Settings', newFrequencyRequest)
        .then(() => {
          dispatch('getFrequencyCap');
          return i18n.t(
            'pageAddedOptimization.toast.successSavingFrequencyCap'
          );
        })
        .catch((error) => {
          if (frequency == 0) {
            commit('setFrequencyRequestCurrentToggle', false);
          } else {
            commit('setFrequencyRequestCurrentToggle', true);
          }
          console.log(error);
          throw new Error(
            i18n.t('pageAddedOptimization.toast.errorSavingFrequencyCap')
          );
        });
    },
  },
};

export default addedOptimizationStore;
