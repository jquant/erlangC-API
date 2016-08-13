var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//CallDuration = 190;
//IntervalLength = 30;
//Agents = 0;
//Calls = 0;

function OptimalStaff(calls, serviceLevel, callDuration, intervalLength) {
    i = 0;

    serviceLevel = -(calls * (1 - serviceLevel));

    for (i = 0; i <= 500; i++) {
        agents = i;
        var immediate = ImmediateAnswer(calls, agents, callDuration, intervalLength);
        var ok = 1;
        if (immediate > serviceLevel) {
            return i - 1;
        }
    }
}

function AverageSpeedOfAnswer(calls, agents, callDuration, intervalLength) {
    var erlang = ErlangC(calls, agents, callDuration, intervalLength)
    var trafficIntensity = TrafficIntensity(calls, intervalLength, callDuration);

    return Math.round((erlang * (callDuration) / (agents * (1 - (trafficIntensity / agents)))) * 100) / 100;
}

function ImmediateAnswer(calls, agents, callDuration, intervalLength) {
    return Math.round((1 - ErlangC(calls, agents, callDuration, intervalLength) * 100) * 100) / 100;
}

function ErlangC(calls, agents, callDuration, intervalLength) {

    var trafficIntensity = TrafficIntensity(calls, intervalLength, callDuration);

    return Poisson(agents, trafficIntensity) / (Poisson(agents, trafficIntensity) + (1 - (trafficIntensity / agents)) * PoissonCumul(agents - 1, trafficIntensity));
}

function TrafficIntensity(calls, intervalLength, callDuration) {
    return (calls / (intervalLength)) * (callDuration);
}

//function AgentOccupancy(calls, agents, callDuration, intervalLength) {
//    return TrafficIntensity(calls, intervalLength, callDuration) / agents;
//}

function Poisson(IdealSuccesses, TheMean) {
    Numerator = 0;
    Denominator = 0;
    if (IdealSuccesses <= 0) {
        return 0
    } else {
        Numerator = Math.pow(TheMean, IdealSuccesses) * (Math.pow(Math.E, (TheMean * -1)));
        Denominator = Factorial(IdealSuccesses);
        return Numerator / Denominator;
    }
}

function PoissonCumul(IdealSuccesses, TheMean) {
    daReturn = 0;
    i = 0;
    for (i = 0; i <= IdealSuccesses; i++) {
        daReturn = daReturn + Poisson(i, TheMean);
    }
    return daReturn;
}

function Factorial(Input) {
    if (Input == 0) {
        return 1
    } else {
        return Input * Factorial(Input - 1);
    }
}

app.post('/AverageSpeedOfAnswer', function (req, res) {
    if (req.body.data) {
        // var data = JSON.parse(req.body.otherStuff);
        var data = req.body;

        var calls = data.calls;
        var serviceLevel = data.serviceLevel;
        var callDuration = data.callDuration;
        var intervalLength = data.intervalLength;

        if (calls && serviceLevel && callDuration && intervalLength) {

            var result = AverageSpeedOfAnswer(calls, serviceLevel, callDuration, intervalLength);

        }
        else {
            var result = { "answer": "not enough data" };
        }

        res.json(result);

    }
    else {

        var result = { "answer": "no data" };
        res.json(result);
    }
})

app.post('/OptimalStaff', function (req, res) {
    if (req.body) {
        // var data = JSON.parse(req.body.otherStuff);
        var data = req.body;

        var calls = data.calls;
        var serviceLevel = data.serviceLevel;
        var callDuration = data.callDuration;
        var intervalLength = data.intervalLength;


        if (calls && serviceLevel && callDuration && intervalLength) {

            var result = OptimalStaff(calls, serviceLevel, callDuration, intervalLength);

        }
        else {
            var result = { "answer": "not enough data" };
        }

        res.json(result);

    }
    else {
        var okok = req.body.data;
        var test = req.body;
        var result = { "answer": "no data" };
        res.json(result);
    }
})

var server = app.listen(5080, function () {

    var host = server.address().address
    var port = server.address().port
    console.log("Listening at http://%s:%s", host, port)

})
