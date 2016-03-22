angular.module('starter', ['ionic'])

    // Start application
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        })
    })

    // Configuration for app
    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('map', {
                url: '/',
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            });

        $urlRouterProvider.otherwise("/");

    })

    // Place manager factory
    .factory('PlaceManager', function () {

        // All places
        var places = [];

        // Insert into place
        function insertPlace(item) {
            places.push(item);
        }

        // Get places
        function get() {
            return places;
        }

        return {
            insert: function (item) {
                insertPlace(item)
            },
            getPlaces: function () {
                console.save(JSON.stringify(get()), "places.json");
            },
            getCount: function () {
                return places.length;
            }
        }
    })

    // Google Maps factory
    .factory('GoogleMaps', function (PlaceManager, $ionicLoading) {

        var map = null;

        // Initialize map
        function initMap() {

            $ionicLoading.show();
            var options = {timeout: 10000, enableHighAccuracy: true};

            var latLng = new google.maps.LatLng(41, 29); // Istanbul
            navigator.geolocation.getCurrentPosition(function (pos) {
                var latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                $ionicLoading.hide();
            }, function (error) {
                console.log("Couldn't get your current location!")
                $ionicLoading.hide();
            });

            var mapOptions = {
                center: latLng,
                zoom: 7,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false,
                mapTypeControl: false
            };

            map = new google.maps.Map(document.getElementById("map"), mapOptions);

            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.MARKER,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.RECTANGLE
                    ]

                },
                rectangleOptions: {editable: false}
            });
            drawingManager.setMap(map);

            // Start when rectangle is drawn
            google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {
                drawingManager.setOptions({drawingControl: false})
                drawingManager.setDrawingMode(null);

                var places = new google.maps.places.PlacesService(map);

                bounds = rectangle.getBounds();
                southWest = bounds.getSouthWest();
                northEast = bounds.getNorthEast();
                tileWidth = (northEast.lng() - southWest.lng()) / 3;
                tileHeight = (northEast.lat() - southWest.lat()) / 3;

                for (x = 0; x < 3; x++) {
                    for (y = 0; y < 3; y++) {
                        var x1 = southWest.lat() + (tileHeight * x);
                        var y1 = southWest.lng() + (tileWidth * y);
                        var x2 = x1 + tileHeight;
                        var y2 = y1 + tileWidth;

                        var tempCell = new google.maps.LatLngBounds(new google.maps.LatLng(x1, y1), new google.maps.LatLng(x2, y2));

                        places.search({
                            bounds: tempCell,
                            types: [
                                'establishment'
                            ]
                        }, function (results, status, pagination) {
                            if (status == google.maps.places.PlacesServiceStatus.OK) {

                                for (var i = 0; i < results.length; i++) {
                                    var placeLoc = results[i].geometry.location;
                                    var place = results[i];
                                    var marker = new google.maps.Marker({
                                        map: map,
                                        position: placeLoc
                                    });

                                    PlaceManager.insert(place);

                                    google.maps.event.addListener(marker, 'click', function () {
                                        var infoWindow = new google.maps.InfoWindow();
                                            infoWindow.setContent(place.name);
                                            infoWindow.open(map, marker);

                                    });
                                }

                                if(pagination.hasNextPage){
                                    pagination.nextPage();
                                }
                            }
                            else {
                                console.log("Error: " + status)
                            }

                        });
                    }
                }


            });

        }


        return {
            init: function () {
                initMap();
            }

        }

    })

    // Map controller
    .controller('MapCtrl', function ($scope, $window, $ionicPopup, $ionicLoading, $interval, GoogleMaps, PlaceManager) {

        GoogleMaps.init();

        // Download places as JSON
        $scope.download = function () {
            PlaceManager.getPlaces();
        }

        // Reload the page
        $scope.reloadPage = function () {
            $window.location.reload();
        }

        // Check four counts with interval
        $interval(function () {
            $scope.placeCount = PlaceManager.getCount();
        }, 100);

        // Alert at startup
        $ionicPopup.alert({
            title: 'User Guide',
            template: 'Draw a rectangle and wait until all places are gathered. <br> You can download places as JSON or check on the map.'
        });

    });