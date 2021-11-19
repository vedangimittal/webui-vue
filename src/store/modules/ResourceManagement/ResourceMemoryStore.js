import api from '@/store/api';
import i18n from '@/i18n';

const ResourceMemoryStore = {
  namespaced: true,
  state: {
    logicalMemorySizeOptions: [],
    logicalMemorySize: null,
    ioAdapterCapacity: null,
  },
  getters: {
    logicalMemorySizeOptions: (state) => state.logicalMemorySizeOptions,
    logicalMemorySize: (state) => state.logicalMemorySize,
    ioAdapterCapacity: (state) => state.ioAdapterCapacity,
  },
  mutations: {
    setLogicalMemorySizeOptions: (state, logicalMemorySizeOptions) =>
      (state.logicalMemorySizeOptions = logicalMemorySizeOptions),
    setLogicalMemorySize: (state, logicalMemorySize) =>
      (state.logicalMemorySize = logicalMemorySize),
    setIoAdapterCapacity: (state, ioAdapterCapacity) =>
      (state.ioAdapterCapacity = ioAdapterCapacity),
  },
  actions: {
    async getMemorySizeOptions({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const memorySize = RegistryEntries.Attributes.filter(
            (Attribute) => Attribute.AttributeName == 'hb_memory_region_size'
          );
          let memorySizeOptions = memorySize[0].Value.map(
            ({ ValueName }) => ValueName
          );
          commit('setLogicalMemorySizeOptions', memorySizeOptions);
        })
        .catch((error) => console.log(error));
    },
    async getLogicalMemorySize({ commit }) {
      return await api
        .get('/redfish/v1/Systems/system/Bios/')
        .then(({ data: { Attributes: { hb_memory_region_size } } }) =>
          commit('setLogicalMemorySize', hb_memory_region_size)
        )
        .catch((error) => console.log(error));
    },
    async getIoAdapterCapacity({ commit }) {
      return await api
        .get(
          '/redfish/v1/Registries/BiosAttributeRegistry/BiosAttributeRegistry'
        )
        .then(({ data: { RegistryEntries } }) => {
          const ioAdapterCapacity = RegistryEntries.Attributes.filter(
            (Attribute) =>
              Attribute.AttributeName == 'hb_ioadapter_enlarged_capacity'
          );
          let ioEnlargedAdapterCapacity = ioAdapterCapacity[0].CurrentValue;
          commit('setIoAdapterCapacity', ioEnlargedAdapterCapacity);
        })
        .catch((error) => console.log(error));
    },
    async saveEnlargedCapacity({ commit }) {
      const updatedIoEnlargedCapacity = {
        Attributes: {
          hb_ioadapter_enlarged_capacity: this.state.resourceMemory
            .ioAdapterCapacity,
        },
      };
      return await api
        .patch(
          '/redfish/v1/Systems/system/Bios/Settings',
          updatedIoEnlargedCapacity
        )
        .then(() => {
          commit(
            'setIoAdapterCapacity',
            updatedIoEnlargedCapacity.Attributes.hb_ioadapter_enlarged_capacity
          );
          return i18n.t(
            'pageMemory.toast.successSavingAdapterEnlargedCapacity'
          );
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(
            i18n.t('pageMemory.toast.errorSavingAdapterEnlargedCapacity')
          );
        });
    },
    async saveSettings({ commit }, logicalMemorySize) {
      const updatedMemorySize = {
        Attributes: { hb_memory_region_size: logicalMemorySize },
      };
      return await api
        .patch('/redfish/v1/Systems/system/Bios/Settings', updatedMemorySize)
        .then(() => {
          commit(
            'setlogicalMemorySize',
            updatedMemorySize.Attributes.hb_memory_region_size
          );
          return i18n.t('pageMemory.toast.successSavingLogicalMemory');
        })
        .catch((error) => {
          console.log('error', error);
          throw new Error(i18n.t('pageMemory.toast.errorSavingLogicalMemory'));
        });
    },
  },
};

export default ResourceMemoryStore;
