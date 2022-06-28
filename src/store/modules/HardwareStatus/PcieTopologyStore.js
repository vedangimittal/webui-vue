import api from '@/store/api';
import i18n from '@/i18n';

const PcieTopologyStore = {
  namespaced: true,
  state: {
    entries: [],
  },
  getters: {
    entries: (state) => state.entries,
  },
  mutations: {
    setEntries: (state, data) => {
      state.entries = data.map((pcie) => {
        return {
          id: pcie?.linkId,
          resetLinkAvailable: pcie?.resetLinkAvailable,
          resetLinkUri: pcie?.resetLinkUri,
          resetLinkValue: pcie?.resetLinkValue,
          parentId: pcie?.parentLinkId,
          linkStatus: pcie?.linkStatus,
          localPortLocation: pcie?.localPortLocation,
          remotePortLocation: pcie?.remotePortLocation,
          linkPropertiesSpeed: pcie?.linkSpeed,
          linkPropertiesWidth: pcie?.linkWidth,
          linkPropertiesType: pcie?.linkType,
          pcieBridge: pcie?.pcieHBLocation,
          cableLength: pcie?.cableLength,
          cablePartNumber: pcie?.cablePartNumber,
          cableStatus: pcie?.cableStatus,
          cableType: pcie?.cableType,
          ioSlots: pcie?.ioSlotLocation,
        };
      });
    },
  },
  actions: {
    async resetTheLink(_, requestBody) {
      const body = {
        Oem: {
          IBM: {
            LinkReset: true,
          },
        },
      };
      return await api.patch(requestBody.uri, body);
    },
    async refreshPage() {
      const body = {
        Oem: {
          IBM: {
            PCIeTopologyRefresh: true,
          },
        },
      };
      await api.patch('/redfish/v1/Systems/system/', body).catch((error) => {
        console.error('Error', error);
      });
    },
    async savePcie() {
      const body = {
        Oem: {
          IBM: {
            SavePCIeTopologyInfo: true,
          },
        },
      };
      await api.patch('/redfish/v1/Systems/system/', body).catch((error) => {
        console.error('Error', error);
      });
    },
    async getTopologyScreen({ commit }) {
      let chassisInfo = [];
      let fabricAdapterInfo = [];
      let cablesInfo = [];
      await api
        .get('redfish/v1/Chassis')
        .then(async ({ data: { Members = [] } }) => {
          let chassisLength = Members.length;
          let index = 0;
          while (index < chassisLength) {
            let chassisData = {};
            await api
              .get(Members[index]['@odata.id'])
              .then(async (chassisResponse) => {
                const singleChassisData = chassisResponse.data;
                chassisData['detailedInfo'] = {};
                chassisData['data'] = singleChassisData;
                await api
                  .get(chassisResponse.data.PCIeSlots['@odata.id'])
                  .then(async (pcieSlotsResponse) => {
                    chassisData.detailedInfo['pcieSlotsUri'] =
                      chassisResponse.data.PCIeSlots['@odata.id'];
                    chassisData.detailedInfo['pcieSlots'] = {};
                    chassisData.detailedInfo.pcieSlots['data'] =
                      pcieSlotsResponse.data;
                    let pcieSlotsLength = pcieSlotsResponse.data.Slots.length;
                    let j = 0;
                    chassisData.detailedInfo.pcieSlots['eachSlot'] = [];
                    while (j < pcieSlotsLength) {
                      const singleSlotData = {};
                      singleSlotData['data'] = pcieSlotsResponse.data.Slots[j];
                      if (
                        pcieSlotsResponse.data.Slots[j].Links?.PCIeDevice
                          .length > 0
                      ) {
                        await api
                          .get(
                            pcieSlotsResponse.data.Slots[j].Links
                              ?.PCIeDevice[0]['@odata.id']
                          )
                          .then(async (deviceResponse) => {
                            singleSlotData['pcieDevice'] = deviceResponse.data;
                            singleSlotData['pcieDeviceLink'] =
                              pcieSlotsResponse.data.Slots[
                                j
                              ].Links?.PCIeDevice[0]['@odata.id'];
                          })
                          .catch((error) => {
                            console.log('error', error);
                          });
                      }
                      if (
                        pcieSlotsResponse.data.Slots[j].Links?.Processors &&
                        pcieSlotsResponse.data.Slots[j].Links?.Processors
                          .length > 0
                      ) {
                        await api
                          .get(
                            pcieSlotsResponse.data.Slots[j].Links
                              ?.Processors[0]['@odata.id']
                          )
                          .then(async (processorResponse) => {
                            singleSlotData['processor'] =
                              processorResponse.data;
                            singleSlotData['processorLink'] =
                              pcieSlotsResponse.data.Slots[
                                j
                              ].Links?.Processors[0]['@odata.id'];
                          })
                          .catch((error) => {
                            console.log('error', error);
                          });
                      }
                      if (
                        pcieSlotsResponse.data.Slots[j].Links?.Oem?.IBM
                          ?.AssociatedAssembly.length > 0
                      ) {
                        await api
                          .get(
                            pcieSlotsResponse.data.Slots[j].Links?.Oem.IBM
                              .AssociatedAssembly[0]['@odata.id']
                          )
                          .then(async (assemblyResponse) => {
                            singleSlotData['associatedAssembly'] =
                              assemblyResponse.data;
                            singleSlotData['associatedAssemblyLink'] =
                              pcieSlotsResponse.data.Slots[
                                j
                              ].Links?.Oem?.IBM?.AssociatedAssembly[0][
                                '@odata.id'
                              ];
                          })
                          .catch((error) => {
                            console.log('error', error);
                          });
                      }
                      chassisData.detailedInfo.pcieSlots['eachSlot'].push(
                        singleSlotData
                      );
                      if (j < pcieSlotsLength) {
                        j++;
                      }
                    }
                  })
                  .catch((error) => {
                    console.log('error', error);
                  });
              })
              .catch((error) => {
                console.log('error', error);
              });
            chassisInfo.push(chassisData);
            if (index < chassisLength) {
              index++;
            }
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
      await api
        .get('redfish/v1/Systems/system/FabricAdapters')
        .then(async ({ data: { Members = [] } }) => {
          let adaptersLength = Members.length;
          let index = 0;
          while (index < adaptersLength) {
            let adapterData = {};
            adapterData['adapterMembers'] = Members;
            await api
              .get(Members[index]['@odata.id'])
              .then(async (adapterResponse) => {
                adapterData['data'] = adapterResponse.data;
                if (adapterResponse.data.Links?.PCIeDevices.length > 0) {
                  adapterData['pcieDeviceLink'] =
                    adapterResponse.data.Links?.PCIeDevices[0]['@odata.id'];
                  if (adapterResponse.data.Ports) {
                    adapterData['portsLink'] =
                      adapterResponse.data.Ports['@odata.id'];
                    await api
                      .get(adapterResponse.data.Ports['@odata.id'])
                      .then(async (singlePort) => {
                        adapterData['portsData'] = [];
                        const portsLength = singlePort.data.Members.length;
                        let j = 0;
                        while (j < portsLength) {
                          api
                            .get(singlePort.data.Members[j]['@odata.id'])
                            .then(async (singlePortValue) => {
                              adapterData['portsData'].push(
                                singlePortValue.data
                              );
                            })
                            .catch((error) => {
                              console.log('error', error);
                            });
                          if (j < portsLength) {
                            j++;
                          }
                        }
                      })
                      .catch((error) => {
                        console.log('error', error);
                      });
                  }
                }
              });
            if (index < adaptersLength) {
              index++;
            }
            fabricAdapterInfo.push(adapterData);
          }
        })
        .catch((error) => {
          console.log('error', error);
        });

      await api
        .get('redfish/v1/Cables')
        .then(async ({ data: { Members = [] } }) => {
          let cablesLength = Members.length;
          let index = 0;
          while (index < cablesLength) {
            let cablesData = {};
            await api
              .get(Members[index]['@odata.id'])
              .then(async (cablesResponse) => {
                cablesData['data'] = cablesResponse.data;
                cablesData['detailedInfo'] = {};
                cablesData.detailedInfo.downstreamChassis = [];
                cablesData.detailedInfo.downstreamResources = [];
                cablesData.detailedInfo.upstreamPorts = [];
                cablesData.detailedInfo.downstreamPorts = [];
                if (
                  cablesResponse.data.Links?.DownstreamResources &&
                  cablesResponse.data.Links?.DownstreamResources?.length > 0
                ) {
                  cablesData.detailedInfo.downstreamResourcesUri =
                    cablesResponse.data.Links?.DownstreamResources[0][
                      '@odata.id'
                    ];
                  await api
                    .get(
                      cablesResponse.data.Links?.DownstreamResources[0][
                        '@odata.id'
                      ]
                    )
                    .then(async (downstreamResources) => {
                      const downstreamUri =
                        downstreamResources.data['@odata.id'];
                      const parentUri = downstreamUri
                        .split('/Assembly')
                        .shift();
                      await api
                        .get(parentUri)
                        .then(async (chassisRes) => {
                          await api
                            .get(chassisRes.data.PCIeSlots['@odata.id'])
                            .then(async (pcieslotRes) => {
                              cablesData.detailedInfo.downstreamResources.push({
                                data: downstreamResources.data,
                                pcieSlots: pcieslotRes.data.Slots,
                                pcieSlotsUri:
                                  chassisRes.data.PCIeSlots['@odata.id'],
                              });
                            })
                            .catch((error) => {
                              console.log('error', error);
                            });
                        })
                        .catch((error) => {
                          console.log('error', error);
                        });
                    })
                    .catch((error) => {
                      console.log('error', error);
                    });
                }
                if (
                  cablesResponse.data.Links?.DownstreamChassis &&
                  cablesResponse.data.Links?.DownstreamChassis?.length > 0
                ) {
                  await api
                    .get(
                      cablesResponse.data.Links?.DownstreamChassis[0][
                        '@odata.id'
                      ]
                    )
                    .then(async (downstreamChassis) => {
                      await api
                        .get(downstreamChassis.data.PCIeSlots['@odata.id'])
                        .then(async (pcieSlotsResp) => {
                          cablesData.detailedInfo.downstreamChassis.push({
                            data: downstreamChassis.data,
                            pcieSlots: pcieSlotsResp.data.Slots,
                            pcieSlotsUri:
                              downstreamChassis.data.PCIeSlots['@odata.id'],
                          });
                        })
                        .catch((error) => {
                          console.log('error', error);
                        });
                    })
                    .catch((error) => {
                      console.log('error', error);
                    });
                }
                if (
                  cablesResponse.data.Links?.UpstreamPorts &&
                  cablesResponse.data.Links?.UpstreamPorts?.length > 0
                ) {
                  await api
                    .get(
                      cablesResponse.data.Links?.UpstreamPorts[0]['@odata.id']
                    )
                    .then(async (upstreamPorts) => {
                      cablesData.detailedInfo.upstreamPorts.push(
                        upstreamPorts.data
                      );
                      const upstreamPortsUri = upstreamPorts.data['@odata.id'];
                      const grandparentUri = upstreamPortsUri
                        .split('/Ports')
                        .shift();
                      cablesData.detailedInfo.grandparentUri = grandparentUri;
                      await api
                        .get(grandparentUri)
                        .then(async (grandparentResponse) => {
                          cablesData.detailedInfo['grandParentInfo'] = {};
                          cablesData.detailedInfo.grandParentInfo.data =
                            grandparentResponse.data;
                          cablesData.detailedInfo.grandParentInfo.expanderDevice =
                            grandparentResponse.data;
                          if (
                            grandparentResponse.data.Links?.PCIeDevices &&
                            grandparentResponse.data.Links?.PCIeDevices.length >
                              0
                          ) {
                            await api
                              .get(
                                grandparentResponse.data.Links?.PCIeDevices[0][
                                  '@odata.id'
                                ]
                              )
                              .then(async (pcieDeviceResponse) => {
                                cablesData.detailedInfo.grandParentInfo.pcieDevice =
                                  pcieDeviceResponse.data;
                                await api
                                  .get(
                                    pcieDeviceResponse.data.Links?.Oem?.IBM
                                      ?.PCIeSlot['@odata.id']
                                  )
                                  .then(async (slotResponse) => {
                                    cablesData.detailedInfo.grandParentInfo.expanderSlots =
                                      slotResponse.data.Slots;
                                  })
                                  .catch((error) => {
                                    console.log('error', error);
                                  });
                              })
                              .catch((error) => {
                                console.log('error', error);
                              });
                          }
                        })
                        .catch((error) => {
                          console.log('error', error);
                        });
                    })
                    .catch((error) => {
                      console.log('error', error);
                    });
                }
                if (
                  cablesResponse.data.Links?.DownstreamPorts &&
                  cablesResponse.data.Links?.DownstreamPorts?.length > 0
                ) {
                  await api
                    .get(
                      cablesResponse.data.Links?.DownstreamPorts[0]['@odata.id']
                    )
                    .then(async (dpResponse) => {
                      let downstreamPortUri = dpResponse.data['@odata.id'];
                      const gparentUri = downstreamPortUri
                        .split('/Ports')
                        .shift();
                      await api
                        .get(gparentUri)
                        .then(async (chassisResp) => {
                          if (
                            chassisResp.data?.Location?.PartLocation
                              ?.ServiceLabel
                          ) {
                            cablesData.detailedInfo.downstreamPorts.push({
                              data: dpResponse.data,
                              grandParentLocation:
                                chassisResp.data?.Location?.PartLocation
                                  ?.ServiceLabel,
                            });
                          }
                        })
                        .catch((error) => {
                          console.log('error', error);
                        });
                    });
                }
              })
              .catch((error) => {
                console.log('error', error);
              });
            if (index < cablesLength) {
              index++;
            }
            cablesInfo.push(cablesData);
          }
        })
        .catch((error) => {
          console.log('error', error);
        });

      const rows = [];
      chassisInfo.map(async (chassis) => {
        chassis.detailedInfo.pcieSlots.eachSlot.map(async (slot) => {
          if (slot.data.Oem?.IBM?.LinkId !== 0) {
            let row = {};
            row.linkId = slot.data.Oem?.IBM?.LinkId;
            row.resetLinkUri = slot.data.Links?.PCIeDevice[0]['@odata.id'];
            await api
              .get(row.resetLinkUri)
              .then(async (resetLinkResponse) => {
                if (resetLinkResponse.data.Oem?.IBM) {
                  row.resetLinkAvailable = true;
                  row.resetLinkValue =
                    resetLinkResponse.data.Oem?.IBM?.LinkReset;
                } else {
                  row.resetLinkAvailable = false;
                }
              })
              .catch((error) => {
                console.log('error', error);
              });
            if (
              slot?.processor &&
              slot?.processor?.Location?.PartLocation?.ServiceLabel
            ) {
              row.pcieHBLocation = {
                locationIndicatorActive:
                  slot?.processor?.LocationIndicatorActive,
                locationNumber:
                  slot?.processor?.Location?.PartLocation?.ServiceLabel,
                uri: slot?.processor['@odata.id'],
              };
            } else {
              row.pcieHBLocation = {};
            }
            row.parentLinkId = 'Not Applicable';
            row.linkStatus = 'Open';
            row.linkType = 'Primary';
            row.linkSpeed = 'unknown';
            row.linkWidth = 'unknown';
            row.localPortLocation = [];
            row.remotePortLocation = [];
            row.ioSlotLocation = [];
            if (slot?.data?.Location?.PartLocation?.ServiceLabel) {
              row.ioSlotLocation.push({
                locationIndicatorActive: slot?.data?.LocationIndicatorActive,
                locationNumber:
                  slot?.data?.Location?.PartLocation?.ServiceLabel,
                uri: chassis?.detailedInfo?.pcieSlots?.data['@odata.id'],
              });
            }
            row.cablePartNumber = [];
            row.cableLength = [];
            row.cableType = [];
            row.cableStatus = [];
            if (slot?.pcieDevice) {
              row.linkSpeed = slot?.pcieDevice?.PCIeInterface?.PCIeType;
              row.linkWidth = slot?.pcieDevice?.PCIeInterface?.LanesInUse;
              if (
                slot?.pcieDevice?.Status?.State === 'Enabled' &&
                slot?.pcieDevice?.Status?.Health === 'OK'
              ) {
                row['linkStatus'] = 'Operational';
              } else if (
                slot?.pcieDevice?.Status?.State === 'Enabled' &&
                slot?.pcieDevice?.Status?.Health !== 'OK'
              ) {
                row['linkStatus'] = 'Degraded';
              } else if (slot?.pcieDevice?.Status?.State === 'Absent') {
                row['linkStatus'] = 'Open';
              } else if (
                slot?.pcieDevice?.Status?.State === 'UnavailableOffline'
              ) {
                row['linkStatus'] = 'Failed';
              } else if (slot?.pcieDevice?.Status?.State === 'StandbyOffline') {
                row['linkStatus'] = 'Inactive';
              } else {
                row['linkStatus'] = 'Unknown';
              }
              fabricAdapterInfo.map((adapter) => {
                if (
                  adapter?.pcieDeviceLink &&
                  adapter.pcieDeviceLink === slot.pcieDeviceLink
                ) {
                  adapter.portsData.map((port) => {
                    row.localPortLocation.push({
                      locationIndicatorActive: port?.LocationIndicatorActive,
                      locationNumber:
                        port?.Location?.PartLocation?.ServiceLabel,
                      uri: port['@odata.id'],
                    });
                  });
                }
              });
            }
            cablesInfo.map((cable) => {
              if (cable.detailedInfo.downstreamResources.length > 0) {
                if (
                  cable.detailedInfo.downstreamResources[0].data[
                    '@odata.type'
                  ].endsWith('Assembly')
                ) {
                  if (
                    slot.associatedAssemblyLink ===
                    cable.detailedInfo.downstreamResourcesUri
                  ) {
                    for (
                      let i = 0;
                      i <
                      cable.detailedInfo.grandParentInfo.expanderSlots.length;
                      i++
                    ) {
                      const expanderSlot =
                        cable.detailedInfo.grandParentInfo.expanderSlots[i];
                      row['linkType'] = 'Secondary';
                      row['parentLinkId'] = expanderSlot.Oem?.IBM?.LinkId;
                      break;
                    }
                  }
                }
              }
              if (cable.detailedInfo.downstreamChassis.length > 0) {
                cable.detailedInfo.downstreamChassis[0].pcieSlots.map(
                  (singleSlot) => {
                    if (
                      slot.Links?.pcieDevice[0]['@odata.id'] ===
                      singleSlot.Links?.PCIeDevice[0]['@odata.id']
                    ) {
                      for (
                        let i = 0;
                        i <
                        cable.detailedInfo.grandParentInfo.expanderSlots.length;
                        i++
                      ) {
                        const expanderSlot =
                          cable.detailedInfo.grandParentInfo.expanderSlots[i];
                        row['linkType'] = 'Secondary';
                        row['parentLinkId'] = expanderSlot.Oem?.IBM?.LinkId;
                        break;
                      }
                    }
                  }
                );
              }
              if (cable.detailedInfo.upstreamPorts.length > 0) {
                fabricAdapterInfo.map((adapter) => {
                  if (
                    adapter?.pcieDeviceLink &&
                    adapter.pcieDeviceLink === slot.pcieDeviceLink
                  ) {
                    if (
                      cable.detailedInfo.upstreamPorts[0][
                        '@odata.id'
                      ].startsWith(adapter.data['@odata.id'])
                    ) {
                      if (cable.detailedInfo.downstreamResources.length > 0) {
                        if (
                          cable.detailedInfo.downstreamResources[0].data[
                            '@odata.type'
                          ].endsWith('Assembly')
                        ) {
                          row.ioSlotLocation = [];
                          cable.detailedInfo.downstreamResources[0].pcieSlots.map(
                            (slot2) => {
                              if (
                                slot2.Links?.Oem?.IBM?.AssociatedAssembly ===
                                cable.detailedInfo.downstreamResourcesUri
                              ) {
                                if (
                                  slot2?.Location?.PartLocation?.ServiceLabel
                                ) {
                                  const duplicate = row.ioSlotLocation.find(
                                    (obj) => {
                                      if (
                                        obj.locationNumber ===
                                        slot2?.Location?.PartLocation
                                          ?.ServiceLabel
                                      ) {
                                        return true;
                                      }
                                    }
                                  );
                                  if (duplicate === undefined) {
                                    row.ioSlotLocation.push({
                                      locationIndicatorActive:
                                        slot2?.LocationIndicatorActive,
                                      locationNumber:
                                        slot2?.Location?.PartLocation
                                          ?.ServiceLabel,
                                      uri:
                                        cable.detailedInfo
                                          .downstreamResources[0].pcieSlotsUri,
                                    });
                                  }
                                }
                              }
                            }
                          );
                        }
                      } else if (
                        cable.detailedInfo.downstreamChassis.length > 0
                      ) {
                        row.ioSlotLocation = [];
                        cable.detailedInfo.downstreamChassis[0].pcieSlots.map(
                          (dsSlot) => {
                            if (dsSlot?.Location?.PartLocation?.ServiceLabel) {
                              if (
                                dsSlot?.Location?.PartLocation?.ServiceLabel.startsWith(
                                  cable.detailedInfo.downstreamPorts[0]
                                    .grandParentLocation
                                )
                              ) {
                                const duplicate = row.ioSlotLocation.find(
                                  (obj) => {
                                    if (
                                      obj.locationNumber ===
                                      dsSlot?.Location?.PartLocation
                                        ?.ServiceLabel
                                    ) {
                                      return true;
                                    }
                                  }
                                );
                                if (duplicate === undefined) {
                                  row.ioSlotLocation.push({
                                    locationIndicatorActive:
                                      dsSlot?.LocationIndicatorActive,
                                    locationNumber:
                                      dsSlot?.Location?.PartLocation
                                        ?.ServiceLabel,
                                    uri:
                                      cable.detailedInfo.downstreamChassis[0]
                                        .pcieSlotsUri,
                                  });
                                }
                              }
                            }
                          }
                        );

                        if (
                          cable.detailedInfo.downstreamPorts[0].data?.Location
                            ?.PartLocation?.ServiceLabel
                        ) {
                          row.remotePortLocation.push({
                            locationIndicatorActive:
                              cable.detailedInfo.downstreamPorts[0].data
                                ?.LocationIndicatorActive,
                            locationNumber:
                              cable.detailedInfo.downstreamPorts[0].data
                                ?.Location?.PartLocation?.ServiceLabel,
                            uri:
                              cable.detailedInfo.downstreamPorts[0].data[
                                '@odata.id'
                              ],
                          });
                        }
                        if (cable.data.PartNumber) {
                          row['cablePartNumber'].push(cable.data.PartNumber);
                        }
                        if (cable.data.LengthMeters) {
                          row['cableLength'].push(cable.data.LengthMeters);
                        }
                        if (cable.data.CableType) {
                          row['cableType'].push(cable.data.CableType);
                        }
                        if (
                          cable.data.Status?.State === 'StandbyOffline' &&
                          cable.data.CableStatus === 'Disabled'
                        ) {
                          row['cableStatus'].push('PoweredOff');
                        } else if (
                          cable.data.Status?.State === 'StandbyOffline' &&
                          cable.data.CableStatus === 'Normal'
                        ) {
                          row['cableStatus'].push('Inactive');
                        } else if (cable.data.Status?.State === 'Enabled') {
                          row['cableStatus'].push('Running');
                        } else {
                          row['cableStatus'].push('unknown');
                        }
                      }
                    }
                  }
                });
              }
            });
            rows.push(row);
            commit('setEntries', rows);
          }
        });
      });
    },
    async getLedValue(_, requestBody) {
      const uri = requestBody.uri;
      return await api.get(uri);
    },
    async updateLedValue(_, requestBody) {
      await api.all(
        [''].map(async () => {
          if (requestBody.type === 'ioSlots') {
            const uri = requestBody.value.uri;
            let req = [];
            await api.get(uri).then(async (ioSlotRes) => {
              const tempSlots = ioSlotRes.data.Slots;
              await api.all(
                tempSlots.map(async (tempSlot) => {
                  if (
                    tempSlot.Location?.PartLocation?.ServiceLabel ===
                    requestBody.value.locationNumber
                  ) {
                    req.push({
                      LocationIndicatorActive: requestBody.value.led,
                    });
                  } else {
                    req.push({});
                  }
                })
              );
            });
            await api.patch(uri, { Slots: req });
          } else {
            const uri = requestBody.value.uri;
            const updatedIdentifyLedValue = {
              LocationIndicatorActive: requestBody.value.led,
            };
            await api.patch(uri, updatedIdentifyLedValue).catch((error) => {
              console.log('error', error);
              if (!requestBody.locationIndicatorActive) {
                throw new Error(
                  i18n.t('pageInventory.toast.errorEnableIdentifyLed')
                );
              } else {
                throw new Error(
                  i18n.t('pageInventory.toast.errorDisableIdentifyLed')
                );
              }
            });
          }
        })
      );
    },
    async getAllLedValues(_, selectedObj) {
      let returningObj = {
        pcieBridge: [],
        localPortLocation: [],
        remotePortLocation: [],
        ioSlots: [],
      };
      await api.all(
        [''].map(async () => {
          if (selectedObj.pcieBridge?.uri) {
            await api.get(selectedObj.pcieBridge?.uri).then(({ data }) => {
              returningObj.pcieBridge.push({
                led: data.LocationIndicatorActive,
                locationNumber: data.Location?.PartLocation?.ServiceLabel,
                uri: data['@odata.id'],
              });
            });
          }
          if (selectedObj.localPortLocation.length > 0) {
            await api.all(
              selectedObj.localPortLocation.map(async (local) => {
                await api.get(local.uri).then(({ data }) => {
                  returningObj.localPortLocation.push({
                    led: data.LocationIndicatorActive,
                    locationNumber: data.Location?.PartLocation?.ServiceLabel,
                    uri: data['@odata.id'],
                  });
                });
              })
            );
          }
          if (selectedObj.remotePortLocation.length > 0) {
            await api.all(
              selectedObj.remotePortLocation.map(async (local) => {
                await api.get(local.uri).then(({ data }) => {
                  returningObj.remotePortLocation.push({
                    led: data.LocationIndicatorActive,
                    locationNumber: data.Location?.PartLocation?.ServiceLabel,
                    uri: data['@odata.id'],
                  });
                });
              })
            );
          }
          if (selectedObj.ioSlots.length > 0) {
            await api.all(
              selectedObj.ioSlots.map(async (ioSlot) => {
                api.get(ioSlot.uri).then(async (ioSlotResponse) => {
                  const tempSlots = ioSlotResponse.data.Slots;
                  await api.all(
                    tempSlots.map((tempSlot) => {
                      if (
                        tempSlot.Location?.PartLocation?.ServiceLabel ===
                        ioSlot.locationNumber
                      ) {
                        returningObj.ioSlots.push({
                          led: tempSlot.LocationIndicatorActive,
                          locationNumber: ioSlot.locationNumber,
                          uri: ioSlot.uri,
                        });
                      }
                    })
                  );
                });
              })
            );
          }
        })
      );
      return returningObj;
    },
  },
};

export default PcieTopologyStore;
