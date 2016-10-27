'use strict';

var app = angular.module("VisitApp", []);
app.controller("VisitsController", ["$http", function($http) {
  var vm = this;
  $http.get("http://localhost:3000")
  .then(function(data) {
    vm.visits = data.data;
    console.log(vm.visits);
    vm.calculate();
    vm.sortVisits();
  })
  .catch(function(err) {
    console.log(err);
  });
  vm.sortVisits = function() {
    vm.visits.sort(function(a, b) {
      return b.count - a.count;
    });
  };
  vm.calculate = function() {
    vm.total = 0;
    for (var i = 0; i < vm.visits.length; i++) {
      vm.total += vm.visits[i].count;
    }
    vm.total /= vm.visits.length;
  }
}]);
