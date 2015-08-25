'use strict'

angular.module '<%= scriptAppName %>'
.controller 'ShellCtrl', ($scope, $location<% if(filters.auth) {%>, Auth<% } %>) ->
  # $scope.menu = [
  #   title: 'Home'
  #   link: '/'
  # ]
  # $scope.isCollapsed = true<% if(filters.auth) {%>
  # $scope.isLoggedIn = Auth.isLoggedIn
  # $scope.isAdmin = Auth.isAdmin
  # $scope.getCurrentUser = Auth.getCurrentUser
  #
  $scope.logout = ->
    Auth.logout()
    $location.path '/login'<% } %>

  $scope.isActive = (route) ->
    route is $location.path()

  DialogController = ($scope, $mdDialog<% if(filters.mongoose) {%>, $http<% } %>) ->

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

    return

  $scope.toggleLeft = ->
    $mdSidenav('left').toggle()
    return

  originatorEv = undefined

  $scope.openMenu = ($mdOpenMenu, ev) ->
    originatorEv = ev
    $mdOpenMenu ev
    return

  $scope.notificationsEnabled = true

  $scope.toggleNotifications = ->
    $scope.notificationsEnabled = !$scope.notificationsEnabled
    return

  $scope.redial = ->
    $mdDialog.show $mdDialog.alert().targetEvent(originatorEv).clickOutsideToClose(true).parent('body').title('Suddenly, a redial').content('You just called a friend; who told you the most amazing story. Have a cookie!').ok('That was easy')
    originatorEv = null
    return

  $scope.checkVoicemail = ->
    # This never happens.
    return

  $scope.showAddDialog = ($event) ->
    parentEl = angular.element(document.body)
    $mdDialog.show
      parent: parentEl
      targetEvent: $event
      template: '<md-dialog aria-label="List dialog">' + '  <md-dialog-content>' + '   <h2 class="md-title">' + '      Set a description for the new thing</h2>' + '    <form name="projectForm">' + '      <md-input-container>' + '        <label>Description</label>' + '          <input md-maxlength="30" required name="description" ng-model="project.description">' + '            <div ng-messages="projectForm.description.$error">' + '              <div ng-message="required">This is required.</div>' + '                <div ng-message="md-maxlength">The name has to be less than 30 characters long.</div>' + '            </div>' + '      </md-input-container>' + '    </form>' + '  </md-dialog-content>' + '  <div class="md-actions">' + '    <md-button ng-click="closeDialog()" class="md-primary">' + '      Cancel' + '    </md-button>' + '    <md-button ng-click="save()" class="md-primary">' + '      Save' + '    </md-button>' + '  </div>' + '</md-dialog>'
      controller: DialogController
    return
