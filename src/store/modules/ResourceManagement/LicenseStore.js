import api from '@/store/api';
import i18n from '@/i18n';

const parseData = (data) => {
  const [resourceId = '--', sequenceNumber = '--'] =
    data?.SerialNumber?.split('-') || '';
  const expirationDate = data?.ExpirationDate
    ? new Date(data.ExpirationDate)
    : '--';
  const licensed = data?.LicenseScope?.MaxNumberOfDevices || '--';

  return {
    licensed,
    resourceId,
    sequenceNumber,
    expirationDate,
  };
};

const LicenseStore = {
  namespaced: true,
  state: {
    licenses: {},
  },
  getters: {
    licenses: (state) => state.licenses,
    processorInfo: (state) => parseData(state.licenses.PermProcs),
    memoryInfo: (state) => parseData(state.licenses.PermMem),
    firmwareAccessKeyInfo: (state) => parseData(state.licenses.UAK),
    aixAccessKeyInfo: (state) => parseData(state.licenses.AIXUAK),
  },
  mutations: {
    setLicenses: (state, licenses) => (state.licenses = licenses),
  },
  actions: {
    async getLicenses({ commit }) {
      return await api
        .get('/redfish/v1/LicenseService/Licenses')
        .then(({ data: { Members = [] } }) => {
          return Members.map((member) => api.get(member['@odata.id']));
        })
        .then((promises) => api.all(promises))
        .then((response) => {
          const data = response.reduce((acc, { data }) => {
            acc[data.Id] = data;
            return acc;
          }, {});
          commit('setLicenses', data);
        })
        .catch((error) => {
          console.log('Licenses', error);
        });
    },
    async activateLicense(_, licenseKey) {
      return await api
        .post('/redfish/v1/LicenseService/Licenses', {
          LicenseString: licenseKey,
        })
        .then(() => {
          return i18n.t('pageCapacityOnDemand.activation.toast.success');
        })
        .catch((error) => {
          console.log('Licenses', error);
          throw new Error(
            i18n.t('pageCapacityOnDemand.activation.toast.error')
          );
        });
    },
  },
};

export default LicenseStore;
