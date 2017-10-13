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
    run: function() {
      debugger
      const self = this;
      // Are we brute forcing the strategy params?
      if (window.bruteForcer && window.bruteForcer.isConfigured()) {
        // window.bruteForceResult = { };
        self.bruteForceResults = [];

        let i = 0;
        function myLoop (i) {
          if (i < window.bruteForcer.config.bruteforceParamsPermutations.length) {
            setTimeout(function () {
              this.backtestState = 'fetching';
              self.bruteForceResultState = 'fetching';
              console.log(' + Testing strategy with params: ', window.bruteForcer.config.bruteforceParamsPermutations[i]['params']);
              // Prepare config using a permuted params combination
              self.config[self.config.tradingAdvisor.method] = window.bruteForcer.config.bruteforceParamsPermutations[i]['params'];
              const req = {
                gekkoConfig: self.config,
                data: {
                  candleProps: ['close', 'start'],
                  indicatorResults: true,
                  report: true,
                  roundtrips: true,
                  trades: true
                }
              }
              post('backtest', req, (error, response) => {
                self.bruteForceResultState = 'newResult';
                this.backtestState = 'fetched';
                // self.backtestResult = response;
                // window.bruteForceResult[response['report']['relativeProfit']] = response;
                self.bruteForceResults.push(response);
              });
              i++;
              myLoop(i);
            }, 5000);
          }
        }
        myLoop(i);
      } else {
      // Are we just testing a single set of params?
        this.backtestState = 'fetching';
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

        post('backtest', req, (error, response) => {
          this.backtestState = 'fetched';
          this.backtestResult = response;
        });
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
