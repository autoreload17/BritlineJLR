export type VehicleYear = {
  value: string;
  label: string;
};

export type Vehicle = {
  brand: "land-rover" | "jaguar";
  value: string;
  title: string;
  years: VehicleYear[];
};

export const vehiclesData: Vehicle[] = [
  {
    brand: "land-rover",
    value: "DEFENDER-l316",
    title: "DEFENDER / L316",
    years: [{ value: "2007-2016", label: "2007–2016" }],
  },
  {
    brand: "land-rover",
    value: "DISCOVERY4-l319",
    title: "DISCOVERY 4 / L319",
    years: [{ value: "2010-2016", label: "2010–2016" }],
  },
  {
    brand: "land-rover",
    value: "discovery-5-l462",
    title: "DISCOVERY 5 / L462",
    years: [
      { value: "2017-2020", label: "2017–2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "land-rover",
    value: "discovery-sport-l550",
    title: "DISCOVERY SPORT / L550",
    years: [
      { value: "2015-2019", label: "2015-2019" },
      { value: "2020", label: "2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "land-rover",
    value: "freelander-2-l359",
    title: "FREELANDER 2 / L359",
    years: [{ value: "2006-2014", label: "2006-2014" }],
  },
  {
    brand: "land-rover",
    value: "new-defender-2020-l663",
    title: "NEW DEFENDER 2020 / L663",
    years: [{ value: "2020+", label: "2020+" }],
  },
  {
    brand: "land-rover",
    value: "new-range-rover-l460",
    title: "NEW RANGE ROVER / L460",
    years: [{ value: "2022+", label: "2022+" }],
  },
  {
    brand: "land-rover",
    value: "new-range-rover-evoque-l551",
    title: "NEW RANGE ROVER EVOQUE / L551",
    years: [
      { value: "2019-2020", label: "2019-2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "land-rover",
    value: "new-range-rover-sport-l461",
    title: "NEW RANGE ROVER SPORT / L461",
    years: [{ value: "2023+", label: "2023+" }],
  },
  {
    brand: "land-rover",
    value: "range-rover-l322",
    title: "RANGE ROVER / L322",
    years: [{ value: "2010-2012", label: "2010-2012" }],
  },
  {
    brand: "land-rover",
    value: "range-rover-l405",
    title: "RANGE ROVER / L405",
    years: [
      { value: "2013-2016", label: "2013-2016" },
      { value: "2017", label: "2017" },
      { value: "2018-2021", label: "2018-2021" },
    ],
  },
  {
    brand: "land-rover",
    value: "range-rover-evoque-l538",
    title: "RANGE ROVER EVOQUE / L538",
    years: [
      { value: "2012-2015", label: "2012-2015" },
      { value: "2016-2019", label: "2016-2019" },
    ],
  },
  {
    brand: "land-rover",
    value: "range-rover-sport-l320",
    title: "RANGE ROVER SPORT / L320",
    years: [{ value: "2010-2013", label: "2010-2013" }],
  },
  {
    brand: "land-rover",
    value: "range-rover-sport-l494",
    title: "RANGE ROVER SPORT / L494",
    years: [
      { value: "2014-2016", label: "2014-2016" },
      { value: "2017", label: "2017" },
      { value: "2018-2022", label: "2018-2022" },
    ],
  },
  {
    brand: "land-rover",
    value: "range-rover-velar-l560",
    title: "RANGE ROVER VELAR / L560",
    years: [
      { value: "2017-2020", label: "2017-2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "jaguar",
    value: "e-pace",
    title: "E-PACE",
    years: [
      { value: "2017-2020", label: "2017–2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "jaguar",
    value: "f-pace",
    title: "F-PACE",
    years: [
      { value: "2016-2020", label: "2016–2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "jaguar",
    value: "f-type",
    title: "F-TYPE",
    years: [{ value: "2014+", label: "2014+" }],
  },
  {
    brand: "jaguar",
    value: "i-pace",
    title: "I-PACE",
    years: [
      { value: "2018-2020", label: "2018–2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "jaguar",
    value: "xe",
    title: "XE",
    years: [
      { value: "2015-2020", label: "2015-2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "jaguar",
    value: "xf",
    title: "XF",
    years: [
      { value: "2009-2015", label: "2009–2015" },
      { value: "2016-2020", label: "2016-2020" },
      { value: "2021+", label: "2021+" },
    ],
  },
  {
    brand: "jaguar",
    value: "xj",
    title: "XJ",
    years: [
      { value: "2010-2019", label: "2010–2019" },
      { value: "2020+", label: "2020+" },
    ],
  },
];












