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
        .then(async ({ data: { Members = [] } = {} }) => {
          const manualMember = Members.filter(
            (item) => item.Severity === 'Warning' && !item.AdditionalDataURI
          );
          let LocationMap = [];
          await api.all(
            manualMember.map(async (item) => {
              let uri = item.Links?.OriginOfCondition['@odata.id'];
              if (uri.toString().includes('Processors')) {
                uri = uri.slice(0, uri.lastIndexOf('/'));
                uri = uri.slice(0, uri.lastIndexOf('/'));
              }
              await api.get(uri).then(async (response) => {
                let locationCode =
                  response.data.Location.PartLocation.ServiceLabel;
                let locationId = item.Id;
                LocationMap.push({
                  locationId: locationId,
                  locationCode: locationCode,
                });
              });
              return api.get(uri).catch((error) => {
                console.log(error);
                return error;
              });
            })
          );
          const deconfigRecords = Members.map((log) => {
            let locationCode = '';
            LocationMap.map((item) => {
              if (item.locationId == log.Id) locationCode = item.locationCode;
            });
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
              location: locationCode,
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
