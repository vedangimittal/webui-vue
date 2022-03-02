<template>
  <b-container fluid="xl">
    <b-row class="align-items-end">
      <b-col sm="12" class="text-right">
        <table-filter :filters="tableFilters" @filter-change="onFilterChange" />
      </b-col>
    </b-row>
    <b-row>
      <b-col xl="12">
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          @clear-selected="clearSelectedRows($refs.table)"
        >
          <template #toolbar-buttons>
            <table-toolbar-export
              :data="selectedRows"
              :file-name="exportFileNameByDate()"
            />
          </template>
        </table-toolbar>
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
          :items="filteredCores"
          :fields="fields"
          :per-page="perPage"
          :current-page="currentPage"
          :filter="searchFilter"
          :empty-text="$t('global.table.emptyMessage')"
          :empty-filtered-text="$t('global.table.emptySearchMessage')"
          :busy="isBusy"
          @filtered="onFiltered"
          @row-selected="onRowSelected($event, filteredCores.length)"
        >
          <template #cell(functionalState)="{ value }">
            <status-icon :status="statusIcon(value)" /> {{ value }}
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
          aria-controls="table-sensors"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import StatusIcon from '@/components/Global/StatusIcon';
import TableFilter from '@/components/Global/TableFilter';
import TableToolbar from '@/components/Global/TableToolbar';
import TableToolbarExport from '@/components/Global/TableToolbarExport';
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
  name: 'ProcessorCores',
  components: {
    StatusIcon,
    TableFilter,
    TableToolbar,
    TableToolbarExport,
  },
  mixins: [
    BVPaginationMixin,
    TableFilterMixin,
    BVTableSelectableMixin,
    LoadingBarMixin,
    DataFormatterMixin,
    TableSortMixin,
    SearchFilterMixin,
  ],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      isBusy: true,
      fields: [
        {
          key: 'id',
          sortable: true,
          label: this.$t('pageDeconfigurationHardware.table.id'),
        },
        {
          key: 'location',
          formatter: this.dataFormatter,
          label: this.$t('pageDeconfigurationHardware.table.locationCode'),
        },
        {
          key: 'functionalState',
          sortable: false,
          label: this.$t('pageDeconfigurationHardware.table.functionalState'),
          tdClass: 'text-nowrap',
        },
        {
          key: 'deconfigurationType',
          formatter: this.dataFormatter,
          label: this.$t(
            'pageDeconfigurationHardware.table.deconfigurationType'
          ),
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
    allCores() {
      return this.$store.getters['hardwareDeconfiguration/cores'];
    },
    filteredRows() {
      return this.searchFilter
        ? this.searchTotalFilteredRows
        : this.filteredCores.length;
    },
    filteredCores() {
      return this.getFilteredTableData(this.allCores, this.activeFilters);
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('hardwareDeconfiguration/getProcessors')
      .finally(() => {
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
  },
};
</script>
