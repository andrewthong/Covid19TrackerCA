// Controls the state of the application, sets up correct data information
$(document).ready(() => {

    // on load make GET request to load all info required for index page
    $.ajax({
        url: url + "api/controller/cases.php",
        // url: "http://localhost/Covid19TrackerCA/src/edit/api/controller/cases.php",
        type: "GET",
    }).then(res => {

        makeMap(res);

        // override last update times + death & case count
        $('#updateTime')[0].innerHTML = res["lastUpdate"];
        $('#totalCases')[0].innerHTML = res["totalCases"]["cases"] + " ";
        $('#totalDeath')[0].innerHTML = res["totalCases"]["death"] + " ";

        // get total death sum for canada
        var death_sum = 0;
        res['casesByProvince'].forEach(r => {
            if (r.province in res['deathsByProvince'])
                r['deaths'] = res['deathsByProvince'][r.province];
            else
                r['deaths'] = 0;

            death_sum += (res['deathsByProvince'][r.province]);
        });

        // total infected from canada
        $('#infectedPerCanada')[0].innerHTML = Math.round((parseInt(res["totalCases"]["cases"]) / parseInt(res["casePerPopulation"]["Canada"]) * 100)) / 100;

        // calculate deaths & cases per province
        var casesByProvince = {};
        res["totalCaseProvince"].forEach(r => {
            casesByProvince[r.province] = r;
            casesByProvince[r.province]["cases"] = parseInt(casesByProvince[r.province]["cases"]);
            casesByProvince[r.province]["deaths"] = parseInt(casesByProvince[r.province]["deaths"]);
        })

        var provinceMap = {};
        var casesTodayTotal = 0;
        var deathsTodayTotal = 0;
        res["dailyCaseDeath"].forEach(r => {
            provinceMap[r['province']] = {
                'cases': parseInt(r['cases']),
                'deaths': parseInt(r['deaths'])
            }
            casesTodayTotal += parseInt(r['cases']);
            deathsTodayTotal += parseInt(r['deaths']);

        })

        // update total case by providence per 100,00

        for (var province in casesByProvince) {
            var calc = Math.round((parseFloat(casesByProvince[province]["cases"]) / parseFloat(res["casePerPopulation"][province]) * 100)) / 100;
            if (isNaN(calc))
                calc = 0;

            // TODO: this one errors out, we need to fix
            if (province == "Northwest Territories")
                calc = 2.44;

            var deathsToday = "";
            var casesToday = "";

            if (province in provinceMap) {
                if (provinceMap[province].cases > 0)
                    casesToday = " (+" + provinceMap[province].cases + " today)";

                if (provinceMap[province].deaths > 0)
                    deathsToday = " (+" + provinceMap[province].deaths + " today)";
            }

            // append data to row
            $('#totalCasesProvinceTable').append(
                "<tr>" +
                "<td>" + province + "</td>" +
                "<td><b><i>" + casesByProvince[province]["cases"] + casesToday + "</i></b></td>" +
                "<td>" + calc + "</td>" +
                "<td><b><i>" + casesByProvince[province]["deaths"] + deathsToday + "</i></b></td>" +
                "<td><a href='" + casesByProvince[province]["source"] + "'>Source</a></td>" +
                "</tr>"
            )
        }

        $('#totalCasesCanada')[0].innerHTML = res["totalCases"]["cases"] + " (+" + casesTodayTotal + " today)";

        $('.death_total')[0].innerHTML = res["totalCases"]["death"] + " (+" + deathsTodayTotal + " today)";

        // draw 3 main graphs
        lineGraph(res["cumulativeCases"], "#cumulativeCaseChart", true);
        lineGraph(res["dailyCases"], "#dailyCaseChart", false);
        barGraph(res["totalCaseProvince"], "#provinceCasesChart");

        // update datatable of individual Cases
        $('#individualCaseTable').dataTable({
            "order": [
                [0, "desc"]
            ],
            "data": res["individualCases"],
            "columns": [{
                    "data": "id"
                }, {
                    "data": "dte"
                }, {
                    "data": "province"
                }, {
                    "data": "city"
                }, {
                    "data": "age"
                }, {
                    "data": "travel_history"
                }, {
                    "data": "confirmed_presumptive"
                },
                {
                    "data": "source",
                    "render": (data, type, row, meta) => {
                        if (type === 'display')
                            data = '<a href="' + data + '">Source</a>';

                        return data;
                    }
                }
            ]
        });
    }, err => {
        console.log(err)
    })

});

function goAdvanced() {
    window.location.href = url + "advanced.html";
}

function goCases() {
    window.location.href = "https://docs.google.com/spreadsheets/d/1e0QhkGT3XzJJh7l7EfUkK3be-81TawOEqO3JHMD8Y8s/edit?usp=sharing";
}