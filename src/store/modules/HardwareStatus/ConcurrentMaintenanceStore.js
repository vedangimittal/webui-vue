import api from '@/store/api';
import i18n from '@/i18n';

const ConcurrentMaintenanceStore = {
  namespaced: true,
  state: {
    readyToRemove: false,
    todObject: {},
  },
  getters: {
    readyToRemove: (state) => state.readyToRemove,
    todObject: (state) => state.todObject,
  },
  mutations: {
    setReadyToRemove: (state, readyToRemove) =>
      (state.readyToRemove = readyToRemove),
    setTodObject: (state, todObject) => (state.todObject = todObject),
  },
  actions: {
    async getReadyToRemove({ commit }) {
      return await api
        .get('/redfish/v1/Chassis/chassis/Assembly')
        .then((response) =>
          response.data.Assemblies.map((entry) => {
            if (entry.Name === 'Time Of Day Battery') {
              commit('setTodObject', entry);
              commit('setReadyToRemove', entry.Oem.OpenBMC.ReadyToRemove);
            }
          })
        )
        .catch((error) => console.log(error));
    },
    async saveReadyToRemoveState({ commit, state }, updatedReadyToRemove) {
      commit('setReadyToRemove', updatedReadyToRemove);
      return await api
        .patch('/redfish/v1/Chassis/chassis/Assembly', {
          Assemblies: [
            {
              MemberId: state.todObject.MemberId,
              Oem: {
                OpenBMC: {
                  ReadyToRemove: updatedReadyToRemove,
                },
              },
            },
          ],
        })
        .then(() => {
          return i18n.t(
            'pageConcurrentMaintenance.toast.successSaveReadyToRemove',
            {
              state: updatedReadyToRemove ? 'enabled' : 'disabled',
            }
          );
        })
        .catch((error) => {
          console.log(error);
          commit('setReadyToRemove', !updatedReadyToRemove);
          throw new Error(
            i18n.t('pageConcurrentMaintenance.toast.errorSaveReadyToRemove', {
              state: updatedReadyToRemove ? 'enabling' : 'disabling',
            })
          );
        });
    },
  },
};

export default ConcurrentMaintenanceStore;
