<template lang='jade'>
  div
    .hr.contain
    div.contain
      h3 Bruteforce result
    div(v-for='result in bruteForceResults')
      result-summary(:report='result.report')
      .hr
      // .hr.contain
      // chart(:data='result', height='500')
      // .hr.contain
      // roundtripTable(:roundtrips='result.roundtrips')
</template>

<script>
import resultSummary from './summary.vue'
import chart from './chartWrapper.vue'
import roundtripTable from './roundtripTable.vue'

export default {
  props: ['bruteForceResults'],
  data: () => {
    return {}
  },
  methods: {},
  components: {
    roundtripTable,
    resultSummary,
    chart
  }
}
</script>

<style>
</style>
