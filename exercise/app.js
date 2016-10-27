'use strict';

var app = angular.module("GamedayApp", []);
app.controller('GamedayController', ['$http', function($http) {
  var vm = this;
  vm.visits = [];
  vm.allGames = [];
  vm.days = [];
  vm.teams = [];
  vm.visitCount = [];

  vm.identifyVisits = function(innings, teams) {
    for (var i = 0; i < innings.length; i++) {
      var top = innings[i].top;
      var bottom = innings[i].bottom;
      if (top.action) {
        for (var j = 0; j < top.action.length; j++) {
          if (top.action[j].des.toLowerCase().includes("coaching visit")) {
            top.action[j].team = teams[1];
            vm.visits.push(top.action[j]);
          }
        }
      }
      if (bottom.action) {
        for (var j = 0; j < bottom.action.length; j++) {
          if (bottom.action[j].des.toLowerCase().includes("coaching visit")) {
            bottom.action[j].team = teams[0];
            vm.visits.push(bottom.action[j]);
          }
        }
      }
    }
  };

  vm.getAllDays = function() {
    var today = new Date();
    var date_day = today.getDate();
    var date_month = today.getMonth() + 1;
    for (var i = 1; i < date_month + 1; i++) {
      var month = "";
      if (i < 10) {
        month = "0" + i;
      }
      else {
        month = i;
      }
      var numberOfDays = 31;
      if (i === 2) {
        numberOfDays = 28;
      }
      else if (i === 4 || i === 6 || i === 9 || i === 11) {
        numberOfDays = 30;
      }
      if (i === date_month) {
        numberOfDays = date_day;
      }
      for (var j = 1; j < numberOfDays + 1; j++) {
        if (j < 10) {
          vm.days.push($http.get("http://gd2.mlb.com/components/game/mlb/year_2016/month_" + month + "/day_0" + j + "/miniscoreboard.json"));
        }
        else {
          vm.days.push($http.get("http://gd2.mlb.com/components/game/mlb/year_2016/month_" + month + "/day_" + j + "/miniscoreboard.json"));
        }
      }
    }
  };

  vm.getAllGames = function() {
      Promise.all(vm.days)
      .then(function(data) {
        for (var i = 0; i < data.length; i++) {
          var todaysGames = data[i].data.data.games.game;
          if (todaysGames) {
            if (todaysGames.length === undefined) {
              todaysGames = [todaysGames];
            }
            for (var j = 0; j < todaysGames.length; j++) {
              if (todaysGames[j].game_type === "R" && todaysGames[j].status === "Final") {
                vm.allGames.push($http.get("http://gd2.mlb.com/" + todaysGames[j].game_data_directory + "/game_events.json"));
              }
            }
          }
        }
        return Promise.all(vm.allGames);
      })
      .then(function(data) {
        for (var i = 0; i < data.length; i++) {
          var theseTeams = vm.identifyTeams(data[i].config.url);
          vm.identifyVisits(data[i].data.data.game.inning, theseTeams);
        }
        for (i = 0; i < vm.visits.length; i++) {
          var found = false;
          for (var j = 0; j < vm.visitCount.length; j++) {
            if (vm.visitCount[j].team === vm.visits[i].team) {
              vm.visitCount[j].count++;
              found = true;
            }
          }
          if (!found) {
            vm.visitCount.push({
              team: vm.visits[i].team,
              count: 1
            });
          }
        }
        return $http.post("http://localhost:3000", vm.visitCount);
      })
      .catch(function(err) {
        console.log(err);
      });
  };



  vm.getAllDays();

  vm.url = "http://gd2.mlb.com//components/game/mlb/year_2016/month_10/day_02/gid_2016_10_02_detmlb_atlmlb_1/game_events.json";
  vm.identifyTeams = function(url) {
    var theseTeams = [];
    for (var i = 0; i < url.length; i++) {
      if (url[i] === "_" && url[i + 4] === "m" && url[i + 5] === "l" && url[i + 6] === "b") {
        theseTeams.push(url[i + 1] + url[i + 2] + url[i + 3]);
      }
    }
    return theseTeams;
  };

  vm.getAllGames();


}]);
