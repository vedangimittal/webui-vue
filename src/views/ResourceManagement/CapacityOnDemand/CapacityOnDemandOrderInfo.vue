<template>
  <b-row>
    <b-col xl="10">
      <page-section :section-title="$t('pageCapacityOnDemand.orderInfo.title')">
        <p>
          {{ $t('pageCapacityOnDemand.orderInfo.description.message') }}
          <b-link to="/logs/dumps">
            {{ $t('pageCapacityOnDemand.orderInfo.description.link') }}
          </b-link>
        </p>
        <b-card bg-variant="light" border-variant="light" class="mb-4">
          <!-- System information -->
          <div class="mb-5">
            <h3 class="h4 mb-3">
              {{ $t('pageCapacityOnDemand.orderInfo.systemInfo') }}
            </h3>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.systemType') }}
              <span class="font-weight-bold">
                {{ systemInfo.model || '--' }}
              </span>
            </p>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.systemSerialNumber') }}
              <span class="font-weight-bold">
                {{ systemInfo.serialNumber || '--' }}
              </span>
            </p>
          </div>

          <!-- Processor information -->
          <div class="mb-5">
            <h3 class="h4 mb-3">
              {{ $t('pageCapacityOnDemand.orderInfo.processorInfo') }}
            </h3>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.processorsLicensed') }}
              <span class="font-weight-bold">
                {{ processorInfo.licensed }}
              </span>
            </p>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.processorResourceId') }}
              <span class="font-weight-bold">
                {{ processorInfo.resourceId }}
              </span>
            </p>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.processorSequenceNumber') }}

              <span class="font-weight-bold">
                {{ processorInfo.sequenceNumber }}
              </span>
            </p>
          </div>

          <!-- Memory information -->
          <div class="mb-5">
            <h3 class="h4 mb-3">
              {{ $t('pageCapacityOnDemand.orderInfo.memoryInfo') }}
            </h3>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.memoryLicensed') }}
              <span class="font-weight-bold">
                {{ memoryInfo.licensed }}
              </span>
            </p>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.memoryResourceId') }}
              <span class="font-weight-bold">
                {{ memoryInfo.resourceId }}
              </span>
            </p>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.memorySequenceNumber') }}

              <span class="font-weight-bold">
                {{ memoryInfo.sequenceNumber }}
              </span>
            </p>
          </div>

          <div>
            <h3 class="h4 mb-3">
              {{ $t('pageCapacityOnDemand.orderInfo.accessKeyInfo') }}
            </h3>
            <p>
              {{
                $t('pageCapacityOnDemand.orderInfo.firmwareAccessKeyExpiration')
              }}
              <span v-if="hasLicenses" class="font-weight-bold">--</span>
              <span v-else class="font-weight-bold">
                {{
                  dataFormatter(firmwareAccessKeyInfo.expirationDate)
                    | formatDate
                }}
              </span>
            </p>
            <p>
              {{ $t('pageCapacityOnDemand.orderInfo.aixAccessKeyExpiration') }}
              <span v-if="hasLicenses" class="font-weight-bold">--</span>
              <span v-else class="font-weight-bold">
                {{
                  dataFormatter(aixAccessKeyInfo.expirationDate) | formatDate
                }}
              </span>
            </p>
          </div>
        </b-card>
      </page-section>
    </b-col>
  </b-row>
</template>

<script>
import { mapGetters } from 'vuex';
import PageSection from '@/components/Global/PageSection';
import DataFormatterMixin from '@/components/Mixins/DataFormatterMixin';

export default {
  name: 'CapacityOnDemandOrderInfo',
  components: { PageSection },
  mixins: [DataFormatterMixin],
  computed: {
    ...mapGetters('licenses', [
      'processorInfo',
      'memoryInfo',
      'firmwareAccessKeyInfo',
      'aixAccessKeyInfo',
    ]),
    hasLicenses() {
      // This logic checks to see if there are any licences in the store.
      // If there are none, the result is true, otherwise false.
      return !Object.keys(this.$store.getters['licenses/licenses']).length;
    },
    systemInfo() {
      return this.$store.getters['system/systems']?.[0] || {};
    },
  },
};
</script>
