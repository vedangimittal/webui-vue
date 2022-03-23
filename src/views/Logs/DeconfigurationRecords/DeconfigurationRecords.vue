<template>
  <b-container fluid="xl">
    <page-title
      :description="
        $t('pageDeconfigurationRecords.pageDescription.description')
      "
      :link="$t('pageDeconfigurationRecords.pageDescription.link')"
      to="/settings/hardware-deconfiguration"
    />
    <b-row>
      <b-col class="text-right">
        <b-button
          variant="link"
          :disabled="allEntries.length === 0"
          @click="deleteAllEntries"
        >
          <icon-delete /> {{ $t('global.action.clearAll') }}
        </b-button>
        <b-button
          variant="primary"
          :class="{ disabled: allEntries.length === 0 }"
          :download="exportFileNameByDate()"
          :href="href"
        >
          <icon-export /> {{ $t('global.action.exportAll') }}
        </b-button>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <table-toolbar
          ref="toolbar"
          :selected-items-count="selectedRows.length"
          :actions="batchActions"
          @clear-selected="clearSelectedRows($refs.table)"
          @batch-action="onBatchAction"
        >
          <template #toolbar-buttons>
            <table-toolbar-export
              :data="batchExportData"
              :file-name="exportFileNameByDate()"
            />
          </template>
        </table-toolbar>
        <b-table
          id="table-deconfiguration-records"
          ref="table"
          responsive="md"
          selectable
          no-select-on-click
          sort-icon-left
          hover
          no-sort-reset
          sort-desc
          show-empty
          sort-by="id"
          :fields="fields"
          :items="recordItems"
          :empty-text="$t('global.table.emptyMessage')"
          :current-page="currentPage"
          :per-page="perPage"
          @row-selected="onRowSelected($event, recordItems.length)"
        >
          <!-- Checkbox column -->
          <template #head(checkbox)>
            <b-form-checkbox
              v-model="tableHeaderCheckboxModel"
              :indeterminate="tableHeaderCheckboxIndeterminate"
              @change="onChangeHeaderCheckbox($refs.table)"
            >
              <span class="sr-only">{{ $t('global.table.selectAll') }}</span>
            </b-form-checkbox>
          </template>
          <template #cell(checkbox)="row">
            <b-form-checkbox
              v-model="row.rowSelected"
              @change="toggleSelectRow($refs.table, row.index)"
            >
              <span class="sr-only">{{ $t('global.table.selectItem') }}</span>
            </b-form-checkbox>
          </template>
          <!-- Severity column -->
          <template #cell(severity)="{ value }">
            <!-- <status-icon v-if="value" :status="statusIcon(value)" /> -->
            {{ value }}
          </template>
          <!-- Date column -->
          <template #cell(date)="{ value }">
            <p class="mb-0">{{ value | formatDate }}</p>
            <p class="mb-0">{{ value | formatTime }}</p>
          </template>
          <!-- Status column -->
          <template #cell(status)="row">
            <span v-if="row.item.status">
              {{ $t('pageDeconfigurationRecords.resolved') }}
            </span>
            <span v-else>
              {{ $t('pageDeconfigurationRecords.unresolved') }}
            </span>
          </template>
          <template #cell(filterByStatus)="{ value }">
            {{ value }}
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
          :total-rows="getTotalRowCount(recordItems.length)"
          aria-controls="table-event-logs"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import IconDelete from '@carbon/icons-vue/es/trash-can/20';
import IconExport from '@carbon/icons-vue/es/document--export/20';
import PageTitle from '@/components/Global/PageTitle';
import TableToolbar from '@/components/Global/TableToolbar';
import TableToolbarExport from '@/components/Global/TableToolbarExport';
import BVToastMixin from '@/components/Mixins/BVToastMixin';
import LoadingBarMixin from '@/components/Mixins/LoadingBarMixin';
import { omit } from 'lodash';
import BVTableSelectableMixin, {
  selectedRows,
  tableHeaderCheckboxModel,
  tableHeaderCheckboxIndeterminate,
} from '@/components/Mixins/BVTableSelectableMixin';
import BVPaginationMixin, {
  currentPage,
  perPage,
  itemsPerPageOptions,
} from '@/components/Mixins/BVPaginationMixin';
export default {
  components: {
    IconDelete,
    IconExport,
    PageTitle,
    TableToolbar,
    TableToolbarExport,
  },
  mixins: [
    BVTableSelectableMixin,
    LoadingBarMixin,
    BVPaginationMixin,
    BVToastMixin,
  ],
  beforeRouteLeave(to, from, next) {
    this.hideLoader();
    next();
  },
  data() {
    return {
      fields: [
        {
          key: 'checkbox',
          sortable: false,
        },
        {
          key: 'id',
          label: this.$t('pageDeconfigurationRecords.table.id'),
          sortable: true,
        },
        {
          key: 'date',
          label: this.$t('pageDeconfigurationRecords.table.date'),
          sortable: true,
        },
        {
          key: 'severity',
          label: this.$t('pageDeconfigurationRecords.table.severity'),
          sortable: false,
        },
        {
          key: 'name',
          label: this.$t('pageDeconfigurationRecords.table.name'),
          sortable: false,
        },
        {
          key: 'description',
          label: this.$t('pageDeconfigurationRecords.table.description'),
          sortable: false,
        },
      ],
      batchActions: [
        {
          value: 'delete',
          label: this.$t('global.action.delete'),
        },
      ],
      selectedRows: selectedRows,
      tableHeaderCheckboxModel: tableHeaderCheckboxModel,
      tableHeaderCheckboxIndeterminate: tableHeaderCheckboxIndeterminate,
      currentPage: currentPage,
      perPage: perPage,
      itemsPerPageOptions: itemsPerPageOptions,
    };
  },
  computed: {
    href() {
      return `data:text/json;charset=utf-8,${this.exportAllRecords()}`;
    },
    allEntries() {
      return this.$store.getters['deconfigurationRecords/deconfigRecords'];
    },
    recordItems() {
      return this.$store.getters['deconfigurationRecords/deconfigRecords'];
    },
    batchExportData() {
      return this.selectedRows.map((row) => omit(row, 'actions'));
    },
  },
  created() {
    this.startLoader();
    this.$store
      .dispatch('deconfigurationRecords/getDeconfigurationRecordInfo')
      .finally(() => this.endLoader());
  },
  methods: {
    deleteAllEntries() {
      this.$bvModal
        .msgBoxConfirm(
          this.$t('pageDeconfigurationRecords.modal.deleteAllMessage'),
          {
            title: this.$t('pageDeconfigurationRecords.modal.deleteAllTitle'),
            okTitle: this.$t('global.action.delete'),
            okVariant: 'danger',
            cancelTitle: this.$t('global.action.cancel'),
          }
        )
        .then((deleteConfirmed) => {
          if (deleteConfirmed) {
            this.$store
              .dispatch(
                'deconfigurationRecords/deleteAllEntries',
                this.allEntries
              )
              .then((message) => this.successToast(message))
              .catch(({ message }) => this.errorToast(message));
          }
        });
    },
    deleteRecords(uris) {
      this.$store
        .dispatch('deconfigurationRecords/deleteRecords', uris)
        .then((messages) => {
          messages.forEach(({ type, message }) => {
            if (type === 'success') {
              this.successToast(message);
            } else if (type === 'error') {
              this.errorToast(message);
            }
          });
        });
    },
    // Create export file name based on date
    exportFileNameByDate(value) {
      let date = new Date();
      date =
        date.toISOString().slice(0, 10) +
        '_' +
        date.toString().split(':').join('-').split(' ')[4];
      let fileName;
      if (value === 'export') {
        fileName = 'deconfig_record_';
      } else {
        fileName = 'all_deconfig_records_';
      }
      return fileName + date;
    },
    exportAllRecords() {
      {
        return this.$store.getters[
          'deconfigurationRecords/deconfigRecords'
        ].map((records) => {
          const allDeconfigRecordsString = JSON.stringify(records);
          return allDeconfigRecordsString;
        });
      }
    },
    onTableRowAction(action, { uri }) {
      if (action === 'delete') {
        this.$bvModal
          .msgBoxConfirm(
            this.$tc('pageDeconfigurationRecords.modal.deleteMessage'),
            {
              title: this.$tc('pageDeconfigurationRecords.modal.deleteTitle'),
              okTitle: this.$t('global.action.delete'),
              cancelTitle: this.$t('global.action.cancel'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) this.deleteRecords([uri]);
          });
      }
    },
    onBatchAction(action) {
      if (action === 'delete') {
        const uris = this.selectedRows.map((row) => row.uri);
        this.$bvModal
          .msgBoxConfirm(
            this.$tc(
              'pageDeconfigurationRecords.modal.deleteMessage',
              this.selectedRows.length
            ),
            {
              title: this.$tc(
                'pageDeconfigurationRecords.modal.deleteTitle',
                this.selectedRows.length
              ),
              okTitle: this.$t('global.action.delete'),
              cancelTitle: this.$t('global.action.cancel'),
            }
          )
          .then((deleteConfirmed) => {
            if (deleteConfirmed) {
              if (this.selectedRows.length === this.allEntries.length) {
                this.$store
                  .dispatch(
                    'deconfigurationRecords/deleteAllEntries',
                    this.selectedRows.length
                  )
                  .then((message) => this.successToast(message))
                  .catch(({ message }) => this.errorToast(message));
              } else {
                this.deleteRecords(uris);
              }
            }
          });
      }
    },
  },
};
</script>
