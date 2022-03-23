<template>
  <div :class="isFullWindow ? 'full-window-container' : 'terminal-container'">
    <b-row v-if="!isFullWindow" class="d-flex">
      <b-col
        sm="6"
        lg="5"
        xl="4"
        class="d-flex flex-column justify-content-end"
      >
        <b-form id="form-new-dump">
          <b-form-group
            :label="$t('pageServiceLoginConsoles.selectConsoleType')"
            label-for="selectConsoleType"
          >
            <b-form-select
              id="selectConsoleType"
              v-model="selectConsoleType"
              :options="consoleTypeOptions"
              value-field="value"
              text-field="text"
            >
            </b-form-select>
          </b-form-group>
        </b-form>
      </b-col>

      <b-col
        v-if="!isFullWindow"
        class="d-flex justify-content-end align-items-end"
      >
        <b-button variant="link" type="button" @click="openConsoleWindow()">
          <icon-launch />
          {{ $t('pageHostConsole.openNewTab') }}
        </b-button>
      </b-col>
    </b-row>
    <div id="terminal" ref="panel"></div>
  </div>
</template>

<script>
import { AttachAddon } from 'xterm-addon-attach';
import { FitAddon } from 'xterm-addon-fit';
import { Terminal } from 'xterm';
import { throttle } from 'lodash';
import IconLaunch from '@carbon/icons-vue/es/launch/20';

export default {
  name: 'ServiceLoginConsoles',
  components: {
    IconLaunch,
  },
  props: {
    isFullWindow: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectConsoleType: 'bmc-console',
      consoleTypeOptions: [
        {
          value: 'bmc-console',
          text: this.$t('pageServiceLoginConsoles.bmcConsole'),
        },
        {
          value: 'console1',
          text: this.$t('pageServiceLoginConsoles.hypervisorConsole'),
        },
      ],
      resizeConsoleWindow: null,
    };
  },
  mounted() {
    this.openTerminal();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeConsoleWindow);
  },
  methods: {
    openTerminal() {
      const token = this.$store.getters['authentication/token'];

      const ws = new WebSocket(
        `wss://${window.location.host}/${this.selectConsoleType}`,
        [token]
      );

      // Refer https://github.com/xtermjs/xterm.js/ for xterm implementation and addons.

      const term = new Terminal({
        fontSize: 15,
        fontFamily:
          'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      });

      const attachAddon = new AttachAddon(ws);
      term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      const SOL_THEME = {
        background: '#19273c',
        cursor: 'rgba(83, 146, 255, .5)',
        scrollbar: 'rgba(83, 146, 255, .5)',
      };
      term.setOption('theme', SOL_THEME);

      term.open(this.$refs.panel);
      fitAddon.fit();

      this.resizeConsoleWindow = throttle(() => {
        fitAddon.fit();
      }, 1000);
      window.addEventListener('resize', this.resizeConsoleWindow);

      try {
        ws.onopen = function () {
          console.log(`websocket ${this.selectConsoleType}/ opened`);
        };
        ws.onclose = function (event) {
          console.log(
            `websocket ${this.selectConsoleType}/ closed. code: ' +
              ${event.code} +
              ' reason: ' +
              ${event.reason}`
          );
        };
      } catch (error) {
        console.log(error);
      }
    },
    openConsoleWindow() {
      window.open(
        '#/console/service-login-consoles',
        '_blank',
        'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=yes,width=600,height=550'
      );
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~xterm/css/xterm.css';

#terminal {
  overflow: auto;
}

.full-window-container {
  width: 97%;
  margin: 1.5%;
}
</style>
