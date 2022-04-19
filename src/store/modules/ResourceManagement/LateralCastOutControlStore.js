import api from '@/store/api';
import i18n from '@/i18n';

const LateralCastOutControlStore = {
  namespaced: true,
  state: {
    lateralCastOutMode: null,
  },
  getters: {
    lateralCastOutMode: (state) => state.lateralCastOutMode,
  },
  mutations: {
    setLateralCastOutMode: (state, lateralCastOutMode) =>
      (state.lateralCastOutMode = lateralCastOutMode),
  },
  actions: {
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
            'pageLateralCastOutControl.toast.successSavingLateralCastOut'
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setLateralCastOutMode', !lateralCastOutModeValue);
          throw new Error(
            i18n.t('pageLateralCastOutControl.toast.errorSavingLateralCastOut')
          );
        });
    },
  },
};

export default LateralCastOutControlStore;
