import {post} from './ajax'

/**
 * Market brute forcer (proof of concept)
 * @author David Valin <hola@davidvalin.com>
 */
 export class MarketBacktestBruteforcer {
   /**
    * Initializes the market brute forcer
    */
   constructor() {
     this.config = {
       paramsConfig: [],
       bruteforceParamsPermutations: []
     };
   }

   /**
    * Prepares the parameter value ranges to test from a strategy
    * @param params : the params used to prepare the ranges to test
    * @return paramsConfig : the configuration of params to brute force
    */
   prepareRangesFromParams(params) {
    //  console.log('Preparing the value ranges from those params: ', params);
     const paramNames = Object.keys(params); // TODO: consider nested params, only first level params are considered
     let paramsConfig = [];

     for (var i = 0; i < paramNames.length; i++) {
       if (typeof(params[paramNames[i]]) != 'object') {
         paramsConfig.push({
           name:  paramNames[i],
           from:  params[paramNames[i]],          // TODO: this has to be dynamic and valid
           to:    (params[paramNames[i]] + 100),  // TODO: this has to be dynamic and valid
           step:  1                               // TODO: this has to be dynamic and valid
         });
       }
     }
     debugger
     return paramsConfig;
   }

   /**
    * Configures the market bruteforcer
    * @param strategyParams : The strategy default parameters to use to configure the brute forcer
    */
   configure(strategyParams) {
     // Configure the param value ranges
     this.config.paramsConfig = this.prepareRangesFromParams(strategyParams);
     this.config.bruteforceParamsPermutations = [];

     // Permute the parameters
     const permuteParams = this.permuteParams();
     // For each parameter combination
     for (let i = 0; i < permuteParams.length; i++) {
       // Push test combinations
       this.config.bruteforceParamsPermutations.push({
        //  currency:  this.config.pairList[i].slice(0,3),
        //  asset:     this.config.pairList[i].slice(3,6),
         params:    permuteParams[i]
       });
     }
   }

   /**
    * Retrieves the params names
    */
   getParamsName() {
     return this.paramsConfig.map(function(paramsSet) {
       return paramsSet['name'];
     });
   }

   /**
    * Prepares the parameters values from a configuration of parameters
    */
   prepareParamsValues(paramsConfig) {
     let paramsValues = {};

     for (let i = 0; i < paramsConfig.length; i++) {
       const pmConf = paramsConfig[i];
       paramsValues[pmConf['name']] = [];
       // Prepare "from" -- "to" combinations
       if (typeof(pmConf['from']) != 'undefined' && typeof(pmConf['to']) != 'undefined') {
          for (let i2 = pmConf['from']; i2 <= pmConf['to']; i2=i2+pmConf['step']) {
            paramsValues[pmConf['name']].push(i2);
          }
       // Prepare "values" combinations
       } else if (pmConf['values']) {
          for (let i2 = 0; i2 < pmConf['values'].length; i2++) {
            paramsValues[pmConf['name']].push(pmConf['values'][i2]);
          }
       }
     }
     return paramsValues;
   }

   /**
    * Using the bruteforce params configuration, permutes the params
    */
   permuteParams(paramCombinationNames, inputParamsValues, paramsCombinations, permuted) {
     const self = this;
     // Grab the paramsConfig first
     if (!inputParamsValues) {
       inputParamsValues = this.prepareParamsValues(this.config.paramsConfig);
     }
     // Store the original list of parameter names to permute
     if (!paramCombinationNames) {
       paramCombinationNames = Object.keys(inputParamsValues);
     }
     if (!paramsCombinations) {
       paramsCombinations = {};
     }

     // Initialize an empty set of permutations
     if (!permuted) {
       console.log(' + Permuting params values from input params values: ', inputParamsValues);
       permuted = [];
     }
     const inputParamNames = Object.keys(inputParamsValues);

     for (let i = 0; i < inputParamNames.length; i++) {
       if (typeof(paramsCombinations[inputParamNames[i]]) == 'undefined') {
         const inputParamValues = inputParamsValues[inputParamNames[i]];
         let valuesToConsider;
         for (var i2 = 0; i2 < inputParamValues.length; i2++) {
           (function(paramCombinationNames, inputParamsValues, paramsCombinations, permuted, valuesToConsider) {
             let combinationMade = false;
             // Only store a permutation when we are considering values for all inputs
             valuesToConsider = inputParamsValues[inputParamNames[i]].slice(i2+1, inputParamsValues[inputParamNames[i]].length);
             inputParamsValues[inputParamNames[i]] = valuesToConsider;
             // Prepare a new set of parameter combinations
             let newParamsCombinations = Object.assign({}, paramsCombinations);
             newParamsCombinations[inputParamNames[i]] = inputParamValues[i2];
             // Is the parameter combinations complete? Then push it to the permuted list
             if (Object.keys(newParamsCombinations).length == paramCombinationNames.length) {
               combinationMade = true;
             }
             if (combinationMade) {
               permuted.push(newParamsCombinations);
               newParamsCombinations = {};
             }
             let newInputParamsValues = Object.assign({}, inputParamsValues);
             // Did we finish all possible values for a parameter?
             if (newInputParamsValues[inputParamNames[i]].length == 0) {
               // Now we remove the parameter considered from the recursive combinations
               delete newInputParamsValues[inputParamNames[i]];
             }
            // Do we have any param value to consider in this iteration?
            if (!combinationMade && Object.keys(newInputParamsValues).length > 0) {
              self.permuteParams(paramCombinationNames, newInputParamsValues, newParamsCombinations, permuted);
            }
          })(paramCombinationNames, inputParamsValues, paramsCombinations, permuted, valuesToConsider);
         }
       }
     }
     return permuted;
   }

   /**
    * Checks wether the brute forcer is configured or not
    */
   isConfigured() {
    return (this.config && this.config.bruteforceParamsPermutations && this.config.bruteforceParamsPermutations.length > 0 ? true : false);
   }
 }
