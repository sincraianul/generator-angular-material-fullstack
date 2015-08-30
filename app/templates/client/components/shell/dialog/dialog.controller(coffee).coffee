  'use strict'

  angular.module '<%= scriptAppName %>'
  .controller 'DialogController', ($scope, $mdDialog<% if(filters.mongoose) {%>, $http<% } %>) ->

    $scope.closeDialog = ->
      $mdDialog.hide()
      return

<% if(filters.mongoose) { %>
    $scope.addThing = ->
      return if $scope.newThing is ''
      $http.post '/api/things',
        name: $scope.newThing

      $scope.newThing = ''
<% } %>
