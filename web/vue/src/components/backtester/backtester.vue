<template lang='jade'>
  div
    h2.contain Backtest
    .hr.contain
    config-builder(v-on:config='check')
    div(v-if='backtestable')
      .txt--center
        a.w100--s.my1.btn--blue(href='#', v-if='backtestState !== "fetching"', v-on:click.prevent='run') Backtest
        div(v-if='backtestState === "fetching"').scan-btn
          p Running backtest..
          spinner
    result(v-if='backtestResult && backtestState === "fetched"', :result='backtestResult')
    bruteForceResults(v-if='bruteForceResults && bruteForceResultState === "newResult"', :bruteForceResults='bruteForceResults')
</template>

<script>
import configBuilder from './backtestConfigBuilder.vue'
import result from './result/result.vue'
import bruteForceResults from './result/bruteForceResults.vue'
import { post } from '../../tools/ajax'
import spinner from '../global/blockSpinner.vue'

export default {
  data: () => {
    return {
      backtestable: false,
      backtestState: 'idle',
      backtestResult: false,
      bruteForceResults: [],
      config: false,
    }
  },
  methods: {
    check: function(config) {
      this.config = config;

      if(!config.valid)
        return this.backtestable = false;

      this.backtestable = true;
    },
    getReport: function(next, resetFetchingState) {
      const self = this;
      if (!resetFetchingState) { resetFetchingState = true; }
      if (resetFetchingState) {
        this.backtestState = 'fetching';
      }
      const req = {
        gekkoConfig: this.config,
        data: {
          candleProps: ['close', 'start'],
          indicatorResults: true,
          report: true,
          roundtrips: true,
          trades: true
        }
      }
      if (next) {
        return post('backtest', req, (error, response) => {
          self.bruteForceResultState = 'newResult';
          self.backtestState = 'fetched';
          self.backtestResult = response;
          self.bruteForceResults.push(response);
          next(error, response);
        });
      } else {
        return post('backtest', req, (error, response) => {
          self.backtestState = 'fetched';
          self.backtestResult = response;
        });
      }
    },
    getReports: function(bruteforceParamsPermutations, i) {
      const self = this;
      if (!i) { i = 0; }
      while (i < bruteforceParamsPermutations.length) {
        console.log(' + Testing strategy with params: ', bruteforceParamsPermutations[i]['params']);
        // Prepare config using a permuted params combination
        this.config[this.config.tradingAdvisor.method] = bruteforceParamsPermutations[i]['params'];
        return (function(i) {
          i++;
          self.getReport((err, response) => {
            if (!err) {
              self.getReports(bruteforceParamsPermutations, i);
            }
          }, false);
        })(i);
      }
    },
    run: function() {
      // Are we brute forcing the strategy params?
      if (window.bruteForcer && window.bruteForcer.isConfigured()) {
        // window.bruteForceResult = { };
        this.bruteForceResults = [];
        this.getReports(window.bruteForcer.config.bruteforceParamsPermutations);
      } else {
      // Are we just testing a single set of params?
        this.getReport();
      }
    }
  },
  components: {
    configBuilder,
    result,
    bruteForceResults,
    spinner
  }
}
</script>

<style>
.contain {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
</style>
