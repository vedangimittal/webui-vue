import api from '@/store/api';
import i18n from '@/i18n';

const NetworkStore = {
  namespaced: true,
  state: {
    dchpEnabledState: false,
    networkSettings: [],
    selectedInterfaceId: '', // which tab is selected
    selectedInterfaceIndex: 0, // which tab is selected
  },
  getters: {
    dchpEnabledState: (state) => state.dchpEnabledState,
    networkSettings: (state) => state.networkSettings,
    selectedInterfaceId: (state) => state.selectedInterfaceId,
    selectedInterfaceIndex: (state) => state.selectedInterfaceIndex,
  },
  mutations: {
    setDchpEnabledState: (state, dchpEnabledState) =>
      (state.dchpEnabledState = dchpEnabledState),
    setDomainNameState: (state, domainState) =>
      (state.domainState = domainState),
    setDnsState: (state, dnsState) => (state.dnsState = dnsState),
    setNtpState: (state, ntpState) => (state.ntpState = ntpState),
    setSelectedInterfaceId: (state, selectedInterfaceId) =>
      (state.selectedInterfaceId = selectedInterfaceId),
    setSelectedInterfaceIndex: (state, selectedInterfaceIndex) =>
      (state.selectedInterfaceIndex = selectedInterfaceIndex),
    setNetworkSettings: (state, data) => {
      state.networkSettings = data.map(({ data }) => {
        const {
          DHCPv4,
          HostName,
          Id,
          IPv4Addresses,
          IPv4StaticAddresses,
          MACAddress,
          StaticNameServers,
        } = data;
        return {
          defaultGateway: IPv4StaticAddresses[0]?.Gateway, //First static gateway is the default gateway
          dhcpAddress: IPv4Addresses.filter(
            (ipv4) => ipv4.AddressOrigin === 'DHCP'
          ),
          dhcpEnabled: DHCPv4.DHCPEnabled,
          hostname: HostName,
          id: Id,
          ipv4: IPv4Addresses,
          macAddress: MACAddress,
          staticAddress: IPv4StaticAddresses[0]?.Address, // Display first static address on overview page
          staticNameServers: StaticNameServers,
          useDnsEnabled: DHCPv4.UseDNSServers,
          useDomainNameEnabled: DHCPv4.UseDomainName,
          useNtpEnabled: DHCPv4.UseNTPServers,
        };
      });
    },
  },
  actions: {
    async getEthernetData({ commit }) {
      return await api
        .get('/redfish/v1/Managers/bmc/EthernetInterfaces')
        .then((response) =>
          response.data.Members.map(
            (ethernetInterface) => ethernetInterface['@odata.id']
          )
        )
        .then((ethernetInterfaceIds) =>
          api.all(
            ethernetInterfaceIds.map((ethernetInterface) =>
              api.get(ethernetInterface)
            )
          )
        )
        .then((ethernetInterfaces) => {
          const ethernetData = ethernetInterfaces.map(
            (ethernetInterface) => ethernetInterface.data
          );

          commit('setNetworkSettings', ethernetInterfaces);
          commit('setSelectedInterfaceId', ethernetData[0].Id);
        })
        .catch((error) => {
          console.log('Network Data:', error);
        });
    },
    async saveDomainNameState({ commit, state, dispatch }, domainState) {
      commit('setDomainNameState', domainState);
      const data = {
        DHCPv4: {
          UseDomainName: domainState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.domainName'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDomainNameState', !domainState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.domainName'),
            })
          );
        });
    },
    async saveDnsState({ commit, state, dispatch }, dnsState) {
      commit('setDnsState', dnsState);
      const data = {
        DHCPv4: {
          UseDNSServers: dnsState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDnsState', !dnsState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
    async saveNtpState({ commit, state, dispatch }, ntpState) {
      commit('setNtpState', ntpState);
      const data = {
        DHCPv4: {
          UseNTPServers: ntpState,
        },
      };
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ntp'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setNtpState', !ntpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ntp'),
            })
          );
        });
    },
    async saveDhcpEnabledState({ commit, state, dispatch }, dhcpState) {
      commit('setDhcpEnabled', dhcpState);
      const data = {
        DHCPv4: {
          DHCPEnabled: dhcpState,
        },
      };
      // If DHCP is enabled and the DHCP network is not configured, then the
      // system will go down and network settings will need to be restored
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          data
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dhcp'),
          });
        })
        .catch((error) => {
          console.log(error);
          commit('setDhcpEnabled', !dhcpState);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dhcp'),
            })
          );
        });
    },
    async setSelectedTabIndex({ commit }, tabIndex) {
      commit('setSelectedInterfaceIndex', tabIndex);
    },
    async setSelectedTabId({ commit }, tabId) {
      commit('setSelectedInterfaceId', tabId);
    },
    async saveIpv4Address({ dispatch, state }, ipv4Form) {
      const originalAddresses = state.networkSettings[
        state.selectedInterfaceIndex
      ].ipv4.map((ipv4) => {
        const { Address, SubnetMask, Gateway } = ipv4;
        return {
          Address,
          SubnetMask,
          Gateway,
        };
      });
      const newAddress = [ipv4Form];
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: originalAddresses.concat(newAddress) }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async editIpv4Address({ dispatch, state }, ipv4TableData) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { IPv4StaticAddresses: ipv4TableData }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.ipv4'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.ipv4'),
            })
          );
        });
    },
    async saveSettings({ state, dispatch }, interfaceSettingsForm) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          interfaceSettingsForm
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.network'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.network'),
            })
          );
        });
    },
    async saveDnsAddress({ dispatch, state }, dnsForm) {
      const newAddress = dnsForm;
      const originalAddresses =
        state.networkSettings[state.selectedInterfaceIndex].staticNameServers;
      const newDnsArray = originalAddresses.concat(newAddress);
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: newDnsArray }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
    async editDnsAddress({ dispatch, state }, dnsTableData) {
      return api
        .patch(
          `/redfish/v1/Managers/bmc/EthernetInterfaces/${state.selectedInterfaceId}`,
          { StaticNameServers: dnsTableData }
        )
        .then(dispatch('getEthernetData'))
        .then(() => {
          return i18n.t('pageNetwork.toast.successSaveNetworkSettings', {
            setting: i18n.t('pageNetwork.dns'),
          });
        })
        .catch((error) => {
          console.log(error);
          throw new Error(
            i18n.t('pageNetwork.toast.errorSaveNetworkSettings', {
              setting: i18n.t('pageNetwork.dns'),
            })
          );
        });
    },
  },
};

export default NetworkStore;
