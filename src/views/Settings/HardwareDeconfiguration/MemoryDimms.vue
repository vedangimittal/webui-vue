<template>
  <b-container fluid="xl">
    <b-row class="align-items-end">
      <b-col sm="12" class="text-right">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <b-table
          ref="table"
          responsive="md"
          no-select-on-click
          sort-icon-left
          hover
          no-sort-reset
          sort-by="status"
          show-empty
          :no-border-collapse="true"
          :items="filteredDimms"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          :busy="isBusy"
          @filtered="onFiltered"
        >
          <template #cell(functionalState)="{ value }">
            <div v-if="value == 'OK'">
              {{ $t('pageDeconfigurationHardware.configured') }}
            </div>
            <div v-else>
              {{ $t('pageDeconfigurationHardware.deconfigured') }}
            </div>
          </template>
          <template #cell(settings)="row">
            <b-form-checkbox
              v-model="row.item.settings"
              name="switch"
              switch
              @change="toggleSettingsSwitch(row)"
            >
              <span v-if="row.item.settings">
                {{ $t('pageDeconfigurationHardware.configured') }}
              </span>
              <span v-else>{{
                $t('pageDeconfigurationHardware.deconfigured')
              }}</span>
            </b-form-checkbox>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <!-- Table pagination -->
    <b-row>
      <b-col sm="6">
        <b-form-group
          class="table-pagination-select"
          :label="$t('global.table.itemsPerPage')"
          label-for="pagination-items-per-page"
        >
          <b-form-select
            id="pagination-items-per-page"
            v-model="perPage"
            :options="itemsPerPageOptions"
          />
        </b-form-group>
      </b-col>
      <b-col sm="6">
        <b-pagination
          v-model="currentPage"
          first-number
          last-number
          :per-page="perPage"
          :total-rows="getTotalRowCount(filteredRows)"
          aria-controls="hardware-deconfiguration"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import TableFilter from '@/components/Global/TableFilter';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import TableFilterMixin from '@/components/Mixins/TableFilterMixin';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';
import TableSortMixin from '@/components/Mixins/TableSortMixin';
import SearchFilterMixin, {
  searchFilter,
} from '@/components/Mixins/SearchFilterMixin';
export default {
  name: 'MemoryDimms',
  components: {
    TableFilter,
  },
  mixins: [
    BVPaginationMixin,
    TableFilterMixin,
    BVTableSelectableMixin,
    LoadingBarMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
    BVToastMixin,
  ],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      isBusy: true,
      allData: [],
      fields: [
        {
          key: 'id',
          sortable: true,
          label: this.$t('pageDeconfigurationHardware.table.id'),
        },
        {
          key: 'size',
          sortable: true,
          formatter: this.dataFormatter,
          label: this.$t('pageDeconfigurationHardware.table.size'),
        },
        {
          key: 'locationCode',
          sortable: true,
          formatter: this.dataFormatter,
          label: this.$t('pageDeconfigurationHardware.table.locationCode'),
        },
        {
          key: 'functionalState',
          sortable: true,
          label: this.$t('pageDeconfigurationHardware.table.functionalState'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'deconfigurationType',
          sortable: true,
          formatter: this.dataFormatter,
          label: this.$t(
            'pageDeconfigurationHardware.table.deconfigurationType'
          ),
        },
        {
          key: 'settings',
          sortable: true,
          formatter: this.dataFormatter,
          label: this.$t('pageDeconfigurationHardware.table.settings'),
        },
      ],
      tableFilters: [
        {
          key: 'deconfigurationType',
          label: this.$t(
            'pageDeconfigurationHardware.table.deconfigurationType'
          ),
          values: [
            'By Association',
            'Error',
            'Fatal',
            'FCO-Deconfigured',
            'Invalid',
            'Manual',
            'Predictive',
            'Recovered',
            'Unknown',
          ],
        },
      ],
      activeFilters: [],
      currentPage: currentPage,
      itemsPerPageOptions: itemsPerPageOptions,
      perPage: perPage,
      searchFilter: searchFilter,
      searchTotalFilteredRows: 0,
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
    };
  },
  computed: {
    allDimms() {
      return this.$store.getters['hardwareDeconfiguration/dimms'];
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredDimms.length;
    },
    filteredDimms() {
      return this.getFilteredTableData(this.allDimms, this.activeFilters);
    },
  },
  created() {
    this.startLoader();
    this.$store.dispatch('hardwareDeconfiguration/getDimms').finally(() => {
      this.endLoader();
      this.isBusy = false;
    });
  },
  methods: {
    onFilterChange({ activeFilters }) {
      this.activeFilters = activeFilters;
    },
    onFiltered(filteredItems) {
      this.searchTotalFilteredRows = filteredItems.length;
    },
    toggleSettingsSwitch(row) {
      this.$store
        .dispatch('hardwareDeconfiguration/updateSettingsState', {
          uri: row.item.uri,
          settings: row.item.settings,
        })
        .catch(({ message }) => this.errorToast(message));
    },
  },
};
</script>
