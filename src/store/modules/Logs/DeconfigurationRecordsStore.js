import api from '@/store/api';
import i18n from '@/i18n';

const DeconfigurationRecordsStore = {
  namespaced: true,
  state: {
    deconfigRecords: [],
  },
  getters: {
    deconfigRecords: (state) => state.deconfigRecords,
  },
  mutations: {
    setDeconfigurationRecordInfo: (state, deconfigRecords) =>
      (state.deconfigRecords = deconfigRecords),
  },
  actions: {
    async getDeconfigurationRecordInfo({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/LogServices/HardwareIsolation/Entries')
        .then(({ data: { Members = [] } = {} }) => {
          const deconfigRecords = Members.map((log) => {
            const {
              Id,
              Severity,
              EventId,
              Created,
              Message,
              Name,
              Resolved,
              AdditionalDataURI,
              EntryType,
            } = log;
            return {
              additionalDataUri: AdditionalDataURI,
              date: new Date(Created),
              description: Message,
              filterByStatus: Resolved ? 'Resolved' : 'Unresolved',
              id: Id,
              name: Name,
              srcDetails: EventId,
              status: Resolved, //true or false
              type: EntryType,
              uri: log['@odata.id'],
              severity:
                Severity === 'Warning' && AdditionalDataURI
                  ? 'Predictive'
                  : Severity === 'Critical'
                  ? 'Fatal'
                  : Severity === 'Warning' && !AdditionalDataURI
                  ? 'Manual'
                  : '--',
            };
          });
          commit('setDeconfigurationRecordInfo', deconfigRecords);
        })
        .catch((error) => console.log(error));
    },
    async clearAllEntries({ dispatch }, data) {
      return await api
        .post(
          '/redfish/v1/Systems/system/LogServices/HardwareIsolation/Actions/LogService.ClearLog'
        )
        .then(() => dispatch('getDeconfigurationRecordInfo'))
        .then(() =>
          i18n.tc('pageDeconfigurationRecords.toast.successDelete', data.length)
        )
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.tc('pageDeconfigurationRecords.toast.errorDelete', data.length)
          );
        });
    },
  },
};

export default DeconfigurationRecordsStore;
