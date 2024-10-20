/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #98ff00 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[-104.13505104523, 43.014811335569625],
          [-104.08584007338116, 40.98081777267713],
          [-102.11928733900616, 40.964227887422915],
          [-102.09182151869366, 39.99434087009108],
          [-95.2692741401968, 39.970494157390924],
          [-96.37247017440941, 42.51627897870898],
          [-96.90175751393676, 42.857182428574504],
          [-97.88453341300995, 43.018719180975744],
          [-98.5426951359765, 43.02606309108847]]]),
    geometry2 = 
    /* color: #0b4a8b */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-103.28140570322613, 41.40807785446098],
          [-103.28140570322613, 41.04865218168774],
          [-102.72110296885113, 41.04865218168774],
          [-102.72110296885113, 41.40807785446098]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////   Traing sample generaiton using NASS crop layer 
////   Update ROI, Dates of intrest, export path
////   Author T. Mayer 10/12/24; NASA SERVIR, Univeristy of Alabama in Huntsville, and University of Twente ITC
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
Map.addLayer(geometry2, {}, 'geometry2');


var ROI = geometry2

var dataset = ee.ImageCollection('USDA/NASS/CDL')
                  .filter(ee.Filter.date('2022-01-01', '2022-12-31'))
                  .median().clip(ROI)
                  
                  
print("dataset", dataset)

// Per-pixel predicted confidence of the given classification, with 0 being 
// the least confident and 100 the most confident. Available from 2008 to 2017 
// (Note: Confidence for Florida and Washington D.C. is unavailable for 2010).
// var confidence= dataset.select('confidence').gte(75);
// var confidence_only = dataset.updateMask(confidence);
// Map.addLayer(confidence_only,{}, 'confidence_only')
// Map.addLayer(confidence, {}, 'confidence',false); 



// var WinterWheat= dataset.select('cropland').eq(24);
// var WinterWheat_only = dataset.updateMask(WinterWheat);
// Map.addLayer(WinterWheat_only,{}, 'WinterWheat_only')
// Map.addLayer(WinterWheat, {}, 'WinterWheat', false);


var criteria = dataset.select('cropland').eq(24).and(dataset.select('confidence').gte(75));
var criteria_only = dataset.updateMask(criteria);
Map.addLayer(criteria_only,{}, 'criteria_only')
Map.addLayer(criteria, {}, 'criteria', false);
print("criteria_only", criteria_only)


var criteria_class = criteria_only.select('cropland').rename(['class']).toInt()
print("criteria_class", criteria_class)


//////////////////////////////////////////////////////////////////////////
////// Samp gen.
/////////////////////////////////////////////////////////////////////////

//To do swap out the EO as needed

/// use Landsat projection to build the grid
var LS_SR = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                  .filter(ee.Filter.date('2021-01-01', '2021-12-31'))
                  .median().clip(ROI)
Map.addLayer(LS_SR, {}, 'LS_SR', false);

var proj = LS_SR.projection()
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


var gridScale = 30

function sample_partition(Image, Labeled_Image, total_samples, region, gridScale, numnonSamples, numSamples) {
    var sample_partition_out = Image.addBands(Labeled_Image)
    .stratifiedSample({
      numPoints: total_samples,
      classBand: 'class',
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


var numSamples = 100;
var numnonSamples = 100;
var total_samples = numSamples + numnonSamples
print("total_samples", total_samples)
/////

var training = sample_partition(LS_SR, criteria_class, total_samples, train_samp, gridScale, numSamples, numnonSamples)
Map.addLayer(training, {color: "green"}, "training")

var testing = sample_partition(LS_SR, criteria_class, total_samples, test_samp, gridScale, numSamples, numnonSamples)
Map.addLayer(testing, {color: "red"}, "testing")

var validation = sample_partition(LS_SR, criteria_class, total_samples, val_samp, gridScale, numSamples, numnonSamples)
Map.addLayer(validation, {color: "blue"}, "validation")



