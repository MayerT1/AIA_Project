//////////////////////////////////////////////////////////
//
// NASS crop project sample Generation  and RF Classification
// Author T. Mayer 10/13/24; NASA SERVIR, Univeristy of Alabama in Huntsville, and University of Twente ITC
//
//////////////////////////////////////////////////////////

// Construct a polygon from a list of GeoJSON 'Polygon' formatted coordinates.
var geometry2 = ee.Geometry.Polygon(
  [
    [ // exterior ring
    [-103.28140570322613,41.04865218168774],
    [-102.72110296885113,41.04865218168774],
    [-102.72110296885113,41.40807785446098],
    [-103.28140570322613,41.40807785446098],
    [-103.28140570322613,41.04865218168774],
    ]
  ]
);
// Map.addLayer(geometry2, {}, 'geometry2');

var ROI = geometry2

// var ROI = ee.Geometry.Rectangle([72.68095513823965,34.282270256791925, 72.83888360503653,34.406429412779026]) 
Map.addLayer(ROI, {}, "ROI",false)

var exportPath = 'projects/servir-sco-assets/AIA_Project';

var importPath = 'projects/servir-sco-assets/assets/AIA_Project/'

//////////////////////////////////////////////////////////

// Construct the path to the exported images
// var s2Composite = ee.Image(importPath + 'S2Composite_2022');
var demBands = ee.Image(importPath + 'DEMindices_2022');
var S2indices = ee.Image(importPath + 'S2Indices_2022');
var HLS = ee.Image(importPath + 'HLS_2022').select(['NDWI', 'MNDWI', 'SAVI', 'NDMI', 'NDBI']).rename(['NDWI_HLS', 'MNDWI_HLS', 'SAVI_HLS', 'NDMI_HLS', 'NDBI_HLS']);
var LS = ee.Image(importPath + 'LandsatCompositeIndices_2022').select(['NDWI', 'MNDWI', 'SAVI', 'NDMI', 'NDBI']).rename(['NDWI_LS', 'MNDWI_LS', 'SAVI_LS', 'NDMI_LS', 'NDBI_LS']);
var LS_Tcap = ee.Image(importPath + 'landsatTasseledCapIndices_2022');
var S1_A = ee.Image(importPath + 's1AscendingFinal_2022').select(['VV', 'VH', 'ratio', 'ndratio']).rename(['VV_A', 'VH_A', 'ratio_A', 'ndratio_A']);
var S1_D = ee.Image(importPath + 's1DescendingFinal_2022').select(['VV', 'VH', 'ratio', 'ndratio']).rename(['VV_D', 'VH_D', 'ratio_D', 'ndratio_D']);


// Get the image footprint to be used as geometry
var S2indices_Clip = S2indices.clip(ROI);

var viz = {
  min: 0.0, max: 0.3, gamma: 1.2,
  bands: ['S2_NDVI'],
};
Map.addLayer(S2indices_Clip, viz, 'Sentinel-2 NDVI', false);

var stacked = S2indices
  .addBands(demBands)
  .addBands(HLS)
  .addBands(LS)
  .addBands(LS_Tcap)
  .addBands(S1_A)
  .addBands(S1_D).clip(ROI);

Map.addLayer(stacked, {}, 'stacked', false);

///////////////////////////////////////////////////////////////////////////////
// Resample to a Grid
// ****************************************************


var utils = require("users/tjm0042/AIA_Repo:utils.js");

var gridScale = 10

var regrid_out = utils.regrid(gridScale, stacked, 'bilinear') 

Map.addLayer(regrid_out, {}, 'regrid_out', false);
// As larger GEDI pixels contain masked original
// pixels, it has a transparency mask.
// We update the mask to remove the transparency
var stackedResampled = regrid_out.updateMask(regrid_out.mask().gt(0));

// Visualize the resampled layers
Map.addLayer(stackedResampled, {}, 'stackedResampled_Regrid_Func', false);


///////////////////////////////////////////////////////////////////////////////


// Extract Training Features
// ****************************************************

var predictors = S2indices.bandNames().cat(demBands.bandNames()).cat(HLS.bandNames()).cat(LS.bandNames()).cat(LS_Tcap.bandNames()).cat(S1_A.bandNames()).cat(S1_D.bandNames());
print('predictors', predictors);



var nass = ee.ImageCollection('USDA/NASS/CDL')
                  .filter(ee.Filter.date('2022-01-01', '2022-12-31'))
                  .median().clip(ROI)
                  
                  
print("nass", nass)

var criteria = nass.select('cropland').eq(24).and(nass.select('confidence').gte(75))
// print("criteria_class", criteria_class);
var criteria_only = nass.updateMask(criteria);
// Map.addLayer(criteria_only,{}, 'criteria_only')
Map.addLayer(criteria, {}, 'criteria', false);
// print("criteria_only", criteria_only)


// var criteria_class = criteria_only.select('cropland').rename(['class']).toInt()
// print("criteria_class", criteria_class)
// Map.addLayer(criteria_class, {}, 'criteria_class');


//////////////////////////////////////////////////////////////////////////////////

var proj = S2indices_Clip.projection()
var grid = ROI.coveringGrid(proj, 1000)
grid = ee.FeatureCollection(grid).randomColumn("random", 42);
print("spatial_partition number of boxes in the grid", grid.size())
var val_samp = grid.filter('random <= 0.1').set("samp_type","val_samp");
var test_samp = grid.filter('random <= 0.3 and random >= 0.1').set("samp_type","test_samp");
var train_samp = grid.filter('random >= 0.3').set("samp_type","train_samp");

print('val_samp 10%', val_samp.size());
Map.addLayer(val_samp, {color: "blue"}, "val_samp 10%", false)

print('test_samp 20%', test_samp.size());
Map.addLayer(test_samp, {color: "red"}, "test_samp 20%", false)

print('train_samp 70%', train_samp.size());
Map.addLayer(train_samp, {color: "green"}, "train_samp 70%", false)


function sample_partition(Image, Labeled_Image, total_samples, region, gridScale, numnonSamples, numSamples) {
    var sample_partition_out = Image.addBands(Labeled_Image)
    .stratifiedSample({
      numPoints: total_samples,
      classBand: 'cropland',
      region: region, 
      scale: gridScale,
      seed: 42,
      classValues: [0, 1],
      classPoints: [numnonSamples, numSamples],  
      dropNulls: true,
      tileScale: 16,
      geometries:true
  }).randomColumn();
return ee.FeatureCollection(sample_partition_out)
}

var numSamples = 1500;
var numnonSamples = 1500;
var total_samples = numSamples + numnonSamples
print("total_samples", total_samples)
/////

var training = sample_partition(stackedResampled, criteria, total_samples, train_samp, gridScale, numSamples, numnonSamples)
Map.addLayer(training, {color: "green"}, "training")
Export.table.toDrive(training, "training", "sample_partition")
var testing = sample_partition(stackedResampled, criteria, total_samples, test_samp, gridScale, numSamples, numnonSamples)
Map.addLayer(testing, {color: "red"}, "testing")
Export.table.toDrive(testing, "testing", "sample_partition")
var validation = sample_partition(stackedResampled, criteria, total_samples, val_samp, gridScale, numSamples, numnonSamples)
Map.addLayer(validation, {color: "blue"}, "validation")
Export.table.toDrive(validation, "validation", "sample_partition")


//////////////////////////////////////////////////////////////////
/////
/////Model Tuning: Run many RF models and export as csv 
/////
//////////////////////////////////////////////////////////////////
/////Global variables (likely to change with the timeselect function added)
var baseModule = require("users/tjm0042/AIA_Repo:model.js");

var year = 2022
var bands = predictors
var label = 'cropland'

////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////
///
///Run Classification RF
///
// ////////////////////////////////////////////////////////////////

var parameter_post_tune = ee.Dictionary({
  numberOfTrees: 100,
  variablesPerSplit: 6,
  minLeafPopulation: 5,
  bagFraction: 0.3,
  maxNodes: 8,
}); //defaulted to "CLASSIFICATION" mode use other function for regression

var rf_model =  baseModule.randomForest_classification_model(training, testing, bands, stackedResampled, label, parameter_post_tune)//FeatureCollection, bandList, image, label, parameters)
print(rf_model, {}, "rf_model")

////////////////////////////////////////////////////////////////
///
///Run Regression RF
///
////////////////////////////////////////////////////////////////

// var string = 'class'
// /////
// var parameter_post_tune_reg = ee.Dictionary({
//   numberOfTrees: 1000,
//   variablesPerSplit: 6,
//   minLeafPopulation: 5,
//   bagFraction: 0.3,
//   maxNodes: 8,
//   model_mode: "CLASSIFICATION"
// }); 
// /////randomForest_regression_model(FeatureCollection_train, FeatureCollection_test, bandList, image, label, string, parameters) {
  
// var rf_model_classifiction =  baseModule.randomForest_regression_model(training, testing, bands, stackedResampled, label, string, parameter_post_tune_reg)// training//FeatureCollection, bandList, image, label, parameters)
// //print(rf_model_reg, {}, "rf_model_reg")

//////////////////////////////////////////////////////////////////////
//
// Appy the example classification  spatially
//
//////////////////////////////////////////////////////////////////////
var Classifiction_Predicted_Image = stackedResampled.classify(rf_model);


Map.addLayer(Classifiction_Predicted_Image, {}, "Classifiction_Predicted_Image", false)


var wheat_only = Classifiction_Predicted_Image.select('classification').eq(1)
var wheat_only_final = Classifiction_Predicted_Image.updateMask(wheat_only);
Map.addLayer(wheat_only_final, {}, 'wheat_only_final');



Export.image.toAsset({
  image: Classifiction_Predicted_Image.clip(ROI),
  description: 'Classifiction_Predicted_Image',
  assetId: exportPath + 'XXXXXXXX',
  region: ROI,
  scale: gridScale,
  maxPixels: 1e13
});



