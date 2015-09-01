'use strict'

angular.module '<%= scriptAppName %>'
.controller 'MainCtrl', ($scope, $http<% if(filters.socketio) { %>, socket<% } %>) ->
  $scope.awesomeThings = []

  $scope.getColor = ($index) ->
    _d = ($index + 1) % 11
    bg = ''
    switch _d
      when 1
        bg = 'red'
      when 2
        bg = 'green'
      when 3
        bg = 'darkBlue'
      when 4
        bg = 'blue'
      when 5
        bg = 'yellow'
      when 6
        bg = 'pink'
      when 7
        bg = 'darkBlue'
      when 8
        bg = 'purple'
      when 9
        bg = 'deepBlue'
      when 10
        bg = 'lightPurple'
      else
        bg = 'yellow'
        break
    bg

  $scope.getSpan = ($index) ->
    _d = ($index + 1) % 11
    if _d == 1 or _d == 5
      return 2
    return

  $http.get('/api/things').success (awesomeThings) ->
    $scope.awesomeThings = awesomeThings
    <% if(filters.socketio) { %>
    socket.syncUpdates 'thing', $scope.awesomeThings
   <% } %>
<% if(filters.mongoose) { %>
  $scope.addThing = ->
    return if $scope.newThing is ''
    $http.post '/api/things',
      name: $scope.newThing

    $scope.newThing = ''

  $scope.deleteThing = (thing) ->
    $http.delete '/api/things/' + thing._id<% } %><% if(filters.socketio) { %>

  $scope.$on '$destroy', ->
    socket.unsyncUpdates 'thing'<% } %>
