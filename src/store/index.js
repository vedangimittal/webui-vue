//TODO: Work Requird -->
import EventLogStore from './modules/Logs/EventLogStore';
import GlobalStore from './modules/GlobalStore';
import AuthenticationStore from './modules/Authentication/AuthenticationStore';
import FirmwareStore from './modules/Operations/FirmwareStore';
import SystemStore from './modules/HardwareStatus/SystemStore';
import NetworkStore from './modules/Settings/NetworkStore';
import PowerControlStore from './modules/ResourceManagement/PowerControlStore';
import KeyClearStore from './modules/Operations/KeyClearStore';
import ControlStore from './modules/Operations/ControlStore';
import BootSettingsStore from './modules/Operations/BootSettingsStore';
import FactoryResetStore from './modules/Operations/FactoryResetStore';
import ResourceMemoryStore from './modules/ResourceManagement/ResourceMemoryStore';
import PowerPolicyStore from './modules/Settings/PowerPolicyStore';
import ConcurrentMaintenanceStore from './modules/HardwareStatus/ConcurrentMaintenanceStore';
import IBMiServiceFunctionsStore from './modules/Logs/IBMiServiceFunctionsStore';
import AuditLogsStore from './modules/Logs/AuditLogsStore';
import SessionsStore from './modules/SecurityAndAccess/SessionsStore.js';
import LicenseStore from './modules/ResourceManagement/LicenseStore';
import BmcStore from './modules/HardwareStatus/BmcStore';
import ChassisStore from './modules/HardwareStatus/ChassisStore';
import PowerSupplyStore from './modules/HardwareStatus/PowerSupplyStore';
import PcieSlotsStore from './modules/HardwareStatus/PcieSlotsStore';
import FanStore from './modules/HardwareStatus/FanStore';
import MemoryStore from './modules/HardwareStatus/MemoryStore';
import AssemblyStore from './modules/HardwareStatus/AssemblyStore';
import FabricAdaptersStore from './modules/HardwareStatus/FabricAdaptersStore';
import SystemParametersStore from './modules/ResourceManagement/SystemParametersStore';

// ... (export use other stores)
export {
  EventLogStore,
  GlobalStore,
  AuthenticationStore,
  FirmwareStore,
  SystemStore,
  NetworkStore,
  PowerControlStore,
  KeyClearStore,
  ControlStore,
  BootSettingsStore,
  FactoryResetStore,
  ResourceMemoryStore,
  PowerPolicyStore,
  ConcurrentMaintenanceStore,
  IBMiServiceFunctionsStore,
  AuditLogsStore,
  SessionsStore,
  LicenseStore,
  ChassisStore,
  PowerSupplyStore,
  PcieSlotsStore,
  FanStore,
  MemoryStore,
  BmcStore,
  AssemblyStore,
  FabricAdaptersStore,
  SystemParametersStore

};
