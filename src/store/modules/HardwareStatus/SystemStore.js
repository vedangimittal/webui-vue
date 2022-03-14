import api from '@/store/api';
import i18n from '@/i18n';

const SystemStore = {
  namespaced: true,
  state: {
    systems: [],
  },
  getters: {
    systems: (state) => state.systems,
  },
  mutations: {
    setSystemInfo: (state, data) => {
      const system = {};
      system.assetTag = data.AssetTag;
      system.name = data.Name;
      system.health = data.Status?.Health;
      system.totalSystemMemoryGiB = data.MemorySummary?.TotalSystemMemoryGiB;
      system.id = data.Id;
      system.lampTest = data.Oem?.IBM?.LampTest;
      system.locationIndicatorActive = data.LocationIndicatorActive;
      system.model = data.Model;
      system.processorSummaryCoreCount = data.ProcessorSummary?.CoreCount;
      system.processorSummaryCount = data.ProcessorSummary?.Count;
      system.powerState = data.PowerState;
      system.serialNumber = data.SerialNumber;
      system.statusState = data.Status?.State;
      state.systems = [system];
    },
  },
  actions: {
    async getSystem({ commit }) {
      return await api
        .get('/redfish/v1')
        .then((response) =>
          api.get(`${response.data.Systems['@odata.id']}/system`)
        )
        .then(({ data }) => commit('setSystemInfo', data))
        .catch((error) => console.log(error));
    },
    async changeIdentifyLedState({ commit }, ledState) {
      return await api
        .patch('/redfish/v1/Systems/system', {
          LocationIndicatorActive: ledState,
        })
        .catch((error) => {
          commit('setSystemInfo', this.state.system.systems[0]);
          console.log('error', error);
          if (ledState) {
            throw new Error(
              i18n.t('pageInventory.toast.errorEnableIdentifyLed')
            );
          } else {
            throw new Error(
              i18n.t('pageInventory.toast.errorDisableIdentifyLed')
            );
          }
        });
    },
    async changeLampTestState({ commit }, lampTestState) {
      return await api
        .patch('/redfish/v1/Systems/system', {
          Oem: {
            IBM: {
              LampTest: lampTestState,
            },
          },
        })
        .catch((error) => {
          commit('setSystemInfo', this.state.system.systems[0]);
          console.log('error', error);
          if (lampTestState) {
            throw new Error(i18n.t('pageInventory.toast.errorEnableLampTest'));
          } else {
            throw new Error(i18n.t('pageInventory.toast.errorDisableLampTest'));
          }
        });
    },
  },
};

export default SystemStore;
