////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////   NASS indice generation
////   Update ROI, Dates of intrest, export path
////   Author T. Mayer 10/12/24; NASA SERVIR, Univeristy of Alabama in Huntsville, and University of Twente IT
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var baseModule = require("users/tjm0042/AIA_Repo:main.js");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  ROI
////  Choose the ROI of intrest
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

// var ROI = ee.FeatureCollection("users/tjm0042/PHD/BTAP_P1")
Map.centerObject(ROI);
Map.addLayer(ROI, {}, "ROI")

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Input Imagery
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var LS8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");
var LS7 = ee.ImageCollection("LANDSAT/LE07/C02/T2_L2");
var S2 = ee.ImageCollection('COPERNICUS/S2_SR');
var LS8_TOA = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA'); // we are using TOA for the Tasseled Cap, you can use SR product here but be mindful of the coefficients of the matrix, see indices.js for the information on the coefficients.
var HLS = ee.ImageCollection("NASA/HLS/HLSL30/v002").filter(ee.Filter.lt('CLOUD_COVERAGE', 30));
var DEM = ee.ImageCollection('COPERNICUS/DEM/GLO30');
var GEDI_A = ee.ImageCollection("LARSE/GEDI/GEDI02_A_002_MONTHLY")
var GEDI_B = ee.ImageCollection("LARSE/GEDI/GEDI02_B_002_MONTHLY")

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  INPUT NEEDED BLOCK
////  Update Dates of Intrest
////  Update the export path
////  Update the Step 1 S1 paths for preprocessed S1
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// we used one composite per season so all the months go here.
// if you want to make montly composite; use one month at a time
var monthsList = [1,2,3,4,5, 6, 7, 8, 9, 10,11, 12]; // <--- INPUT NEEDED: MONTHS
// the year list needs one year at a time
var yearsList = [2022]; // <--- INPUT NEEDED: YEAR NUMBER

// export path
// var exportPath = 'users/tjm0042/PHD/KP_Height_Prelim' + yearsList[0];
var exportPath = 'projects/servir-sco-assets/AIA_Project';



// s1 descending export path
// var s1DescendingPath = 'users/tjm0042/PHD/GEDI_Height/Sentinel1Descending_2022_01_12'
var s1DescendingPath = 'projects/servir-sco-assets/assets/AIA_Project/Descending_2022-09-01'


//'projects/servir-sco-assets/assets/Bhutan/Sentinel1Descending';
// s1 ascending export path
//var s1AscendingPath = 'users/tjm0042/PHD/GEDI_Height/Sentinel1Ascending_2022_01_12'
var s1AscendingPath = 'projects/servir-sco-assets/assets/AIA_Project/Ascending_2022-09-01'


//'projects/servir-sco-assets/assets/Bhutan/Sentinel1Ascending';


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Extract Dates
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var listofDates = [];

for (var i = 0; i<monthsList.length; i++) {
  // year is hardcoded for now because we know we will have one year at a time
  var startDate = ee.Date.fromYMD(yearsList[0], monthsList[i], 1);
  var dict = {
    'startDate': startDate,
    'endDate'  : startDate.advance(1, 'month').advance(-1, 'day')
  };
  listofDates.push(dict);
}
listofDates = ee.List(listofDates);
print("listofDates", listofDates)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Landsat 8 Dancing
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var l8FinalCollection =  ee.ImageCollection(
  baseModule.utils.timePeriodSelector(LS8, monthsList, yearsList, ROI)
).sort('system:time_start');

l8FinalCollection = l8FinalCollection.select(['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'QA_PIXEL']);

l8FinalCollection = l8FinalCollection.map(function (img) {
  return img.rename(['blue', 'green', 'red', 'nir', 'swir1', 'QA_PIXEL']);
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Landsat 7 Dancing
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var l7FinalCollection = ee.ImageCollection(
  baseModule.utils.timePeriodSelector(LS7, monthsList, yearsList, ROI)
).sort('system:time_start');

l7FinalCollection = l7FinalCollection.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'QA_PIXEL']);

l7FinalCollection = l7FinalCollection.map(function (img) {
  return img.rename(['blue', 'green', 'red', 'nir', 'swir1', 'QA_PIXEL']);
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Landsat 7 and 8 Merge Dancing
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

print('l7FinalCollection', l7FinalCollection);
print('l8FinalCollection', l8FinalCollection);

var _landsatCollection = baseModule.routine.getL7L8ReducedImage(listofDates, l8FinalCollection, l7FinalCollection);
var landsatCollection = ee.ImageCollection(_landsatCollection);

// doing a median now since the getL7L8ReducedImage has maximum extent via the mosaic method
var landsatImage = landsatCollection.median();
// notice this still has QA_PIXEL; however this can be dropped since we already used the QA_PIXEL per image wise
print('landsatImage', landsatImage);
landsatImage = landsatImage.select(['red', 'green', 'blue', 'nir', 'swir1']).float();
var landsatIndices = baseModule.indices.calculateL7L8Indices(landsatImage).float();
print('landsatIndices', landsatIndices);

Map.addLayer(landsatImage.clip(ROI), {bands:['swir1', 'nir', 'red'], min:0.04, max:0.4}, 'landsatCollectionMedian');
Map.addLayer(landsatIndices.clip(ROI), {min:0.04, max:0.4}, 'landsatIndices');

// parameters to the function call are: image, description, region, scale, assetId
baseModule.utils.exportImageAsset(landsatImage, 'LandsatComposite_' + yearsList[0], ROI, 30, exportPath + '/LandsatComposite_'+ yearsList[0]);
baseModule.utils.exportImageAsset(landsatIndices, 'LandsatCompositeIndices_' + yearsList[0], ROI, 30, exportPath + '/LandsatIndices_' + yearsList[0]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  HLS Image
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var HLSFinalCollection =  ee.ImageCollection(
  baseModule.utils.timePeriodSelector(HLS, monthsList, yearsList, ROI)).sort('system:time_start');

var HLSIndices = baseModule.indices.calculateHLSIndices(HLSFinalCollection).float();
print('HLSIndices', HLSIndices);

Map.addLayer(HLSIndices.clip(ROI), {}, 'HLSIndices');
baseModule.utils.exportImageAsset(HLSIndices, 'HLSFinal_' + yearsList[0], ROI, 10, exportPath + '/HLS_' + yearsList[0]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  DEM
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var DEMCollection =  ee.ImageCollection(DEM)

var DEMindices = baseModule.indices.calculateDEM(DEMCollection).clip(ROI).float();
print('DEMindices', DEMindices);

Map.addLayer(DEMindices.clip(ROI), {}, 'DEMindicesIndices');
baseModule.utils.exportImageAsset(DEMindices, 'DEMindices_' + yearsList[0], ROI, 10, exportPath + '/DEMindices_' + yearsList[0]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  GEDI A
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var GEDICollection_A =  ee.ImageCollection(
  baseModule.utils.timePeriodSelector(GEDI_A, monthsList, yearsList, ROI)).sort('system:time_start');

var GEDIindices_A = baseModule.indices.calculateGEDI_A(GEDICollection_A).float();
print('GEDIindices_A', GEDIindices_A);

Map.addLayer(GEDIindices_A.clip(ROI), {}, 'GEDIindices_A');
baseModule.utils.exportImageAsset(GEDIindices_A, 'GEDIindicesA_' + yearsList[0], ROI, 10, exportPath + '/GEDIindicesA_' + yearsList[0]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  GEDI B
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var GEDICollection_B =  ee.ImageCollection(
  baseModule.utils.timePeriodSelector(GEDI_B, monthsList, yearsList, ROI)).sort('system:time_start');

var GEDIindices_B = baseModule.indices.calculateGEDI_B(GEDICollection_B).float();
print('GEDIindices_B', GEDIindices_B);

Map.addLayer(GEDIindices_B.clip(ROI), {}, 'GEDIindices_B');
baseModule.utils.exportImageAsset(GEDIindices_B, 'GEDIindicesB_' + yearsList[0], ROI, 10, exportPath + '/GEDIindicesB_' + yearsList[0]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Sentinel 2 Dancing
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var s2FinalCollection =  ee.ImageCollection(
  baseModule.utils.timePeriodSelector(S2, monthsList, yearsList, ROI)
).sort('system:time_start');

s2FinalCollection = baseModule.routine.maskS2Collection(s2FinalCollection);
print('s2FinalCollection', s2FinalCollection);

var s2FinalImage = s2FinalCollection.median();
var s2Indices = baseModule.indices.calculateS2Indices(s2FinalImage).float();
s2FinalImage = s2FinalImage.select(['B4', 'B3', 'B2', 'B8', 'B11'], ['red', 'green', 'blue', 'nir', 'swir1']).float();

print('s2FinalImage', s2FinalImage);
print('s2Indices', s2Indices);
Map.addLayer(s2FinalImage.clip(ROI), {bands:['swir1', 'nir', 'red'], min:0.01, max:0.4}, 's2CollectionMedian');
Map.addLayer(s2Indices.clip(ROI), {}, 's2Indices');

baseModule.utils.exportImageAsset(s2FinalImage, 'S2Composite_' + yearsList[0], ROI, 30, exportPath + '/S2Composite_' + yearsList[0]);
baseModule.utils.exportImageAsset(s2Indices, 'S2CompositeIndices_' + yearsList[0], ROI, 30, exportPath + '/S2Indices_' + yearsList[0]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Tasseled Cap Dancing
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var l8ToaFinalCollection =  ee.ImageCollection(
  baseModule.utils.timePeriodSelector(LS8_TOA, monthsList, yearsList, ROI)
).sort('system:time_start');
l8ToaFinalCollection = l8ToaFinalCollection.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'QA_PIXEL']);

l8ToaFinalCollection = l8ToaFinalCollection.map(function (img) {
  return img.rename(['blue', 'green', 'red', 'nir', 'swir1', 'swir2', 'QA_PIXEL']);
});

var l8ToaTcIndices = baseModule.indices.calculateL8ToaTasseledCapIndices(l8ToaFinalCollection).float();

print('l8ToaTcIndices', l8ToaTcIndices);

Map.addLayer(l8ToaTcIndices.clip(ROI), {}, 'l8ToaTcIndices');

baseModule.utils.exportImageAsset(l8ToaTcIndices, 'l8ToaTcIndices_' + yearsList[0], ROI, 30, exportPath + '/landsatTasseledCapIndices_' + yearsList[0]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Sentinel 1 Dancing
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////  Descend Dancing
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var s1DescendingFinal = ee.ImageCollection(s1DescendingPath + yearsList[0]);
// print("s1DescendingFinal", s1DescendingFinal)
// s1DescendingFinal = s1DescendingFinal.filterDate(yearsList[0] + '-' + monthsList[0] + '-01', yearsList[0] + '-' + (monthsList[monthsList.length - 1] + 1) + '-01');
// print("s1DescendingFinal", s1DescendingFinal)

// s1DescendingFinal = baseModule.indices.calculateS1Indices(s1DescendingFinal).float();

// print('s1DescendingFinal', s1DescendingFinal);

// Map.addLayer(s1DescendingFinal.clip(ROI), {}, 's1DescendingFinal');

// baseModule.utils.exportImageAsset(s1DescendingFinal, 's1DescendingFinal_' + yearsList[0], ROI, 30, exportPath + '/s1Descending_'  + yearsList[0]);



var s1DescendingFinal = ee.Image(s1DescendingPath);
print("s1DescendingFinal", s1DescendingFinal)

function calculateS1Indices_image(image) {

  var VV = ee.Image(image).select('VV');
  var VH = ee.Image(image).select('VH');
  var S1_ratio = VV.divide(VH).rename('ratio');
  var S1_ndratio = VV.subtract(VH).divide(VV.add(VH)).rename('ndratio');

  return VV.addBands([VH, S1_ratio, S1_ndratio]);
}
var s1DescendingFinal_ratio = calculateS1Indices_image(s1DescendingPath);
print("s1DescendingFinal_ratio", s1DescendingFinal_ratio)

baseModule.utils.exportImageAsset(s1DescendingFinal_ratio, 's1DescendingFinal_' + yearsList[0], ROI, 10, exportPath + '/s1Descending_'  + yearsList[0]);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////  Ascend Dancing
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var s1AscendingFinal = ee.ImageCollection(s1AscendingPath + yearsList[0]);
// s1AscendingFinal = s1AscendingFinal.filterDate(yearsList[0] + '-' + monthsList[0] + '-01', yearsList[0] + '-' + (monthsList[monthsList.length - 1] + 1) + '-01');

// s1AscendingFinal = baseModule.indices.calculateS1Indices(s1AscendingFinal).float();

// print('s1AscendingFinal', s1AscendingFinal);

// Map.addLayer(s1AscendingFinal.clip(ROI), {}, 's1AscendingFinal');

// baseModule.utils.exportImageAsset(s1AscendingFinal, 's1AscendingFinal_' + yearsList[0], ROI, 30, exportPath + '/s1Ascending_' + yearsList[0]);



var s1AscendingPathFinal = ee.Image(s1AscendingPath);
print("s1AscendingPathFinal", s1AscendingPathFinal)

function calculateS1Indices_image(image) {

  var VV = ee.Image(image).select('VV');
  var VH = ee.Image(image).select('VH')
  var S1_ratio = VV.divide(VH).rename('ratio');
  var S1_ndratio = VV.subtract(VH).divide(VV.add(VH)).rename('ndratio');

  return VV.addBands([VH, S1_ratio, S1_ndratio]);
}
var s1AscendingPathFinal_ratio = calculateS1Indices_image(s1AscendingPathFinal);
print("s1AscendingPathFinal_ratio", s1AscendingPathFinal_ratio)

baseModule.utils.exportImageAsset(s1AscendingPathFinal_ratio, 's1AscendingFinal_' + yearsList[0], ROI, 10, exportPath + '/s1Ascending_' + yearsList[0]);


//////////////////
// var s1_A_D_Indice_Stack_2022 = s1DescendingFinal_ratio.addBands(s1AscendingPathFinal_ratio)
// print("s1_A_D_Indice_Stack_2022", s1_A_D_Indice_Stack_2022)
// baseModule.utils.exportImageAsset(s1AscendingPathFinal_ratio, 's1AscendingFinal_' + yearsList[0], ROI, 10, exportPath + '/s1Ascending_' + yearsList[0]);
