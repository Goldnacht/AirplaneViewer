/**
 * Created by Frederik Eschmann
 */
var APViewer = APViewer || {};

APViewer.config = {
	/* Map */
	map_view_center: [9.205604, 48.687524],
	map_view_zoom: 8,
	map_view_max_zoom: 11,
	
	/* Flightdata-Server */
	keyserver: "http://flugmon-it.hs-esslingen.de",
	
	/* Airports */
	airports_source: "airports.json",
	airports_image: "images/Airport.png",
	airports_image_select: "images/Airport_click.png",
	airports_image_hover: "images/Airport_hover.png",
	
	/* Airplanes */
	airplane_timeout: 240000,
	airplane_image: "images/Airplane.png",
	airplane_image_select: "images/Airplane_click.png",
	airplane_image_hover: "images/Airplane_hover.png",
	airplane_image_NH: "images/AirplaneNHp.png",
	airplane_image_NH_select: "images/AirplaneNHp_click.png",
	airplane_image_NH_hover: "images/AirplaneNHp_hover.png",
	
	/* Layer-Chooser */
	chooser_image_sat: "images/layer_sat.png",
	chooser_image_map: "images/layer_map.png",
	
	/* Update-Timer */
	timer_getNewAirplanes: 10000,
	timer_updateAirplanes: 5000,
	timer_displayAirplanes: 1000
};