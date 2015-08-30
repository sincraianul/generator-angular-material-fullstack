'use strict';

angular.module('<%= scriptAppName %>')
  .controller('DialogController', function ($scope, $mdDialog<% if(filters.mongoose) { %>, $http<% } %>) {
  $scope.closeDialog = function() {
    $mdDialog.hide();
  };

  <% if(filters.mongoose) { %>
  $scope.addThing = function() {
    if($scope.newThing === '') {
      return;
    }
    $http.post('/api/things', { name: $scope.newThing });
    $scope.newThing = '';
    $mdDialog.hide();
  };<% } %>
});
