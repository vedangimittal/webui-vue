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
    async getTopologyScreen({ commit }) {
      const rows = [];

      // Chassis
      await api
        .get('redfish/v1/Chassis')
        .then(async ({ data: { Members = [] } }) => {
          return await api.all(
            Members.map(async (member) => {
              return await api
                .get(member['@odata.id'])
                .then(async ({ data }) => {
                  return data;
                });
            })
          );
        })
        .then(async (chassisCollection) => {
          return await api.all(
            chassisCollection.map(async (chassis) => {
              return await api
                .get(chassis.PCIeSlots['@odata.id'])
                .then(async ({ data }) => {
                  const a = data.Slots.length;
                  let i = 0;
                  while (i < a) {
                    const slot = data.Slots[i];
                    await api.all(
                      [''].map(async () => {
                        let row = {};
                        row.linkId = slot.Oem.IBM.LinkId;
                        row.resetLinkUri =
                          slot.Links?.PCIeDevice[0]['@odata.id'];
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
                          });
                        const processor = slot.Links?.Processors;
                        if (processor) {
                          row.pcieHBLocation = {
                            locationIndicatorActive:
                              processor?.LocationIndicatorActive,
                            locationNumber:
                              processor?.Location?.PartLocation?.ServiceLabel,
                            uri: processor['@odata.id'],
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
                        if (slot?.Location?.PartLocation?.ServiceLabel) {
                          row.ioSlotLocation.push({
                            locationIndicatorActive:
                              slot?.LocationIndicatorActive,
                            locationNumber:
                              slot?.Location?.PartLocation?.ServiceLabel,
                            uri: chassis.PCIeSlots['@odata.id'],
                          });
                        }
                        row.cablePartNumber = [];
                        row.cableLength = [];
                        row.cableType = [];
                        row.cableStatus = [];
                        const pcieDevicesCollection = slot?.Links?.PCIeDevice;
                        await api.all(
                          [''].map(async () => {
                            if (pcieDevicesCollection.length > 0) {
                              const deviceInSlotLink =
                                pcieDevicesCollection[0]['@odata.id'];
                              await api
                                .get(deviceInSlotLink)
                                .then(async (singlePcieResponse) => {
                                  const deviceInSlot = singlePcieResponse.data;
                                  row.linkSpeed =
                                    deviceInSlot?.PCIeInterface?.PCIeType;
                                  row.linkWidth =
                                    deviceInSlot?.PCIeInterface?.LanesInUse;

                                  if (
                                    deviceInSlot?.Status?.State === 'Enabled' &&
                                    deviceInSlot?.Status?.Health === 'OK'
                                  ) {
                                    row['linkStatus'] = 'Operational';
                                  } else if (
                                    deviceInSlot?.Status?.State === 'Enabled' &&
                                    deviceInSlot?.Status?.Health !== 'OK'
                                  ) {
                                    row['linkStatus'] = 'Degraded';
                                  } else if (
                                    deviceInSlot?.Status?.State === 'Absent'
                                  ) {
                                    row['linkStatus'] = 'Open';
                                  } else if (
                                    deviceInSlot?.Status?.State ===
                                    'UnavailableOffline'
                                  ) {
                                    row['linkStatus'] = 'Failed';
                                  } else if (
                                    deviceInSlot?.Status?.State ===
                                    'StandbyOffline'
                                  ) {
                                    row['linkStatus'] = 'Inactive';
                                  } else {
                                    row['linkStatus'] = 'Unknown';
                                  }

                                  // Fabric adapters collection
                                  await api
                                    .get(
                                      'redfish/v1/Systems/system/FabricAdapters'
                                    )
                                    .then(
                                      async ({ data: { Members = [] } }) => {
                                        return await api.all(
                                          Members.map(async (member) => {
                                            await api
                                              .get(member['@odata.id'])
                                              .then(async (adapter) => {
                                                if (
                                                  adapter.data.Links
                                                    ?.PCIeDevices[0][
                                                    '@odata.id'
                                                  ] === deviceInSlotLink
                                                ) {
                                                  if (adapter.data?.Ports) {
                                                    await api
                                                      .get(
                                                        adapter.data?.Ports[
                                                          '@odata.id'
                                                        ]
                                                      )
                                                      .then(
                                                        async ({ data }) => {
                                                          return await api.all(
                                                            data.Members.map(
                                                              async (
                                                                member
                                                              ) => {
                                                                await api
                                                                  .get(
                                                                    member[
                                                                      '@odata.id'
                                                                    ]
                                                                  )
                                                                  .then(
                                                                    (
                                                                      memberRes
                                                                    ) => {
                                                                      if (
                                                                        memberRes
                                                                          .data
                                                                          ?.Location
                                                                          ?.PartLocation
                                                                          ?.ServiceLabel
                                                                      ) {
                                                                        row.localPortLocation.push(
                                                                          {
                                                                            locationIndicatorActive:
                                                                              memberRes
                                                                                .data
                                                                                ?.LocationIndicatorActive,
                                                                            locationNumber:
                                                                              memberRes
                                                                                .data
                                                                                ?.Location
                                                                                ?.PartLocation
                                                                                ?.ServiceLabel,
                                                                            uri:
                                                                              memberRes
                                                                                .data[
                                                                                '@odata.id'
                                                                              ],
                                                                          }
                                                                        );
                                                                      }
                                                                    }
                                                                  );
                                                              }
                                                            )
                                                          );
                                                        }
                                                      );
                                                  }
                                                }
                                              });
                                          })
                                        );
                                      }
                                    );
                                });
                            }
                          })
                        );
                        // Cables
                        await api
                          .get('redfish/v1/Cables')
                          .then(async ({ data: { Members = [] } }) => {
                            await api.all(
                              Members.map(async (member) => {
                                await api
                                  .get(member['@odata.id'])
                                  .then(async (scresponse) => {
                                    if (
                                      scresponse.data?.Links
                                        ?.DownstreamResources
                                    ) {
                                      await api
                                        .get(
                                          scresponse.data?.Links
                                            ?.DownstreamResources[0][
                                            '@odata.id'
                                          ]
                                        )
                                        .then(async (res) => {
                                          if (
                                            res.data['@odata.type'].endsWith(
                                              'Assembly'
                                            )
                                          ) {
                                            // williwakas (01)
                                            if (
                                              slot?.Links?.Oem?.IBM
                                                ?.AssociatedAssembly
                                            ) {
                                              if (
                                                scresponse.data?.Links
                                                  ?.DownstreamResources[0][
                                                  '@odata.id'
                                                ] ===
                                                slot?.Links?.Oem?.IBM
                                                  ?.AssociatedAssembly[0][
                                                  '@odata.id'
                                                ]
                                              ) {
                                                if (
                                                  scresponse.data?.Links
                                                    ?.UpstreamPorts
                                                ) {
                                                  await api
                                                    .get(
                                                      scresponse.data?.Links
                                                        ?.UpstreamPorts[0][
                                                        '@odata.id'
                                                      ]
                                                    )
                                                    .then(
                                                      async (upstreamPort) => {
                                                        const string =
                                                          upstreamPort.data[
                                                            '@odata.id'
                                                          ];
                                                        const splitString = string
                                                          .split('/Ports')
                                                          .shift();
                                                        const expander_device_link = splitString;
                                                        await api
                                                          .get(
                                                            expander_device_link
                                                          )
                                                          .then(
                                                            async (
                                                              expanderDeviceResponse
                                                            ) => {
                                                              await api
                                                                .get(
                                                                  expanderDeviceResponse
                                                                    .data.Links
                                                                    .PCIeDevices[0][
                                                                    '@odata.id'
                                                                  ]
                                                                )
                                                                .then(
                                                                  async (
                                                                    pcieDeviceResponse
                                                                  ) => {
                                                                    const pcie_device =
                                                                      pcieDeviceResponse.data;
                                                                    if (
                                                                      pcie_device
                                                                        ?.Links
                                                                        ?.Oem
                                                                        ?.IBM
                                                                        ?.PCIeSlot
                                                                    ) {
                                                                      await api
                                                                        .get(
                                                                          pcie_device
                                                                            ?.Links
                                                                            ?.Oem
                                                                            ?.IBM
                                                                            ?.PCIeSlot[
                                                                            '@odata.id'
                                                                          ]
                                                                        )
                                                                        .then(
                                                                          async (
                                                                            pcieResponse
                                                                          ) => {
                                                                            const expander_slots =
                                                                              pcieResponse
                                                                                .data
                                                                                .Slots;
                                                                            for (const singleSlotValue in expander_slots) {
                                                                              if (
                                                                                expander_slots[
                                                                                  singleSlotValue
                                                                                ]
                                                                                  .Links
                                                                                  ?.PCIeDevice[
                                                                                  '@odata.id'
                                                                                ] ===
                                                                                expanderDeviceResponse
                                                                                  .data
                                                                                  .Links
                                                                                  ?.PCIeDevices[0][
                                                                                  '@odata.id'
                                                                                ]
                                                                              ) {
                                                                                row[
                                                                                  'linkType'
                                                                                ] =
                                                                                  'Secondary';
                                                                                row[
                                                                                  'parentLinkId'
                                                                                ] =
                                                                                  expander_slots[
                                                                                    singleSlotValue
                                                                                  ].Oem?.IBM?.LinkId;
                                                                                break;
                                                                              }
                                                                            }
                                                                          }
                                                                        );
                                                                    }
                                                                  }
                                                                );
                                                            }
                                                          );
                                                      }
                                                    );
                                                }
                                              }
                                            }
                                          }
                                        });
                                    }
                                    if (
                                      scresponse.data?.Links?.DownstreamChassis
                                    ) {
                                      // MEX (02)
                                      await api
                                        .get(
                                          scresponse.data?.Links
                                            ?.DownstreamChassis[0]['@odata.id']
                                        )
                                        .then(async (downChassisResponse) => {
                                          await api
                                            .get(
                                              downChassisResponse.data
                                                .PCIeSlots['@odata.id']
                                            )
                                            .then(async (pcieSlotsResponse) => {
                                              await api.all(
                                                pcieSlotsResponse.data.Slots.map(
                                                  async (singleSlot) => {
                                                    if (
                                                      slot?.Links
                                                        ?.PCIeDevice[0][
                                                        '@odata.id'
                                                      ] ===
                                                      singleSlot?.Links
                                                        ?.PCIeDevice[0][
                                                        '@odata.id'
                                                      ]
                                                    ) {
                                                      if (
                                                        scresponse.data?.Links
                                                          ?.UpstreamPorts
                                                      ) {
                                                        await api
                                                          .get(
                                                            scresponse.data
                                                              ?.Links
                                                              ?.UpstreamPorts[0][
                                                              '@odata.id'
                                                            ]
                                                          )
                                                          .then(
                                                            async (
                                                              upstreamPort
                                                            ) => {
                                                              const string =
                                                                upstreamPort
                                                                  .data[
                                                                  '@odata.id'
                                                                ];
                                                              const splitString = string
                                                                .split('/Ports')
                                                                .shift();
                                                              const expander_device_link = splitString;
                                                              await api
                                                                .get(
                                                                  expander_device_link
                                                                )
                                                                .then(
                                                                  async (
                                                                    expanderDeviceResponse
                                                                  ) => {
                                                                    await api
                                                                      .get(
                                                                        expanderDeviceResponse
                                                                          .data
                                                                          .Links
                                                                          .PCIeDevices[0][
                                                                          '@odata.id'
                                                                        ]
                                                                      )
                                                                      .then(
                                                                        async (
                                                                          pcieDeviceResponse
                                                                        ) => {
                                                                          const pcie_device =
                                                                            pcieDeviceResponse.data;
                                                                          if (
                                                                            pcie_device
                                                                              ?.Links
                                                                              ?.Oem
                                                                              ?.IBM
                                                                              ?.PCIeSlot
                                                                          ) {
                                                                            await api
                                                                              .get(
                                                                                pcie_device
                                                                                  ?.Links
                                                                                  ?.Oem
                                                                                  ?.IBM
                                                                                  ?.PCIeSlot[
                                                                                  '@odata.id'
                                                                                ]
                                                                              )
                                                                              .then(
                                                                                async (
                                                                                  pcieResponse
                                                                                ) => {
                                                                                  const expander_slots =
                                                                                    pcieResponse
                                                                                      .data
                                                                                      .Slots;
                                                                                  for (const singleSlotValue in expander_slots) {
                                                                                    if (
                                                                                      expander_slots[
                                                                                        singleSlotValue
                                                                                      ]
                                                                                        .Links
                                                                                        ?.PCIeDevice[
                                                                                        '@odata.id'
                                                                                      ] ===
                                                                                      expanderDeviceResponse
                                                                                        .data
                                                                                        .Links
                                                                                        ?.PCIeDevices[0][
                                                                                        '@odata.id'
                                                                                      ]
                                                                                    ) {
                                                                                      row[
                                                                                        'linkType'
                                                                                      ] =
                                                                                        'Secondary';
                                                                                      row[
                                                                                        'parentLinkId'
                                                                                      ] =
                                                                                        expander_slots[
                                                                                          singleSlotValue
                                                                                        ].Oem?.IBM?.LinkId;
                                                                                      break;
                                                                                    }
                                                                                  }
                                                                                }
                                                                              );
                                                                          }
                                                                        }
                                                                      );
                                                                  }
                                                                );
                                                            }
                                                          );
                                                      }
                                                    }
                                                  }
                                                )
                                              );
                                            });
                                        });
                                    }
                                    if (
                                      scresponse.data?.Links?.UpstreamPorts
                                        .length > 0
                                    ) {
                                      // Fabric adapters collection
                                      await api
                                        .get(
                                          'redfish/v1/Systems/system/FabricAdapters'
                                        )
                                        .then(
                                          async ({
                                            data: { Members = [] },
                                          }) => {
                                            await api.all(
                                              Members.map(async (member) => {
                                                await api
                                                  .get(member['@odata.id'])
                                                  .then(async ({ data }) => {
                                                    if (
                                                      pcieDevicesCollection.length >
                                                      0
                                                    ) {
                                                      const deviceInSlotLink =
                                                        pcieDevicesCollection[0][
                                                          '@odata.id'
                                                        ];
                                                      if (
                                                        data.Links
                                                          ?.PCIeDevices[0][
                                                          '@odata.id'
                                                        ] === deviceInSlotLink
                                                      ) {
                                                        if (
                                                          scresponse.data?.Links?.UpstreamPorts[0][
                                                            '@odata.id'
                                                          ].startsWith(
                                                            member['@odata.id']
                                                          )
                                                        ) {
                                                          if (
                                                            scresponse.data
                                                              ?.Links
                                                              ?.DownstreamResources
                                                          ) {
                                                            await api
                                                              .get(
                                                                scresponse.data
                                                                  ?.Links
                                                                  ?.DownstreamResources[0][
                                                                  '@odata.id'
                                                                ]
                                                              )
                                                              .then(
                                                                async (res) => {
                                                                  if (
                                                                    res.data[
                                                                      '@odata.type'
                                                                    ].endsWith(
                                                                      'Assembly'
                                                                    )
                                                                  ) {
                                                                    // williwakas 02
                                                                    const string =
                                                                      res.data[
                                                                        '@odata.id'
                                                                      ];
                                                                    const splitString = string
                                                                      .split(
                                                                        '/Assembly'
                                                                      )
                                                                      .shift();
                                                                    await api
                                                                      .get(
                                                                        splitString
                                                                      )
                                                                      .then(
                                                                        async (
                                                                          williwakasSecondResponse
                                                                        ) => {
                                                                          await api
                                                                            .get(
                                                                              williwakasSecondResponse
                                                                                .data
                                                                                .PCIeSlots[
                                                                                '@odata.id'
                                                                              ]
                                                                            )
                                                                            .then(
                                                                              async (
                                                                                williwakasSecondPcieResponse
                                                                              ) => {
                                                                                return await api.all(
                                                                                  williwakasSecondPcieResponse.data.Slots.map(
                                                                                    async (
                                                                                      slot2
                                                                                    ) => {
                                                                                      if (
                                                                                        slot2
                                                                                          .Oem
                                                                                          ?.IBM
                                                                                          ?.AssociatedAssembly ===
                                                                                        scresponse
                                                                                          .data
                                                                                          ?.Links
                                                                                          ?.DownstreamResources[0][
                                                                                          '@odata.id'
                                                                                        ]
                                                                                      ) {
                                                                                        if (
                                                                                          slot2
                                                                                            ?.Location
                                                                                            ?.PartLocation
                                                                                            ?.ServiceLabel
                                                                                        ) {
                                                                                          const duplicate = row.ioSlotLocation.find(
                                                                                            (
                                                                                              obj
                                                                                            ) => {
                                                                                              if (
                                                                                                obj.locationNumber ===
                                                                                                slot2
                                                                                                  ?.Location
                                                                                                  ?.PartLocation
                                                                                                  ?.ServiceLabel
                                                                                              ) {
                                                                                                return true;
                                                                                              }
                                                                                            }
                                                                                          );
                                                                                          if (
                                                                                            duplicate ===
                                                                                            undefined
                                                                                          ) {
                                                                                            row[
                                                                                              'ioSlotLocation'
                                                                                            ].push(
                                                                                              {
                                                                                                locationIndicatorActive:
                                                                                                  slot2?.LocationIndicatorActive,
                                                                                                locationNumber:
                                                                                                  slot2
                                                                                                    ?.Location
                                                                                                    ?.PartLocation
                                                                                                    ?.ServiceLabel,
                                                                                                uri:
                                                                                                  williwakasSecondResponse
                                                                                                    .data
                                                                                                    .PCIeSlots[
                                                                                                    '@odata.id'
                                                                                                  ],
                                                                                              }
                                                                                            );
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  )
                                                                                );
                                                                              }
                                                                            );
                                                                        }
                                                                      );
                                                                  }
                                                                }
                                                              );
                                                          } else if (
                                                            scresponse.data
                                                              ?.Links
                                                              ?.DownstreamChassis
                                                          ) {
                                                            const downstreamChassis =
                                                              scresponse.data
                                                                ?.Links
                                                                ?.DownstreamChassis[0];

                                                            await api
                                                              .get(
                                                                downstreamChassis[
                                                                  '@odata.id'
                                                                ]
                                                              )
                                                              .then(
                                                                async (res) => {
                                                                  await api
                                                                    .get(
                                                                      res.data
                                                                        .PCIeSlots[
                                                                        '@odata.id'
                                                                      ]
                                                                    )
                                                                    .then(
                                                                      async (
                                                                        res1
                                                                      ) => {
                                                                        return await api.all(
                                                                          res1.data.Slots.map(
                                                                            async (
                                                                              slot1
                                                                            ) => {
                                                                              return await api.all(
                                                                                [
                                                                                  '',
                                                                                ].map(
                                                                                  async () => {
                                                                                    if (
                                                                                      slot1
                                                                                        ?.Location
                                                                                        ?.PartLocation
                                                                                        ?.ServiceLabel
                                                                                    ) {
                                                                                      const duplicate = row.ioSlotLocation.find(
                                                                                        (
                                                                                          obj
                                                                                        ) => {
                                                                                          if (
                                                                                            obj.locationNumber ===
                                                                                            slot1
                                                                                              ?.Location
                                                                                              ?.PartLocation
                                                                                              ?.ServiceLabel
                                                                                          ) {
                                                                                            return true;
                                                                                          }
                                                                                        }
                                                                                      );
                                                                                      if (
                                                                                        duplicate ===
                                                                                        undefined
                                                                                      ) {
                                                                                        row[
                                                                                          'ioSlotLocation'
                                                                                        ].push(
                                                                                          {
                                                                                            locationIndicatorActive:
                                                                                              slot1?.LocationIndicatorActive,
                                                                                            locationNumber:
                                                                                              slot1
                                                                                                ?.Location
                                                                                                ?.PartLocation
                                                                                                ?.ServiceLabel,
                                                                                            uri:
                                                                                              res
                                                                                                .data
                                                                                                .PCIeSlots[
                                                                                                '@odata.id'
                                                                                              ],
                                                                                          }
                                                                                        );
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                )
                                                                              );
                                                                            }
                                                                          )
                                                                        );
                                                                      }
                                                                    );
                                                                }
                                                              );
                                                            if (
                                                              scresponse.data
                                                                .Links
                                                                ?.DownstreamPorts
                                                            ) {
                                                              await api
                                                                .get(
                                                                  scresponse
                                                                    .data.Links
                                                                    ?.DownstreamPorts[0][
                                                                    '@odata.id'
                                                                  ]
                                                                )
                                                                .then(
                                                                  async (
                                                                    dpResponse
                                                                  ) => {
                                                                    if (
                                                                      dpResponse
                                                                        .data
                                                                        ?.Location
                                                                        ?.PartLocation
                                                                        ?.ServiceLabel
                                                                    ) {
                                                                      row[
                                                                        'remotePortLocation'
                                                                      ].push({
                                                                        locationIndicatorActive:
                                                                          dpResponse
                                                                            .data
                                                                            ?.LocationIndicatorActive,
                                                                        locationNumber:
                                                                          dpResponse
                                                                            .data
                                                                            ?.Location
                                                                            ?.PartLocation
                                                                            ?.ServiceLabel,
                                                                        uri:
                                                                          dpResponse
                                                                            .data[
                                                                            '@odata.id'
                                                                          ],
                                                                      });
                                                                    }
                                                                  }
                                                                );
                                                            }
                                                            if (
                                                              scresponse.data
                                                                .PartNumber
                                                            ) {
                                                              row[
                                                                'cablePartNumber'
                                                              ].push(
                                                                scresponse.data
                                                                  .PartNumber
                                                              );
                                                            }
                                                            if (
                                                              scresponse.data
                                                                .CableLength
                                                            ) {
                                                              row[
                                                                'cableLength'
                                                              ].push(
                                                                scresponse.data
                                                                  .LengthMeters
                                                              );
                                                            }
                                                            if (
                                                              scresponse.data
                                                                .CableType
                                                            ) {
                                                              row[
                                                                'cableType'
                                                              ].push(
                                                                scresponse.data
                                                                  .CableType
                                                              );
                                                            }
                                                            if (
                                                              scresponse.data
                                                                .Status
                                                                ?.State ===
                                                                'StandbyOffline' &&
                                                              scresponse.data
                                                                .CableStatus !==
                                                                'Disabled'
                                                            ) {
                                                              row[
                                                                'cableStatus'
                                                              ].push(
                                                                'PoweredOff'
                                                              );
                                                            } else if (
                                                              scresponse.data
                                                                .Status
                                                                ?.State ===
                                                                'StandbyOffline' &&
                                                              scresponse.data
                                                                .CableStatus !==
                                                                'Normal'
                                                            ) {
                                                              row[
                                                                'cableStatus'
                                                              ].push(
                                                                'Inactive'
                                                              );
                                                            } else if (
                                                              scresponse.data
                                                                .Status
                                                                ?.State ===
                                                              'Enabled'
                                                            ) {
                                                              row[
                                                                'cableStatus'
                                                              ].push('Running');
                                                            } else {
                                                              row[
                                                                'cableStatus'
                                                              ].push('unknown');
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  });
                                              })
                                            );
                                          }
                                        );
                                    }
                                  });
                              })
                            );
                          });
                        rows.push(row);
                        commit('setEntries', rows);
                        if (i < a) {
                          i++;
                        }
                      })
                    );
                  }
                });
            })
          );
        });
      return rows;
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
