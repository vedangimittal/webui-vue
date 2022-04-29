import api, { getResponseCount } from '@/store/api';
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
              id: Id,
              type: EntryType,
              srcDetails: EventId,
              severity: Severity,
              date: new Date(Created),
              description: Message,
              name: Name,
              filterByStatus: Resolved ? 'Resolved' : 'Unresolved',
              status: Resolved, //true or false
              uri: log['@odata.id'],
              additionalDataUri: AdditionalDataURI,
            };
          });
          commit('setDeconfigurationRecordInfo', deconfigRecords);
        })
        .catch((error) => console.log(error));
    },
    async deleteAllEntries({ dispatch }, data) {
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
    async deleteRecords({ dispatch }, uris = []) {
      const promises = uris.map((uri) =>
        api.delete(uri).catch((error) => {
          console.log(error);
          return error;
        })
      );
      return await api
        .all(promises)
        .then((response) => {
          dispatch('getDeconfigurationRecordInfo');
          return response;
        })
        .then(
          api.spread((...responses) => {
            const { successCount, errorCount } = getResponseCount(responses);
            const toastMessages = [];

            if (successCount) {
              const message = i18n.tc(
                'pageDeconfigurationRecords.toast.successDelete',
                successCount
              );
              toastMessages.push({ type: 'success', message });
            }

            if (errorCount) {
              const message = i18n.tc(
                'pageDeconfigurationRecords.toast.errorDelete',
                errorCount
              );
              toastMessages.push({ type: 'error', message });
            }

            return toastMessages;
          })
        );
    },
  },
};

export default DeconfigurationRecordsStore;
