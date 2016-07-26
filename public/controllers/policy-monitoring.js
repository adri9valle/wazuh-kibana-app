// Require config
var app = require('ui/modules').get('app/wazuh', []);

app.controller('pmController', function ($scope, alertify, sharedProperties, DataFactory, $location) {
    //Initialisation
    $scope.load = true;
    var objectsArray = [];

    $scope.events = [];
    $scope.agents = [];
    $scope.search = '';

    $scope.agentId = '000';
    $scope.menuNavItem = 'policy_monitoring';
    //Print Error
    var printError = function (error) {
        alertify.delay(10000).closeLogOnClick(true).error(error.html);
    }

    //Functions

        $scope.eventsObj = {
        //Obj with methods for virtual scrolling
        getItemAtIndex: function (index) {
            if ($scope._eblocked) {
                return null;
            }
            var _pos = index - DataFactory.getOffset(objectsArray['/rootcheck']);
            if ((_pos > 25) || (_pos < 0)) {
                $scope._eblocked = true;
                DataFactory.scrollTo(objectsArray['/rootcheck'], index)
                    .then(function (data) {
                        $scope.events.length = 0;
                        $scope.events = data.data.items;
                        $scope._eblocked = false;
                    }, printError);
            } else {
                return $scope.events[_pos];
            }
        },
        getLength: function () {
            return DataFactory.getTotalItems(objectsArray['/rootcheck']);
        },
    };

    $scope.setStatusFilter = function (status) {
        if ($scope.statusFilter == status) {
            $scope.statusFilter = 'all';
        } else {
            $scope.statusFilter = status;
        }

        $scope.getEvents({'status': $scope.statusFilter});
    };

    $scope.loadDiscover = function (event) {
        var _filter = 'full_log:"' + event + '"';
        sharedProperties.setProperty('aa//' + _filter);
        $location.path('/discover');
    };

    $scope.loadDashboard = function (event) {
        var _filter = 'full_log:"' + event + '"';
        sharedProperties.setProperty('ad//' + _filter);
        $location.path('/compliance/dashboard');
    };

    $scope.getEvents = function (body) {
        if (!body) {
            var tmpBody = DataFactory.getBody(objectsArray['/rootcheck']);
            if ($scope.search !== tmpBody['search']) {
                tmpBody['search'] = $scope.search;
                body = tmpBody;
            }
        } else if ($scope.search !== body['search']) {
            body['search'] = $scope.search;
        }
        if (body['search'] === '') {
            body['search'] = undefined;
        }

        if (!body) {
            DataFactory.get(objectsArray['/rootcheck'])
                .then(function (data) {
                    $scope.events.length = 0;
                    $scope.events = data.data.items;
                }, printError);
        } else {
            DataFactory.get(objectsArray['/rootcheck'], body)
                .then(function (data) {
                    $scope.events.length = 0;
                    $scope.events = data.data.items;
                }, printError);
        }
    };

    $scope.agentsObj = {
        //Obj with methods for virtual scrolling
        getItemAtIndex: function (index) {
            if ($scope.blocked) {
                return null;
            }
            var _pos = index - DataFactory.getOffset(objectsArray['/agents']);
            if ((_pos > 15) || (_pos < 0)) {
                $scope.blocked = true;
                DataFactory.scrollTo(objectsArray['/agents'], index)
                    .then(function (data) {
                        $scope.agents.length = 0;
                        $scope.agents = data.data.items;
                        $scope.blocked = false;
                    }, printError);
            } else {
                return $scope.agents[_pos];
            }
        },
        getLength: function () {
            return DataFactory.getTotalItems(objectsArray['/agents']);
        },
    };

    $scope.hasPrevEvents = function () {
        return DataFactory.hasPrev(objectsArray['/rootcheck']);
    };
    $scope.prevEvents = function () {
        DataFactory.prev(objectsArray['/rootcheck'])
            .then(function (data) {
                $scope.events.length = 0;
                $scope.events = data.data.items;
            }, printError);
    };

    $scope.hasNextEvents = function () {
        return DataFactory.hasNext(objectsArray['/rootcheck']);
    };
    $scope.nextEvents = function () {
        DataFactory.next(objectsArray['/rootcheck'])
            .then(function (data) {
                $scope.events.length = 0;
                $scope.events = data.data.items;
            }, printError);
    };

    $scope.getStatusClass = function (status) {
        if (status === 'resolved') {
            return "statusGreen";
        } else {
            return "statusRed";
        }
    };

    $scope.searchAgent = function () {
        if ($scope.searchAgents === '') {
            $scope.searchAgents = undefined;
        }
        DataFactory.get(objectsArray['/agents'], { search: $scope.searchAgents })
            .then(function (data) {
                $scope.agents.length = 0;
                $scope.agents = data.data.items;
            }, printError);
    };

    $scope.getAgents = function () {
        DataFactory.get(objectsArray['/agents'])
            .then(function (data) {
                $scope.agents.length = 0;
                $scope.agents = data.data.items;
            }, printError);
    };

    $scope.hasNextAgents = function () {
        return DataFactory.hasNext(objectsArray['/agents']);
    };
    $scope.nextAgents = function () {
        DataFactory.next(objectsArray['/agents'])
            .then(function (data) {
                $scope.agents.length = 0;
                $scope.agents = data.data.items;
            }, printError);
    };

    $scope.hasPrevAgents = function () {
        return DataFactory.hasPrev(objectsArray['/agents']);
    };
    $scope.prevAgents = function () {
        DataFactory.prev(objectsArray['/agents'])
            .then(function (data) {
                $scope.agents.length = 0;
                $scope.agents = data.data.items;
            }, printError);
    };

    $scope.cleandb = function () {
        alertify.confirm("Are you sure you want to delete the rootcheck database in all the agents?", function () {
            DataFactory.getAndClean('delete', '/rootcheck', {})
                .then(function (data) {
                    alertify.delay(10000).closeLogOnClick(true).success('Rootcheck database deleted successfully.');
                }, printError);
        });
    };

    $scope.startrc = function () {
        alertify.confirm("Are you sure you want to start a scan on all the agents?", function () {
            DataFactory.getAndClean('put', '/rootcheck', {})
                .then(function (data) {
                    alertify.delay(10000).closeLogOnClick(true).success('Rootcheck started successfully.');
                }, printError);
        });
    };

    $scope.isSetAgentFilter = function (id) {
        return ($scope.agentId === id);
    };

    $scope.setAgentFilter = function (id) {
        if (id != $scope.agentId) {
            $scope.statusFilter = '';
            $scope.agentId = id;
            DataFactory.initialize('get', '/rootcheck/' + id, {}, 30, 0)
                .then(function (data) {
                    objectsArray['/rootcheck'] = data;
                    $scope.getEvents();
                }, printError);
        }
    };

    $scope.getAgentStatusClass = function (agentStatus) {
        if (agentStatus == "Active")
            return "green"
        else if (agentStatus == "Disconnected")
            return "red";
        else
            return "red";
    };

    var load = function () {
        var _agent = '000';
        var _init = sharedProperties.getProperty();
        if ((_init != '') && (_init.substring(0, 4) == 'rc//')) {
            _agent = _init.substring(4);
            sharedProperties.setProperty('');
            $scope.agentId = _agent;
        }
        $scope.agentId = _agent;

        DataFactory.initialize('get', '/rootcheck/'+_agent, {}, 30, 0)
            .then(function (data) {
                objectsArray['/rootcheck'] = data;
                DataFactory.initialize('get', '/agents', {}, 30, 0)
                    .then(function (data) {
                        objectsArray['/agents'] = data;
                        load_data();
                    }, printError);
            }, printError);
    };

    var load_data = function () {
        DataFactory.get(objectsArray['/rootcheck'])
            .then(function (data) {
                $scope.events = data.data.items;
                DataFactory.get(objectsArray['/agents'])
                    .then(function (data) {
                        $scope.agents = data.data.items;
                        $scope.load = false;
                    });
            }, printError);
    };

    //Load
    load();

    //Destroy
    $scope.$on("$destroy", function () {
        angular.forEach(objectsArray, function (value) {
            DataFactory.clean(value)
        });
        $scope.events.length = 0;
        $scope.agents.length = 0;
    });

})
