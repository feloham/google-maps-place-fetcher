angular.module('starter', ['ionic'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }


        })
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('map', {
                url: '/',
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            });

        $urlRouterProvider.otherwise("/");

    })

    .factory('PlaceManager', function () {

        var places = [];

        function insertPlace(item) {
            places.push(item);
        }

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

    .factory('GoogleMaps', function (PlaceManager) {

        var apiKey = false;
        var map = null;

        function initMap() {

            var options = {timeout: 10000, enableHighAccuracy: true};

            var latLng = new google.maps.LatLng(41, 29);

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

            google.maps.event.addListener(drawingManager, 'rectanglecomplete', function (rectangle) {
                drawingManager.setOptions({drawingControl: false})
                drawingManager.setDrawingMode(null);

                var places = new google.maps.places.PlacesService(map);

                bounds = rectangle.getBounds();
                southWest = bounds.getSouthWest();
                northEast = bounds.getNorthEast();

                tileWidth = (northEast.lng() - southWest.lng()) / 2;
                tileHeight = (northEast.lat() - southWest.lat()) / 2;

                for (x = 0; x < 2; x++) {
                    for (y = 0; y < 2; y++) {
                        var x1 = southWest.lat() + (tileHeight * x);
                        var y1 = southWest.lng() + (tileWidth * y);
                        var x2 = x1 + tileHeight;
                        var y2 = y1 + tileWidth;

                        var tempCell = new google.maps.LatLngBounds(new google.maps.LatLng(x1, y1), new google.maps.LatLng(x2, y2));

                        setTimeout(function () {

                        }, 100);
                        places.radarSearch({
                            bounds: tempCell,
                            // https://developers.google.com/places/documentation/supported_types
                            types: [
                                // Until there's enough meta data for Google,
                                // they label everything as an 'establishment'.
                                'establishment'
                            ]
                        }, function (results, status) {
                            if (status == google.maps.places.PlacesServiceStatus.OK) {

                                for (var i = 0; i < results.length; i++) {
                                    var placeLoc = results[i].geometry.location;
                                    var place = results[i]
                                    var marker = new google.maps.Marker({
                                        map: map,
                                        position: placeLoc
                                    });

                                    PlaceManager.insert(place);
                                    service = new google.maps.places.PlacesService(map);


                                    google.maps.event.addListener(marker, 'click', function () {
                                        var infoWindow = new google.maps.InfoWindow();
                                        // infoWindow.setContent(name);
                                        //infoWindow.open(map, this);
                                        service.getDetails(place, function (result, status) {
                                            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                                                console.error(status);
                                                return;
                                            }
                                            infoWindow.setContent(result.name);
                                            infoWindow.open(map, marker);

                                        });

                                    });
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

    .controller('MapCtrl', function ($scope, $state, $window, $ionicPopup, $interval, GoogleMaps, PlaceManager) {
        GoogleMaps.init();

        $scope.download = function () {
            PlaceManager.getPlaces();
        }

        $scope.reloadRoute = function () {
            $window.location.reload();
        }

        $interval(function () {
            $scope.placeCount = PlaceManager.getCount();
        }, 100);

        $ionicPopup.alert({
            title: 'User Guide',
            template: 'Draw a rectangle and wait until all places are gathered. <br> You can download places as JSON or check on the map.'
        });

    });