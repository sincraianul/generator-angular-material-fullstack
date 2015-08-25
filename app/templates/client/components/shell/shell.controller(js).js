'use strict';

angular.module('<%= scriptAppName %>')
  .controller('ShellCtrl', function ($mdSidenav, $mdDialog, $scope, $location<% if(filters.auth) {%>, Auth<% } %>) {
    // $scope.menu = [{
    //   'title': 'Home',
    //   'link': '/'
    // }];
    //
    // $scope.isCollapsed = true;<% if(filters.auth) {%>
    // $scope.isLoggedIn = Auth.isLoggedIn;
    // $scope.isAdmin = Auth.isAdmin;
    // $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };<% } %>

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    var originatorEv;
    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.notificationsEnabled = true;
    $scope.toggleNotifications = function() {
      $scope.notificationsEnabled = !$scope.notificationsEnabled;
    };

    $scope.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .content('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
        );
      originatorEv = null;
    };

    $scope.checkVoicemail = function() {
      // This never happens.
    };

    $scope.showAddDialog = function($event) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        template: '<md-dialog aria-label="List dialog">' +
        '  <md-dialog-content>' +
        '   <h2 class="md-title">' +
        '      Set a description for the new thing</h2>' +
        '    <form name="projectForm">' +
        '      <md-input-container>' +
        '        <label>Description</label>' +
        '          <input md-maxlength="30" required name="description" ng-model="newThing">' +
        '            <div ng-messages="projectForm.description.$error">' +
        '              <div ng-message="required">This is required.</div>' +
        '                <div ng-message="md-maxlength">The name has to be less than 30 characters long.</div>' +
        '            </div>' +
        '      </md-input-container>' +
        '    </form>' +
        '  </md-dialog-content>' +
        '  <div class="md-actions">' +
        '    <md-button ng-click="closeDialog()" class="md-primary">' +
        '      Cancel' +
        '    </md-button>' +
        '    <md-button ng-click="save()" class="md-primary">' +
        '      Save' +
        '    </md-button>' +
        '  </div>' +
        '</md-dialog>',
        controller: DialogController
      });
    };

    function DialogController($scope, $mdDialog<% if(filters.mongoose) { %>, $http<% } %>) {
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
    }
  });
