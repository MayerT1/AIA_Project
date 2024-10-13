////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// function randomForestParameterSpace(FeatureCollection, bandList, image, parameterSpace) {
    
//   var split = 0.75;
//   var training = FeatureCollection.filter(ee.Filter.lt('random', split));
//   var testing = FeatureCollection.filter(ee.Filter.gte('random', split));
  
//   // print('Total training samples', training.size());
  
//   // print('Training Samples size', training.filter(ee.Filter.eq(label, 1)).size());
//   // print('Training non foci samples size', training.filter(ee.Filter.eq(label, 0)).size());
//   // print('Training: non foci ratio', training.filter(ee.Filter.eq(label, 1)).size().divide(training.filter(ee.Filter.eq(label, 0)).size()));


//   // // Generate the histogram data.
//   // var trainingHistogram = ui.Chart.feature.histogram({
//   //   features: training,
//   //   property: label,
//   //   maxBuckets: 2,
//   // });
//   // trainingHistogram.setOptions({
//   //   title: 'Histogram of Training Points'
//   // });
  
//   // print(trainingHistogram);

  
//   // print();
//   // print('Total testing samples', testing.size());

//   // print('Testing Samples saize', testing.filter(ee.Filter.eq(label, 1)).size());
//   // print('Testing non foci samples', testing.filter(ee.Filter.eq(label, 0)).size());
//   // print('Testing: non foci ratio', testing.filter(ee.Filter.eq(label, 1)).size().divide(testing.filter(ee.Filter.eq(label, 0)).size()));

  
//   parameterSpace = ee.Dictionary(parameterSpace);
//   var numberOfTrees = ee.List(parameterSpace.get('numberOfTrees'));
//   var variablesPerSplit = ee.List(parameterSpace.get('variablesPerSplit'));
//   var minLeafPopulation = ee.List(parameterSpace.get('minLeafPopulation'));
//   var bagFraction = ee.List(parameterSpace.get('bagFraction'));
//   var maxNodes = ee.List(parameterSpace.get('maxNodes'));
//   var model_mode = ee.String(parameterSpace.get('model_mode'));
//   var predict_label = ee.List(parameterSpace.get('predict_label'));

//   var randomForests = numberOfTrees.map(function (_numberOfTrees) {
    
//     return variablesPerSplit.map(function (_variablesPerSplit) {
      
//       return minLeafPopulation.map(function (_minLeafPopulation) {
        
//         return bagFraction.map(function (_bagFraction) {
          
//           return maxNodes.map(function (_maxNodes) {
            
//             return predict_label.map(function (_predict_label) { 
              
              
  
//               // print('Training Samples size', training.filter(ee.Filter.eq(_predict_label, 1)).size());
//               // print('Training non foci samples size', training.filter(ee.Filter.eq(_predict_label, 0)).size());
//               // print('Training: non foci ratio', training.filter(ee.Filter.eq(_predict_label, 1)).size().divide(training.filter(ee.Filter.eq(_predict_label, 0)).size()));
            
            
//               // // Generate the histogram data.
//               // var trainingHistogram = ui.Chart.feature.histogram({
//               //   features: training,
//               //   property: _predict_label,
//               //   maxBuckets: 2,
//               // });
//               // trainingHistogram.setOptions({
//               //   title: 'Histogram of Training Points'
//               // });
              
//               // print(trainingHistogram);
            
              
//               // print();
//               // print('Total testing samples', testing.size());
            
//               // print('Testing Samples saize', testing.filter(ee.Filter.eq(_predict_label, 1)).size());
//               // print('Testing non foci samples', testing.filter(ee.Filter.eq(_predict_label, 0)).size());
//               // print('Testing: non foci ratio', testing.filter(ee.Filter.eq(_predict_label, 1)).size().divide(testing.filter(ee.Filter.eq(_predict_label, 0)).size()));

              
//               var rfModel = ee.Classifier.smileRandomForest({
//                 numberOfTrees: _numberOfTrees,
//                 variablesPerSplit: _variablesPerSplit,
//                 minLeafPopulation: _minLeafPopulation,
//                 bagFraction: _bagFraction,
//                 maxNodes: _maxNodes,
//                 seed: 7,
//               }).setOutputMode(model_mode)
//               .train({
//                 features: training,
//                 classProperty: _predict_label,
//                 inputProperties: bandList,
//                 subsamplingSeed: 7,
//                 });
                
//                 var explainRF = rfModel.explain();
//                 var importanceRF = ee.Dictionary(explainRF).get('importance');
      
//                 // Classify the test FeatureCollection.
//                 var testingClassified = testing.classify(rfModel);
              
//                 // Confusion matrix.
//                 var errorMatrix = testingClassified.errorMatrix(_predict_label, 'classification');
//                 var testAcc = errorMatrix.accuracy();
//                 var testKappa = errorMatrix.kappa();
//                 var testRecallProducerAccuracy = errorMatrix.producersAccuracy().get([1, 0]);
//                 var testPrecisionConsumerAccuracy = errorMatrix.consumersAccuracy().get([0, 1]);
//                 var f1 = errorMatrix.fscore().get([1]);
    
//                 // Calculate RMSE
//                 var calculateRmse = function(input) {
//                     var observed = ee.Array(
//                       input.aggregate_array(_predict_label));
//                     var predicted = ee.Array(
//                       input.aggregate_array('classification'));
//                     var rmse = observed.subtract(predicted).pow(2)
//                       .reduce('mean', [0]).sqrt().get([0]);
//                     return rmse;
//                 };
//                 var rmse = calculateRmse(testingClassified);
    
//                 return ee.Feature(null, {
//                   'model': 'RandomForest',
//                   'predict_label': _predict_label,
//                   'numberOfTrees': _numberOfTrees,
//                   'variablesPerSplit': _variablesPerSplit,
//                   'minLeafPopulation': _minLeafPopulation,
//                   'bagFraction': _bagFraction,
//                   'maxNodes': _maxNodes,
//                   'importance': importanceRF,
//                   'testAccuracy': testAcc,
//                   'testKappa': testKappa,
//                   'precision': testPrecisionConsumerAccuracy,
//                   'recall': testRecallProducerAccuracy,
//                   'f1_score': f1,
//                   'RMSE': rmse
//                 });
                
//             });
          
//           });
          
//         });
        
//       });
      
//     });
    
//   });
//   print("finished randomForestParameterSpace")
//   return randomForests;

// }

//////////////////////////////////////////////////////////////////////////////////////////



function randomForest_regression_modelParameterSpace(FeatureCollection_train, FeatureCollection_test, bandList, image, label, string, parameterSpace) {

    
  // var split = 0.75;
  var training = FeatureCollection_train// FeatureCollection.filter(ee.Filter.lt('random', split));
  var testing = FeatureCollection_test// FeatureCollection.filter(ee.Filter.gte('random', split));
  
  print('Total training samples', training.size());
  
  print('Training Samples size', training.filter(ee.Filter.eq(label, 1)).size());
  print('Training non foci samples size', training.filter(ee.Filter.eq(label, 0)).size());
  print('Training: non foci ratio', training.filter(ee.Filter.eq(label, 1)).size().divide(training.filter(ee.Filter.eq(label, 0)).size()));


  // Generate the histogram data.
  var trainingHistogram = ui.Chart.feature.histogram({
    features: training,
    property: label,
    maxBuckets: 2,
  });
  trainingHistogram.setOptions({
    title: 'Histogram of Training Points'
  });
  
  print(trainingHistogram);

  
  print();
  print('Total testing samples', testing.size());

  print('Testing Samples saize', testing.filter(ee.Filter.eq(label, 1)).size());
  print('Testing non foci samples', testing.filter(ee.Filter.eq(label, 0)).size());
  print('Testing: non foci ratio', testing.filter(ee.Filter.eq(label, 1)).size().divide(testing.filter(ee.Filter.eq(label, 0)).size()));

  
  parameterSpace = ee.Dictionary(parameterSpace);
  var numberOfTrees = ee.List(parameterSpace.get('numberOfTrees'));
  var variablesPerSplit = ee.List(parameterSpace.get('variablesPerSplit'));
  var minLeafPopulation = ee.List(parameterSpace.get('minLeafPopulation'));
  var bagFraction = ee.List(parameterSpace.get('bagFraction'));
  var maxNodes = ee.List(parameterSpace.get('maxNodes'));
  var model_mode = ee.String(parameterSpace.get('model_mode'));
  // var predict_label = ee.List(parameterSpace.get('predict_label'))
  
  
  var randomForests = numberOfTrees.map(function (_numberOfTrees) {
    
    return variablesPerSplit.map(function (_variablesPerSplit) {
      
      return minLeafPopulation.map(function (_minLeafPopulation) {
        
        return bagFraction.map(function (_bagFraction) {
          
          return maxNodes.map(function (_maxNodes) {
            
            // return predict_label.map(function (_predict_label) { 
            
              var rfModel = ee.Classifier.smileRandomForest({
                numberOfTrees: _numberOfTrees,
                variablesPerSplit: _variablesPerSplit,
                minLeafPopulation: _minLeafPopulation,
                bagFraction: _bagFraction,
                maxNodes: _maxNodes,
                seed: 7,
              }).setOutputMode(model_mode)
              .train({
                features: training,
                classProperty: string,
                inputProperties: bandList,
                subsamplingSeed: 7,
              });

              var explainRF = rfModel.explain();
              var importanceRF = ee.Dictionary(explainRF).get('importance');
              
              // Classify the train FeatureCollection.
              var trainingClassified = training.classify({classifier: rfModel,
                  outputName: 'classification'})
                  
              // Classify the test FeatureCollection.
              var testingClassified = testing.classify({classifier: rfModel,
                  outputName: 'classification'})
            
              // Confusion matrix.
              // var errorMatrix = testingClassified.errorMatrix(label, 'classification');
              // var testAcc = errorMatrix.accuracy();
              // var testKappa = errorMatrix.kappa();
              // var testRecallProducerAccuracy = errorMatrix.producersAccuracy().get([1, 0]);
              // var testPrecisionConsumerAccuracy = errorMatrix.consumersAccuracy().get([0, 1]);
              // var f1 = errorMatrix.fscore().get([1]);
  
              // Calculate RMSE
              var calculateRmse = function(input) {
                  var observed = ee.Array(
                    input.aggregate_array(string));//label
                  var predicted = ee.Array(
                    input.aggregate_array('classification'));
                  var rmse = observed.subtract(predicted).pow(2)
                    .reduce('mean', [0]).sqrt().get([0]);
                  return rmse;
              };
              var rmse_train = calculateRmse(trainingClassified);
              var rmse_test = calculateRmse(testingClassified);
              
              
             // Calculate MSE
              var calculateMse = function(input) {
                  var observed = ee.Array(
                    input.aggregate_array(string));//label
                  var predicted = ee.Array(
                    input.aggregate_array('classification'));
                  var rmse = observed.subtract(predicted).pow(2)
                    .reduce('mean', [0]).get([0]);
                  return rmse;
              };
              var Mse_train = calculateMse(trainingClassified);
              var Mse_test = calculateMse(testingClassified);
              
              
              
              // Calculate Mean Absolute Error (MAE)
              var calculateMAE = function(input) {
                  var observed = ee.Array(
                    input.aggregate_array(string));//label
                  var predicted = ee.Array(
                    input.aggregate_array('classification'));
                  
                  var MAE = observed.subtract(predicted).abs().reduce(ee.Reducer.mean(), [0]).get([0]);
                  return MAE;
              };
              var mae_train = calculateMAE(trainingClassified);
              var mae_test = calculateMAE(testingClassified);
              
              
             // Calculate Mean Absolute Percentage Error (MAE)
              var calculateMAPE = function(input) {
                  var observed = ee.Array(
                    input.aggregate_array(string));//label
                  var predicted = ee.Array(
                    input.aggregate_array('classification'));
                  
                  var MAPE = observed.subtract(predicted).divide(observed).abs().reduce(ee.Reducer.mean(), [0]).get([0]);
                  return MAPE;
              };
              var mape_train = calculateMAPE(trainingClassified);
              var mape_test = calculateMAPE(testingClassified);


  
              return ee.Feature(null, {
                'model': 'RandomForest',
                // 'predict_label': _predict_label,
                'numberOfTrees': _numberOfTrees,
                'variablesPerSplit': _variablesPerSplit,
                'minLeafPopulation': _minLeafPopulation,
                'bagFraction': _bagFraction,
                'maxNodes': _maxNodes,
                'importance': importanceRF,
                // 'testAccuracy': testAcc,
                // 'testKappa': testKappa,
                // 'precision': testPrecisionConsumerAccuracy,
                // 'recall': testRecallProducerAccuracy,
                // 'f1_score': f1,
                'RMSE_train': rmse_train,
                'RMSE_test': rmse_test,
                'MAE_train': mae_train,
                'MAE_test': mae_test,
                'MSE_train': Mse_train,
                'MSE_test': Mse_train,
                'MAPE_train': mape_train,
                'MAPE_test': mape_test
              // });
              
            });
          
          });
          
        });
        
      });
      
    });
    
  });
  print("finished regression randomForestParameterSpace")
  return randomForests;

}











////////////////////////////////////////////////////////////////////////////////////////////////////////////



//////////toggle back on as this is the working version Back stopped version (7/26/24)

function randomForest_classification_modelParameterSpace(FeatureCollection, bandList, image, label, parameterSpace) {
    
  var split = 0.75;
  var training = FeatureCollection.filter(ee.Filter.lt('random', split));
  var testing = FeatureCollection.filter(ee.Filter.gte('random', split));
  
  print('Total training samples', training.size());
  
  print('Training Samples size', training.filter(ee.Filter.eq(label, 1)).size());
  print('Training non foci samples size', training.filter(ee.Filter.eq(label, 0)).size());
  print('Training: non foci ratio', training.filter(ee.Filter.eq(label, 1)).size().divide(training.filter(ee.Filter.eq(label, 0)).size()));


  // Generate the histogram data.
  var trainingHistogram = ui.Chart.feature.histogram({
    features: training,
    property: label,
    maxBuckets: 2,
  });
  trainingHistogram.setOptions({
    title: 'Histogram of Training Points'
  });
  
  print(trainingHistogram);

  
  print();
  print('Total testing samples', testing.size());

  print('Testing Samples saize', testing.filter(ee.Filter.eq(label, 1)).size());
  print('Testing non foci samples', testing.filter(ee.Filter.eq(label, 0)).size());
  print('Testing: non foci ratio', testing.filter(ee.Filter.eq(label, 1)).size().divide(testing.filter(ee.Filter.eq(label, 0)).size()));

  
  parameterSpace = ee.Dictionary(parameterSpace);
  var numberOfTrees = ee.List(parameterSpace.get('numberOfTrees'));
  var variablesPerSplit = ee.List(parameterSpace.get('variablesPerSplit'));
  var minLeafPopulation = ee.List(parameterSpace.get('minLeafPopulation'));
  var bagFraction = ee.List(parameterSpace.get('bagFraction'));
  var maxNodes = ee.List(parameterSpace.get('maxNodes'));
  var model_mode = ee.String(parameterSpace.get('model_mode'));
  
  var randomForests = numberOfTrees.map(function (_numberOfTrees) {
    
    return variablesPerSplit.map(function (_variablesPerSplit) {
      
      return minLeafPopulation.map(function (_minLeafPopulation) {
        
        return bagFraction.map(function (_bagFraction) {
          
          return maxNodes.map(function (_maxNodes) {
            
            var rfModel = ee.Classifier.smileRandomForest({
              numberOfTrees: _numberOfTrees,
              variablesPerSplit: _variablesPerSplit,
              minLeafPopulation: _minLeafPopulation,
              bagFraction: _bagFraction,
              maxNodes: _maxNodes,
              seed: 7,
            })
            // .setOutputMode(model_mode)
            .train({
              features: training,
              classProperty: label,
              inputProperties: bandList,
              subsamplingSeed: 7,
            });
            
            var explainRF = rfModel.explain();
            var importanceRF = ee.Dictionary(explainRF).get('importance');
  
            // Classify the test FeatureCollection.
            var testingClassified = testing.classify(rfModel);
          
            // Confusion matrix.
            var errorMatrix = testingClassified.errorMatrix(label, 'classification');
            var testAcc = errorMatrix.accuracy();
            var testKappa = errorMatrix.kappa();
            var testRecallProducerAccuracy = errorMatrix.producersAccuracy().get([1, 0]);
            var testPrecisionConsumerAccuracy = errorMatrix.consumersAccuracy().get([0, 1]);
            var f1 = errorMatrix.fscore().get([1]);

            // Calculate RMSE
            var calculateRmse = function(input) {
                var observed = ee.Array(
                  input.aggregate_array(label));
                var predicted = ee.Array(
                  input.aggregate_array('classification'));
                var rmse = observed.subtract(predicted).pow(2)
                  .reduce('mean', [0]).sqrt().get([0]);
                return rmse;
            };
            var rmse = calculateRmse(testingClassified);

            return ee.Feature(null, {
              'model': 'RandomForest',
              'numberOfTrees': _numberOfTrees,
              'variablesPerSplit': _variablesPerSplit,
              'minLeafPopulation': _minLeafPopulation,
              'bagFraction': _bagFraction,
              'maxNodes': _maxNodes,
              'importance': importanceRF,
              'testAccuracy': testAcc,
              'testKappa': testKappa,
              'precision': testPrecisionConsumerAccuracy,
              'recall': testRecallProducerAccuracy,
              'f1_score': f1,
              'RMSE': rmse
            });
          
          });
          
        });
        
      });
      
    });
    
  });
  print("finished classification randomForestParameterSpace")
  return randomForests;

}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function randomForest_classification_model(FeatureCollection_train, FeatureCollection_test, bandList, image, label, parameters) {
  
  parameters = ee.Dictionary(parameters);
  print('parameters', parameters);
  
  // var split = 0.75;
  var training = FeatureCollection_train//.filter(ee.Filter.lt('random', split));
  var testing = FeatureCollection_test//.filter(ee.Filter.gte('random', split));
  
  print('Total training samples', training.size());
  
  print('Training Samples size', training.filter(ee.Filter.eq(label, 1)).size());
  print('Training non foci samples size', training.filter(ee.Filter.eq(label, 0)).size());
  print('Training: non foci ratio', training.filter(ee.Filter.eq(label, 1)).size().divide(training.filter(ee.Filter.eq(label, 0)).size()));


  // Generate the histogram data.
  var trainingHistogram = ui.Chart.feature.histogram({
    features: training,
    property: label,
    maxBuckets: 2,
  });
  trainingHistogram.setOptions({
    title: 'Histogram of Training Points'
  });
  
  print(trainingHistogram);
  ////
  print();
  print('Total testing samples', testing.size());

  print('Testing Samples size', testing.filter(ee.Filter.eq(label, 1)).size());
  print('Testing non foci samples', testing.filter(ee.Filter.eq(label, 0)).size());
  print('Testing: non foci ratio', testing.filter(ee.Filter.eq(label, 1)).size().divide(testing.filter(ee.Filter.eq(label, 0)).size()));
  
  // Make a Random Forest classifier and train it.
  var trainedClassifier = ee.Classifier.smileRandomForest({
    numberOfTrees: parameters.get('numberOfTrees'),
    variablesPerSplit: parameters.get('variablesPerSplit'),
    minLeafPopulation: parameters.get('minLeafPopulation'),
    bagFraction: parameters.get('bagFraction'),
    maxNodes: parameters.get('maxNodes'),
    seed:7
  })
  .train({
    features: training,
    classProperty: label,
    inputProperties: bandList,
    subsamplingSeed: 7,
  });
  
  var dict_RF = trainedClassifier.explain();
  var variable_importance_RF = ee.Feature(null, ee.Dictionary(dict_RF).get('importance'));
  var chart_variable_importance_RF =
    ui.Chart.feature.byProperty(variable_importance_RF)
    .setChartType('ColumnChart')
    .setOptions({
    title: 'Random Forest Variable Importance',
    legend: {position: 'none'},
    hAxis: {title: 'Bands'},
    vAxis: {title: 'Importance'}
    });
  print("chart_variable_importance_RF", chart_variable_importance_RF);   
  
  
  // Classify the test FeatureCollection.
  var testingClassified = testing.classify(trainedClassifier);

  // Print the confusion matrix.
  var errorMatrix = testingClassified.errorMatrix(label, 'classification');
  print('Error Matrix', errorMatrix);
  print('Test accuracy: ', errorMatrix.accuracy());
  print('Test kappa: ', errorMatrix.kappa());
  print('recall', errorMatrix.producersAccuracy().get([1, 0]));
  print('precision', errorMatrix.consumersAccuracy().get([0, 1]));
  print('f1_score', errorMatrix.fscore().get([1]));
 
  print("Finished Classification RF")
  return trainedClassifier;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function randomForest_regression_model(FeatureCollection_train, FeatureCollection_test, bandList, image, label, string, parameters) {
  
  parameters = ee.Dictionary(parameters);
  print('parameters', parameters);
  
  // var split = 0.75;
  var training = FeatureCollection_train//.filter(ee.Filter.lt('random', split));
  var testing = FeatureCollection_test//.filter(ee.Filter.gte('random', split));
  
  print('Total training samples', training.size());
  
  print('Training Samples size', training.filter(ee.Filter.eq(label, 1)).size());
  print('Training non foci samples size', training.filter(ee.Filter.eq(label, 0)).size());
  print('Training: non foci ratio', training.filter(ee.Filter.eq(label, 1)).size().divide(training.filter(ee.Filter.eq(label, 0)).size()));

  print('Total testing samples', testing.size());

  print('Testing Samples size', testing.filter(ee.Filter.eq(label, 1)).size());
  print('Testing non foci samples', testing.filter(ee.Filter.eq(label, 0)).size());
  print('Testing: non foci ratio', testing.filter(ee.Filter.eq(label, 1)).size().divide(testing.filter(ee.Filter.eq(label, 0)).size()));

 ///

  var model_mode = ee.String(parameters.get('model_mode'))
  print("model_mode", model_mode)
  
  // Make a Random Forest classifier and train it.
  var trainedClassifier = ee.Classifier.smileRandomForest({
    numberOfTrees: parameters.get('numberOfTrees'),
    variablesPerSplit: parameters.get('variablesPerSplit'),
    minLeafPopulation: parameters.get('minLeafPopulation'),
    bagFraction: parameters.get('bagFraction'),
    maxNodes: parameters.get('maxNodes'),
    seed:7
  })
  .setOutputMode(model_mode)
  .train({
    features: training,
    classProperty: string,
    inputProperties: bandList,
    subsamplingSeed: 7,
  });
  
  var dict_RF = trainedClassifier.explain();
  var variable_importance_RF = ee.Feature(null, ee.Dictionary(dict_RF).get('importance'));
  var chart_variable_importance_RF =
    ui.Chart.feature.byProperty(variable_importance_RF)
    .setChartType('ColumnChart')
    .setOptions({
    title: 'Random Forest Variable Importance Regression',
    legend: {position: 'none'},
    hAxis: {title: 'Bands'},
    vAxis: {title: 'Importance'}
    });
  print("chart_variable_importance_RF", chart_variable_importance_RF);   
  
  ///
  
  // Get model's predictions for training samples
  var predicted = training.classify({
    classifier: trainedClassifier,
    outputName: 'classification'
  });
  
  // Calculate RMSE
  var calculateRmse = function(input) {
      var observed = ee.Array(
        input.aggregate_array(string));
      var p_class = ee.Array(
        input.aggregate_array('classification'));
      var rmse = observed.subtract(p_class).pow(2)
        .reduce('mean', [0]).sqrt().get([0]);
      return rmse;
  };
  var rmse = calculateRmse(predicted);
  print('RMSE Train', rmse)

  
  // Create a plot of observed vs. predicted values
  var chart = ui.Chart.feature.byFeature({
    features: predicted.select([string, 'classification']),
    xProperty: string,
    yProperties: ['classification'],
  }).setChartType('ScatterChart')
    .setOptions({
      title: 'RMSE Training',
      dataOpacity: 0.8,
      hAxis: {'title': 'Observed'},
      vAxis: {'title': 'Predicted'},
      legend: {position: 'right'},
      series: {
        0: {
          visibleInLegend: false,
          color: '#525252',
          pointSize: 3,
          pointShape: 'triangle',
        },
      },
      trendlines: {
        0: {
          type: 'linear', 
          color: 'black', 
          lineWidth: 1,
          pointSize: 0,
          labelInLegend: 'Linear Fit',
          visibleInLegend: true,
          showR2: true
        }
      },
      chartArea: {left: 100, bottom:50, width:'50%'},
  
  });
  print(chart);
  
  
  
     // Calculate MSE
    var calculateMse = function(input) {
        var observed = ee.Array(
          input.aggregate_array(string));//label
        var p_class = ee.Array(
          input.aggregate_array('classification'));
        var rmse = observed.subtract(p_class).pow(2)
          .reduce('mean', [0]).get([0]);
        return rmse;
    };
    var Mse_train = calculateMse(predicted);
    print('MSE', Mse_train)


    // Calculate Mean Absolute Error (MAE)
    var calculateMAE = function(input) {
        var observed = ee.Array(
          input.aggregate_array(string));//label
        var p_class = ee.Array(
          input.aggregate_array('classification'));
        
        var MAE = observed.subtract(p_class).abs().reduce(ee.Reducer.mean(), [0]).get([0]);
        return MAE;
    };
    var mae_train = calculateMAE(predicted);
    print('MAE', mae_train)

    
   // Calculate Mean Absolute Percentage Error (MAE)
    var calculateMAPE = function(input) {
        var observed = ee.Array(
          input.aggregate_array(string));//label
        var p_class = ee.Array(
          input.aggregate_array('classification'));
        
        var MAPE = observed.subtract(p_class).divide(observed).abs().reduce(ee.Reducer.mean(), [0]).get([0]);
        return MAPE;
    };
    var mape_train = calculateMAPE(predicted);
    print('MAPE', mape_train)
  
  
  
  
  ///////////////////////////////////////////////////
 
  ////////Testing
  
  ///////////////////////////////////////////////////

  
  // Get model's predictions for training samples
  var predicted_testing = testing.classify({
    classifier: trainedClassifier,
    outputName: 'classification'
  });
  
  // Calculate RMSE
  var calculateRmse = function(input) {
      var observed = ee.Array(
        input.aggregate_array(string));
      var test_class = ee.Array(
        input.aggregate_array('classification'));
      var rmse = observed.subtract(test_class).pow(2)
        .reduce('mean', [0]).sqrt().get([0]);
      return rmse;
  };
  var rmse_test = calculateRmse(predicted_testing);
  print('RMSE Test', rmse_test)
  
  // Create a plot of observed vs. predicted values
  var chart_testing = ui.Chart.feature.byFeature({
    features: predicted_testing.select([string, 'classification']),
    xProperty: string,
    yProperties: ['classification'],
  }).setChartType('ScatterChart')
    .setOptions({
      title: 'RMSE Testing',
      dataOpacity: 0.8,
      hAxis: {'title': 'Observed'},
      vAxis: {'title': 'Predicted'},
      legend: {position: 'right'},
      series: {
        0: {
          visibleInLegend: false,
          color: '#525252',
          pointSize: 3,
          pointShape: 'triangle',
        },
      },
      trendlines: {
        0: {
          type: 'linear', 
          color: 'black', 
          lineWidth: 1,
          pointSize: 0,
          labelInLegend: 'Linear Fit',
          visibleInLegend: true,
          showR2: true
        }
      },
      chartArea: {left: 100, bottom:25, width:'50%'},
  
  });
  print(chart_testing);
  
  print("Finished Regression RF")
  

  
       // Calculate MSE
    var calculateMse = function(input) {
        var observed = ee.Array(
          input.aggregate_array(string));//label
        var p_class = ee.Array(
          input.aggregate_array('classification'));
        var rmse = observed.subtract(p_class).pow(2)
          .reduce('mean', [0]).get([0]);
        return rmse;
    };
    var Mse_train = calculateMse(predicted_testing);
    print('MSE Test', Mse_train)


    // Calculate Mean Absolute Error (MAE)
    var calculateMAE = function(input) {
        var observed = ee.Array(
          input.aggregate_array(string));//label
        var p_class = ee.Array(
          input.aggregate_array('classification'));
        
        var MAE = observed.subtract(p_class).abs().reduce(ee.Reducer.mean(), [0]).get([0]);
        return MAE;
    };
    var mae_train = calculateMAE(predicted_testing);
    print('MAETest', mae_train)

    
   // Calculate Mean Absolute Percentage Error (MAE)
    var calculateMAPE = function(input) {
        var observed = ee.Array(
          input.aggregate_array(string));//label
        var p_class = ee.Array(
          input.aggregate_array('classification'));
        
        var MAPE = observed.subtract(p_class).divide(observed).abs().reduce(ee.Reducer.mean(), [0]).get([0]);
        return MAPE;
    };
    var mape_train = calculateMAPE(predicted_testing);
    print('MAPE Test', mape_train)
  
 
  
  
  return trainedClassifier;
}




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.randomForest_regression_modelParameterSpace = randomForest_regression_modelParameterSpace;

exports.randomForest_classification_modelParameterSpace = randomForest_classification_modelParameterSpace;

exports.randomForest_classification_model = randomForest_classification_model;

exports.randomForest_regression_model = randomForest_regression_model;