"use strict";

const fs = require("fs");
const path = require("path");

const fp = require("lodash/fp").convert({ cap: false });

const districts = {
    ANTR: "ANTN",
    CFER: "ANTN",
    NABB: "ANTN",
    ARMA: "ARBC",
    BANB: "ARBC",
    CRAI: "ARBC",
    ARDS: "ARND",
    NDOW: "ARND",
    BELE: "BELC",
    BELS: "BELC",
    BELN: "BELC",
    BELW: "BELC",
    BMON: "CCGL",
    COLE: "CCGL",
    LIMA: "CCGL",
    MOYL: "CCGL",
    FOYL: "DCST",
    STRB: "DCST",
    FERM: "FERO",
    OMAG: "FERO",
    LISB: "LISC",
    CREA: "LISC",
    BMEN: "MEAN",
    LARN: "MEAN",
    COOK: "MIDU",
    MFEL: "MIDU",
    DAST: "MIDU",
    NEWM: "NEMD",
    DOWN: "NEMD"
};

const convertDistrictNames = e => ({ properties: {
    ...e.properties,
    a_District: districts[e.properties.a_dcu]
}});

const collisions = [
    fp.map(convertDistrictNames)(require("./collisions_2013.json").features),
    fp.map(convertDistrictNames)(require("./collisions_2014.json").features),
    require("./collisions_2015.json").features,
    require("./collisions_2016.json").features
];

const countCasualties = (p, c) => p += c.properties.a_cas;
const formatCrashes = e => ({
    time: `${e.properties.a_hour}:${e.properties.a_min}`,
    weekday: e.properties.a_wkday,
    gender: e.properties.a_type,
    month: e.properties.a_month,
    speed: e.properties.a_speed,
    weather: e.properties.a_weat
});

const groupByDistrict = e => e.properties.a_District;
const formatDistricts = (v, k) => ({
    district: k,
    casualtyTotal: fp.reduce(countCasualties, 0)(v),
    crashes: fp.map(formatCrashes)(v)
});

const doTheThing = fp.compose(
    fp.map(formatDistricts),
    fp.groupBy(groupByDistrict)
);

const doTheYearThing = e => doTheThing(e);

fs.writeFileSync(path.join(__dirname, "formatted.json"), JSON.stringify(fp.map(doTheYearThing)(collisions)));
