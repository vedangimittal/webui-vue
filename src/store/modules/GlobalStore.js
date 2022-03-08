import api from '@/store/api';

const HOST_STATE = {
  on: 'xyz.openbmc_project.State.Host.HostState.Running',
  off: 'xyz.openbmc_project.State.Host.HostState.Off',
  error: 'xyz.openbmc_project.State.Host.HostState.Quiesced',
  diagnosticMode: 'xyz.openbmc_project.State.Host.HostState.DiagnosticMode',
};

const serverStateMapper = (hostState) => {
  switch (hostState) {
    case HOST_STATE.on:
    case 'On': // Redfish PowerState
      return 'on';
    case HOST_STATE.off:
    case 'Off': // Redfish PowerState
      return 'off';
    case HOST_STATE.error:
    case 'Quiesced': // Redfish Status
      return 'error';
    case HOST_STATE.diagnosticMode:
    case 'InTest': // Redfish Status
      return 'diagnosticMode';
    default:
      return 'unreachable';
  }
};

const GlobalStore = {
  namespaced: true,
  state: {
    bootProgress: null,
    assetTag: null,
    bmcTime: null,
    acfInstalled: false,
    expirationDate: null,
    modelType: null,
    serialNumber: null,
    serverStatus: 'unreachable',
    postCodeValue: null,
    languagePreference: localStorage.getItem('storedLanguage') || 'en-US',
    isUtcDisplay: localStorage.getItem('storedUtcDisplay')
      ? JSON.parse(localStorage.getItem('storedUtcDisplay'))
      : true,
    username: localStorage.getItem('storedUsername'),
    currentUser: JSON.parse(sessionStorage.getItem('storedCurrentUser')),
    isAuthorized: true,
  },
  getters: {
    bootProgress: (state) => state.bootProgress,
    isInPhypStandby: (state) =>
      // SystemHardwareInitializationComplete and after is "PHYP in standby"
      state.bootProgress === 'SystemHardwareInitializationComplete' ||
      state.bootProgress === 'SetupEntered' ||
      state.bootProgress === 'OSBootStarted' ||
      state.bootProgress === 'OSRunning',
    assetTag: (state) => state.assetTag,
    modelType: (state) => state.modelType,
    serialNumber: (state) => state.serialNumber,
    serverStatus: (state) => state.serverStatus,
    postCodeValue: (state) => state.postCodeValue,
    bmcTime: (state) => state.bmcTime,
    acfInstalled: (state) => state.acfInstalled,
    expirationDate: (state) => state.expirationDate,
    languagePreference: (state) => state.languagePreference,
    isUtcDisplay: (state) => state.isUtcDisplay,
    username: (state) => state.username,
    currentUser: (state) => state.currentUser,
    isServiceUser: (state) =>
      state.currentUser?.RoleId === 'OemIBMServiceAgent' || !state.currentUser,
    isAuthorized: (state) => state.isAuthorized,
  },
  mutations: {
    setBootProgress: (state, bootProgress) =>
      (state.bootProgress = bootProgress),
    setAssetTag: (state, assetTag) => (state.assetTag = assetTag),
    setModelType: (state, modelType) => (state.modelType = modelType),
    setSerialNumber: (state, serialNumber) =>
      (state.serialNumber = serialNumber),
    setBmcTime: (state, bmcTime) => (state.bmcTime = bmcTime),
    setAcfInstalled: (state, acfInstalled) =>
      (state.acfInstalled = acfInstalled),
    setExpirationDate: (state, expirationDate) =>
      (state.expirationDate = expirationDate),
    setServerStatus: (state, serverState) =>
      (state.serverStatus = serverStateMapper(serverState)),
    setPostCodeValue: (state, postCodeValue) =>
      (state.postCodeValue = postCodeValue),
    setLanguagePreference: (state, language) =>
      (state.languagePreference = language),
    setUsername: (state, username) => (state.username = username),
    setCurrentUser: (state, currentUser) => (state.currentUser = currentUser),
    setUtcTime: (state, isUtcDisplay) => (state.isUtcDisplay = isUtcDisplay),
    setUnauthorized: (state) => {
      state.isAuthorized = false;
      window.setTimeout(() => {
        state.isAuthorized = true;
      }, 100);
    },
  },
  actions: {
    async getBmcTime({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc')
        .then((response) => {
          const bmcDateTime = response.data.DateTime;
          const date = new Date(bmcDateTime);
          commit('setBmcTime', date);
        })
        .catch((error) => console.log(error));
    },
    async getServiceLogin({ commit }) {
      return await api
        .get('/redfish/v1/AccountService/Accounts/service')
        .then((response) => {
          commit('setAcfInstalled', response.data.Oem.IBM.ACF.ACFInstalled);
          commit('setExpirationDate', response.data.Oem.IBM.ACF.ExpirationDate);
        })
        .catch((error) => console.log(error));
    },
    getCurrentUser(
      { commit, getters },
      username = localStorage.getItem('storedUsername')
    ) {
      if (sessionStorage.getItem('storedCurrentUser')) return;
      return api
        .get(`/redfish/v1/AccountService/Accounts/${username}`)
        .then(({ data }) => {
          commit('setCurrentUser', data);
          sessionStorage.setItem(
            'storedCurrentUser',
            JSON.stringify(getters.currentUser)
          );
        })
        .catch((error) => console.log(error));
    },
    getSystemInfo({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(
          ({
            data: {
              AssetTag,
              Model,
              PowerState,
              SerialNumber,
              Status: { State } = {},
            },
          } = {}) => {
            commit('setAssetTag', AssetTag);
            commit('setSerialNumber', SerialNumber);
            commit('setModelType', Model);
            if (State === 'Quiesced' || State === 'InTest') {
              // OpenBMC's host state interface is mapped to 2 Redfish
              // properties "Status""State" and "PowerState". Look first
              // at State for certain cases.
              commit('setServerStatus', State);
            } else {
              commit('setServerStatus', PowerState);
            }
          }
        )
        .catch((error) => console.log(error));
    },
    async getBootProgress({ commit }) {
      api
        .get('/redfish/v1/Systems/system')
        .then(({ data }) => {
          const bootProgress = data.BootProgress.LastState;
          commit('setBootProgress', bootProgress);
        })
        .catch((error) => console.log(error));
    },
  },
};

export default GlobalStore;
