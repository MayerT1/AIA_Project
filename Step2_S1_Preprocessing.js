////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////   NASS Crop type mapping
////   Update ROI, Dates of intrest, export path
////   Author T. Mayer 10/12/24; NASA SERVIR, Univeristy of Alabama in Huntsville, and University of Twente ITC
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

var s1Descending =  ee.ImageCollection('COPERNICUS/S1_GRD')
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
            .filter(ee.Filter.eq('instrumentMode', 'IW'));

var s1Ascending = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .filter(ee.Filter.eq('orbitProperties_pass', 'ASCENDING'))
            .filter(ee.Filter.eq('instrumentMode', 'IW'));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////
////  Date Selector
////  Choose dates of intrest, update the export path
////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Do months 5-10 (inclusive) individually
// Do 1 month at a time.
// if multiple month/year is added; baseModule.utils.timePeriodSelector will give you all
var monthsList = [9, 10,11, 12, 1,2,3,4,5, 6,  ];    // <--- INPUT NEEDED: MONTH NUMBER
var yearsList = [2022];

// var dateFormat = yearsList[0] + '-0' + monthsList[0] + '-01';

var dateOfProcess = ee.Date.fromYMD(yearsList[0], monthsList[0], 1);
var endDateOfProcess = dateOfProcess.advance(1, 'month').advance(-1, 'day');
var dateFormat = dateOfProcess.format('YYYY-MM-dd').getInfo();

var exportPath = 'projects/servir-sco-assets/AIA_Project'; //Udated for SCO folder



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////  Descend 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var s1DescendingFinal = ee.ImageCollection(
  baseModule.utils.timePeriodSelector(s1Descending, monthsList, yearsList, ROI)
).sort('system:time_start');

print("s1DescendingFinal", s1DescendingFinal)

// Terrain Correction
s1DescendingFinal = baseModule.s1Correction.radiometricTerrainCorrection(s1DescendingFinal);
// Lee filter
s1DescendingFinal = baseModule.s1Correction.refinedLeeSpeckleFilter(s1DescendingFinal);

// Get a median composite for the filtered image
var s1DescendingFinalImg = s1DescendingFinal.select(['VV', 'VH']).median();
s1DescendingFinalImg = s1DescendingFinalImg.set('system:time_start', dateOfProcess.millis(), 'system:time_end', endDateOfProcess.millis());
print('s1DescendingFinalImg', s1DescendingFinalImg);

// Export Terrain corrected and Lee filtered image
// parameters to the function call are: image, description, region, scale, assetId
baseModule.utils.exportImageAsset(s1DescendingFinalImg, 's1DescendingFinalImg_' + dateFormat, ROI, 10,
exportPath + '/Sentinel1Descending' + yearsList[0] + '/Descending_' + dateFormat);



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////  Ascend 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var s1AscendingFinal = ee.ImageCollection(
  baseModule.utils.timePeriodSelector(s1Ascending, monthsList, yearsList, ROI)
).sort('system:time_start');

// Terrain Correction
s1AscendingFinal = baseModule.s1Correction.radiometricTerrainCorrection(s1AscendingFinal);
// Lee Filter
s1AscendingFinal = baseModule.s1Correction.refinedLeeSpeckleFilter(s1AscendingFinal);

// Get a median composite for the filtered image
var s1AscendingFinalImg = s1AscendingFinal.select(['VV', 'VH']).median();
s1AscendingFinalImg = s1AscendingFinalImg.set('system:time_start', dateOfProcess.millis(), 'system:time_end', endDateOfProcess.millis());
print('s1AscendingFinalImg', s1AscendingFinalImg);

// Export Terrain corrected and Lee filtered image
// parameters to the function call are: image, description, region, scale, assetId
baseModule.utils.exportImageAsset(s1AscendingFinalImg, 's1AscendingFinalImg_' + dateFormat, ROI, 10,
exportPath + '/Sentinel1Ascending' + yearsList[0] + '/Ascending_' + dateFormat);
