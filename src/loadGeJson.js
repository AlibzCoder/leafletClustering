const URL = 'https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10';
export const getGeJson = () => fetch(URL).then(res => res.json());
