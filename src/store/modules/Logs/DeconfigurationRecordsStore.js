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
          const allMembers = await api.all(
            Members.map(async (member) => {
              // Check to see if record has @odata.id
              const hasOdataId = member?.Links?.OriginOfCondition?.['@odata.id']
                ? true
                : false;

              let url = null;
              let arrayNumber = null;

              if (hasOdataId) {
                url = member?.Links?.OriginOfCondition?.['@odata.id']
                  .split('/SubProcessors')
                  .shift();
              } else {
                url = member?.Links?.OriginOfCondition;
                arrayNumber = url.split('Assemblies/').pop();
              }

              await api.get(url).then(async ({ data }) => {
                // Has @odata.id, other gaurds
                if (hasOdataId) {
                  member.LocationCode =
                    data.Location?.PartLocation?.ServiceLabel;
                } else {
                  if (arrayNumber) {
                    const tpmObject = data.Assemblies.filter((member) => {
                      return (
                        member['@odata.id'] ==
                        `/redfish/v1/Chassis/chassis/Assembly#/Assemblies/${arrayNumber}`
                      );
                    })[0];

                    member.LocationCode =
                      tpmObject.Location?.PartLocation?.ServiceLabel;
                  }
                }
              });
              return member;
            })
          );

          const deconfigRecords = await api.all(
            allMembers.map(async (log) => {
              const {
                Id,
                Severity,
                Created,
                Message,
                Name,
                AdditionalDataURI,
                AdditionalData = AdditionalDataURI
                  ? await api
                      .get(AdditionalDataURI.split('/attachment').shift())
                      .then(async ({ data }) => await data)
                  : null,
                EntryType,
                LocationCode,
              } = log;
              return {
                additionalDataUri: AdditionalDataURI,
                date: new Date(Created),
                description: Message,
                filterByStatus: AdditionalData?.Resolved
                  ? 'Resolved'
                  : 'Unresolved',
                id: Id,
                name: Name,
                srcDetails: AdditionalData?.EventId,
                status: AdditionalData?.Resolved, //true or false
                type: EntryType,
                uri: log['@odata.id'],
                severity:
                  Severity === 'Critical'
                    ? 'Fatal'
                    : Severity === 'Warning'
                    ? 'Predictive'
                    : Severity === 'OK'
                    ? 'Manual'
                    : '--',
                location: LocationCode,
              };
            })
          );
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
