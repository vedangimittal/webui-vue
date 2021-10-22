import api from '@/store/api';
import i18n from '@/i18n';

const PowerControlStore = {
  namespaced: true,
  state: {
    powerCapValue: null,
    powerCapUri: '',
    powerConsumptionValue: null,
    powerSaverMode: null,
  },
  getters: {
    powerCapValue: (state) => state.powerCapValue,
    powerCapUri: (state) => state.powerCapUri,
    powerConsumptionValue: (state) => state.powerConsumptionValue,
    powerSaverMode: (state) => state.powerSaverMode,
  },
  mutations: {
    setPowerCapValue: (state, powerCapValue) =>
      (state.powerCapValue = powerCapValue),
    setPowerCapUri: (state, powerCapUri) => (state.powerCapUri = powerCapUri),
    setPowerConsumptionValue: (state, powerConsumptionValue) =>
      (state.powerConsumptionValue = powerConsumptionValue),
    setPowerSaverMode: (state, powerSaverMode) =>
      (state.powerSaverMode = powerSaverMode),
  },
  actions: {
    setPowerCapUpdatedValue({ commit }, value) {
      commit('setPowerCapValue', value);
    },
    async getChassisCollection() {
      return await api
        .get('/redfish/v1/')
        .then((response) => api.get(response.data.Chassis['@odata.id']))
        .then(({ data: { Members } }) =>
          Members.map((member) => member['@odata.id'])
        )
        .catch((error) => console.log(error));
    },
    async getPowerControl({ dispatch, commit }) {
      const collection = await dispatch('getChassisCollection');
      if (!collection || collection.length === 0) return;
      return await api
        .get(`${collection[0]}`)
        .then((response) => api.get(response.data.Power['@odata.id']))
        .then((response) => {
          const powerControl = response.data.PowerControl;
          if (!powerControl || powerControl.length === 0) return;
          const powerCapUri = powerControl[0]['@odata.id'];
          const powerCap = powerControl[0].PowerLimit.LimitInWatts;
          // If system is powered off, power consumption does not exist in the PowerControl
          const powerConsumption = powerControl[0].PowerConsumedWatts || null;
          commit('setPowerCapUri', powerCapUri);
          commit('setPowerCapValue', powerCap);
          commit('setPowerConsumptionValue', powerConsumption);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerControl({ state }, powerCapValue) {
      const data = {
        PowerControl: [{ PowerLimit: { LimitInWatts: powerCapValue } }],
      };
      return await api
        .patch(state.powerCapUri, data)
        .then(() =>
          i18n.t('pageServerPowerOperations.toast.successSaveSettings')
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageServerPowerOperations.toast.errorSaveSettings')
          );
        });
    },
    async getPowerMode({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system')
        .then((response) => {
          const currentPowerMode = response.data.PowerMode;
          commit('setPowerSaverMode', currentPowerMode);
        })
        .catch((error) => {
          console.log('Power control', error);
        });
    },
    async setPowerSaverMode(_, powerSaverMode) {
      const data = { PowerMode: powerSaverMode };
      return await api
        .patch('/redfish/v1/Systems/system', data)
        .then(() => i18n.t('pagePower.toast.successPowerSaver'))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.t('pagePower.toast.errorPowerSaver'));
        });
    },
  },
};

export default PowerControlStore;
